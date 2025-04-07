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

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

// Movie routes
router.route('/movies')
    .get(function (req, res) {
        // If reviews=true is in the query parameters, include reviews
        var includeReviews = req.query.reviews === 'true';
        
        if (includeReviews) {
            Movie.aggregate([
                {
                    $lookup: {
                        from: 'reviews',
                        localField: '_id',
                        foreignField: 'movieId',
                        as: 'reviews'
                    }
                }
            ]).exec(function(err, movies) {
                if (err) {
                    return res.status(500).send(err);
                }
                res.json(movies);
            });
        } else {
            Movie.find(function(err, movies) {
                if (err) {
                    return res.status(500).send(err);
                }
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
        
        movie.save(function(err) {
            if (err) {
                return res.status(500).send(err);
            }
            res.json({ success: true, message: 'Movie created!' });
        });
    });

// Get movie by ID with optional reviews
router.route('/movies/:id')
    .get(function (req, res) {
        var id = req.params.id;
        var includeReviews = req.query.reviews === 'true';
        
        if (includeReviews) {
            Movie.aggregate([
                { 
                    $match: { _id: mongoose.Types.ObjectId(id) } 
                },
                {
                    $lookup: {
                        from: 'reviews',
                        localField: '_id',
                        foreignField: 'movieId',
                        as: 'reviews'
                    }
                }
            ]).exec(function(err, movie) {
                if (err) {
                    return res.status(500).send(err);
                }
                if (!movie || movie.length === 0) {
                    return res.status(404).json({ success: false, message: 'Movie not found' });
                }
                res.json(movie[0]);
            });
        } else {
            Movie.findById(id, function(err, movie) {
                if (err) {
                    return res.status(500).send(err);
                }
                if (!movie) {
                    return res.status(404).json({ success: false, message: 'Movie not found' });
                }
                res.json(movie);
            });
        }
    });

// Review routes
router.route('/reviews')
    .post(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.movieId || !req.body.review || req.body.rating === undefined) {
            return res.json({ success: false, message: 'Please include movieId, review, and rating.'});
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
            review.username = req.user.username; // From JWT token
            review.review = req.body.review;
            review.rating = req.body.rating;
            
            review.save(function(err) {
                if (err) {
                    return res.status(500).send(err);
                }
                res.json({ message: 'Review created!' });
            });
        });
    })
    .get(function (req, res) {
        Review.find(function(err, reviews) {
            if (err) {
                return res.status(500).send(err);
            }
            res.json(reviews);
        });
    });

// Get reviews for a specific movie
router.route('/reviews/:movieId')
    .get(function (req, res) {
        Review.find({ movieId: req.params.movieId }, function(err, reviews) {
            if (err) {
                return res.status(500).send(err);
            }
            res.json(reviews);
        });
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


