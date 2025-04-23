/**
 * Common MongoDB aggregation patterns for the Movie API
 */

// Common aggregation for movies with reviews
const moviesWithReviews = [
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

// Single movie with reviews
const movieWithReviews = (movieId) => [
    { 
        $match: { _id: movieId } 
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

// Search movies
const searchMovies = (searchRegex) => [
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

module.exports = {
    moviesWithReviews,
    movieWithReviews,
    searchMovies
}; 