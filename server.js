// Add dotenv config at the very top
require('dotenv').config();

/*
CSC3916 HW4
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');
var mongoose = require('mongoose');
// Import the analytics module
var analytics = require('./analytics');
// Import the MongoDB aggregation patterns
var mongoAggregations = require('./MongoDB_Aggregation');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Enhanced CORS configuration
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

// Search movies by title, genre, or actor name - PLACING THIS ROUTE FIRST FOR PROPER ROUTING
router.route('/movies/search')
    .post(authJwtController.isAuthenticated, function (req, res) {
        console.log('POST /movies/search - Searching for movies with MongoDB aggregation');
        
        if (!req.body.search) {
            return res.status(400).json({ success: false, message: 'Please provide a search term' });
        }
        
        const searchTerm = req.body.search;
        const searchRegex = new RegExp(searchTerm, 'i');
        
        // IMPORTANT: Extra credit search functionality with aggregation
        // Search by title, genre, or actor name
        const aggregate = [
            {
                $match: {
                    $or: [
                        { title: searchRegex },
                        { genre: searchRegex },
                        { 'actors.actorName': searchRegex },
                        { 'actors.characterName': searchRegex }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'movieId',
                    as: 'movieReviews'
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: '$movieReviews.rating' }
                }
            },
            {
                $sort: { avgRating: -1 }
            }
        ];
        
        Movie.aggregate(aggregate).exec(function(err, movies) {
            if (err) {
                return res.status(500).send(err);
            }
            
            // Track analytics for search
            if (movies.length > 0) {
                movies.forEach(movie => {
                    analytics.trackMovie(movie, analytics.ACTION.SEARCH_MOVIES);
                });
            }
            
            res.json(movies);
        });
    });

// Movie routes
router.route('/movies')
    .get(authJwtController.isAuthenticated, function (req, res) {
        // If reviews=true is in the query parameters, include reviews
        var includeReviews = req.query.reviews === 'true';
        var searchTerm = req.query.search;
        
        // Start building the query
        let query = {};
        
        // Add search functionality if search term is provided
        if (searchTerm) {
            const searchRegex = new RegExp(searchTerm, 'i');
            query = {
                $or: [
                    { title: searchRegex },
                    { genre: searchRegex },
                    { 'actors.actorName': searchRegex },
                    { 'actors.characterName': searchRegex }
                ]
            };
        }
        
        if (includeReviews) {
            console.log('GET /movies?reviews=true - Including reviews and sorting by rating');
            
            // IMPORTANT: This is the exact format required for aggregation with $lookup and $avg
            const aggregate = [
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: 'reviews',
                        localField: '_id',
                        foreignField: 'movieId',
                        as: 'movieReviews'
                    }
                },
                {
                    $addFields: {
                        avgRating: { $avg: '$movieReviews.rating' }
                    }
                },
                {
                    $sort: { avgRating: -1 } // Sort by average rating in descending order
                }
            ];
            
            // Execute the aggregation pipeline
            Movie.aggregate(aggregate).exec(function(err, movies) {
                if (err) {
                    return res.status(500).send(err);
                }
                
                // Track analytics for each movie
                movies.forEach(movie => {
                    analytics.trackMovie(movie, analytics.ACTION.GET_MOVIES);
                });
                
                res.json(movies);
            });
        } else {
            Movie.find(query, function(err, movies) {
                if (err) {
                    return res.status(500).send(err);
                }
                
                // Track analytics for each movie
                movies.forEach(movie => {
                    analytics.trackMovie(movie, analytics.ACTION.GET_MOVIES);
                });
                
                res.json(movies);
            });
        }
    })
    .post(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.title || !req.body.releaseDate || !req.body.genre || !req.body.actors || req.body.actors.length < 3) {
            return res.json({ success: false, message: 'Please include title, releaseDate, genre, and at least 3 actors.'});
        }
        
        var movie = new Movie();
        movie.title = req.body.title;
        movie.releaseDate = req.body.releaseDate;
        movie.genre = req.body.genre;
        movie.actors = req.body.actors;
        // Ensure imageUrl is set (even if it's empty string)
        movie.imageUrl = req.body.imageUrl || '';
        
        movie.save(function(err) {
            if (err) {
                return res.status(500).send(err);
            }
            res.json({ success: true, message: 'Movie created!' });
        });
    });

// Get movie by ID with optional reviews
router.route('/movies/:id')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.id;
        var includeReviews = req.query.reviews === 'true';
        
        if (includeReviews) {
            console.log('GET /movies/:id?reviews=true - Including reviews for movie detail');
            
            // Ensure we're using proper ObjectId conversion
            let objectId;
            try {
                objectId = mongoose.Types.ObjectId(id);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid movie ID format' });
            }
            
            // IMPORTANT: This is the exact format from the assignment requirements
            // Movie detail aggregation with $match, $lookup and $avg
            const aggregate = [
                { 
                    $match: { _id: objectId } 
                },
                {
                    $lookup: {
                        from: 'reviews',
                        localField: '_id',
                        foreignField: 'movieId',
                        as: 'movieReviews'
                    }
                },
                {
                    $addFields: {
                        avgRating: { $avg: '$movieReviews.rating' }
                    }
                }
            ];
            
            Movie.aggregate(aggregate).exec(function(err, movie) {
                if (err) {
                    return res.status(500).send(err);
                }
                if (!movie || movie.length === 0) {
                    return res.status(404).json({ success: false, message: 'Movie not found' });
                }
                
                // Track analytics for this movie
                analytics.trackMovie(movie[0], analytics.ACTION.GET_MOVIE);
                
                res.json(movie[0]); // Return just the movie object, not the array
            });
        } else {
            Movie.findById(id, function(err, movie) {
                if (err) {
                    return res.status(500).send(err);
                }
                if (!movie) {
                    return res.status(404).json({ success: false, message: 'Movie not found' });
                }
                
                // Track analytics for this movie
                analytics.trackMovie(movie, analytics.ACTION.GET_MOVIE);
                
                res.json(movie);
            });
        }
    });

// Review routes
router.route('/reviews')
    .post(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.movieId || !req.body.review || req.body.rating === undefined) {
            return res.status(400).json({ success: false, message: 'Please include movieId, review, and rating.'});
        }
        
        // First check if movie exists
        Movie.findById(req.body.movieId, function(err, movie) {
            if (err) {
                return res.status(500).send(err);
            }
            if (!movie) {
                return res.status(404).json({ success: false, message: 'Movie not found' });
            }
            
            // Movie exists, so save the review
            var review = new Review();
            review.movieId = req.body.movieId;
            // Use username from request body if provided, otherwise use from JWT token
            review.username = req.body.username || req.user.username;
            review.review = req.body.review;
            review.rating = req.body.rating;
            
            review.save(function(err) {
                if (err) {
                    return res.status(500).send(err);
                }
                
                // Track the review creation with analytics
                analytics.trackReview(review, movie, analytics.ACTION.POST_REVIEWS);
                
                res.json({ success: true, message: 'Review created!' });
            });
        });
    })
    .get(function (req, res) {
        Review.find(function(err, reviews) {
            if (err) {
                return res.status(500).send(err);
            }
            
            // If there are reviews, we need to get the corresponding movies
            // for proper analytics tracking
            if (reviews.length > 0) {
                // Get unique movie IDs
                const movieIds = [...new Set(reviews.map(r => r.movieId))];
                
                // Find all these movies
                Movie.find({
                    '_id': { $in: movieIds }
                }, function(err, movies) {
                    if (err) {
                        console.error('Error fetching movies for reviews analytics:', err);
                    } else {
                        // Create a map of movie IDs to movie objects
                        const movieMap = {};
                        movies.forEach(m => movieMap[m._id] = m);
                        
                        // Track analytics for each review
                        reviews.forEach(review => {
                            const movie = movieMap[review.movieId];
                            if (movie) {
                                analytics.trackReview(review, movie, analytics.ACTION.GET_REVIEWS);
                            }
                        });
                    }
                });
            }
            
            res.json(reviews);
        });
    });

// Get reviews for a specific movie
router.route('/reviews/:movieId')
    .get(function (req, res) {
        const movieId = req.params.movieId;
        
        // Find the movie first
        Movie.findById(movieId, function(err, movie) {
            if (err) {
                console.error('Error finding movie for reviews analytics:', err);
            } else if (movie) {
                // Then find and return the reviews
                Review.find({ movieId: movieId }, function(err, reviews) {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    
                    // Track analytics for this request
                    reviews.forEach(review => {
                        analytics.trackReview(review, movie, analytics.ACTION.GET_MOVIE_REVIEWS);
                    });
                    
                    res.json(reviews);
                });
            } else {
                // No movie found, just look for reviews
                Review.find({ movieId: movieId }, function(err, reviews) {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    res.json(reviews);
                });
            }
        });
    });

// Test endpoint for aggregation
router.route('/test/aggregation')
    .get(authJwtController.isAuthenticated, function (req, res) {
        console.log('Testing aggregation functionality');
        
        // Use explicit aggregation format for testing
        const aggregate = [
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'movieId',
                    as: 'movieReviews'
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: '$movieReviews.rating' }
                }
            },
            {
                $sort: { avgRating: -1 }
            }
        ];
        
        Movie.aggregate(aggregate).exec(function(err, movies) {
            if (err) {
                console.error('Aggregation error:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            
            res.json({
                success: true,
                message: 'Aggregation test completed',
                count: movies.length,
                movies: movies.map(m => ({
                    _id: m._id,
                    title: m.title,
                    avgRating: m.avgRating,
                    reviewCount: m.movieReviews.length,
                    imageUrl: m.imageUrl
                }))
            });
        });
    });

// Add a dedicated endpoint for getting average rating
router.route('/movies/:id/averagerating')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.id;
        
        // Ensure we're using proper ObjectId conversion
        let objectId;
        try {
            objectId = mongoose.Types.ObjectId(id);
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid movie ID format' });
        }
        
        // Use explicit aggregation format
        const aggregate = [
            { 
                $match: { _id: objectId } 
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'movieId',
                    as: 'movieReviews'
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: '$movieReviews.rating' }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    avgRating: 1,
                    reviewCount: { $size: "$movieReviews" }
                }
            }
        ];
        
        Movie.aggregate(aggregate).exec(function(err, result) {
            if (err) {
                return res.status(500).send(err);
            }
            if (!result || result.length === 0) {
                return res.status(404).json({ success: false, message: 'Movie not found' });
            }
            
            res.json(result[0]);
        });
    });

// Explicit route for getting movies with reviews, sorted by rating
// This is specifically for the /movies?reviews=true requirement
router.route('/movies-with-reviews')
    .get(authJwtController.isAuthenticated, function (req, res) {
        console.log('GET /movies-with-reviews - Implementing /movies?reviews=true functionality');
        
        // IMPORTANT: This is the exact MongoDB aggregation from the requirements
        // with $lookup and $avg for calculating and sorting by average rating
        const aggregate = [
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'movieId',
                    as: 'movieReviews'
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: '$movieReviews.rating' }
                }
            },
            {
                $sort: { avgRating: -1 }
            }
        ];
        
        Movie.aggregate(aggregate).exec(function(err, movies) {
            if (err) {
                return res.status(500).send(err);
            }
            
            // Track analytics for each movie
            movies.forEach(movie => {
                analytics.trackMovie(movie, analytics.ACTION.GET_MOVIES);
            });
            
            res.json(movies);
        });
    });

// Simple analytics test endpoint
router.route('/analytics/test')
    .get(function (req, res) {
        console.log('Analytics test endpoint called with:', {
            query: req.query,
            ga_key: process.env.GA_KEY,
            ga_secret_available: !!process.env.GA_SECRET
        });

        // Use the test movie name from query or default
        const testMovie = req.query.movie || 'Test Movie';
        
        // Create a fake movie and track it
        const fakeMovie = { 
            title: testMovie,
            _id: '000000000000000000000000',
            actors: []
        };
        
        // Track a test event
        analytics.trackMovie(fakeMovie, analytics.ACTION.GET_MOVIE);
        
        res.json({ 
            success: true, 
            message: 'Analytics test sent',
            test_movie: testMovie,
            ga_key: process.env.GA_KEY
        });
    });

// Explicit route for movies sorted by rating
router.route('/movies/toprated')
    .get(authJwtController.isAuthenticated, function (req, res) {
        console.log('GET /movies/toprated - Getting top rated movies using $lookup and $avg');
        
        // IMPORTANT: This aggregation uses $lookup and $avg to calculate and sort by rating
        // Use explicit aggregation for consistency
        const aggregate = [
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'movieId',
                    as: 'movieReviews'
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: '$movieReviews.rating' }
                }
            },
            {
                $sort: { avgRating: -1 }
            }
        ];
        
        Movie.aggregate(aggregate).exec(function(err, movies) {
            if (err) {
                return res.status(500).send(err);
            }
            
            // Track analytics for each movie
            movies.forEach(movie => {
                analytics.trackMovie(movie, analytics.ACTION.GET_MOVIES);
            });
            
            res.json(movies);
        });
    });

app.use('/', router);

app.listen(process.env.PORT || 3001);
console.log('Server is running on port ' + (process.env.PORT || 3001));


