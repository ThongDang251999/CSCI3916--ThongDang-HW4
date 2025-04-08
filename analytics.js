const ua = require('universal-ga');

// Replace with your Google Analytics Tracking ID from your Google Analytics account
// Visit https://analytics.google.com/ to set up an account and get your tracking ID
const GA_TRACKING_ID = 'UA-XXXXXXXX-X'; // Replace this with your actual tracking ID

// Initialize with your tracking ID
ua.initialize(GA_TRACKING_ID, {
    debug: process.env.NODE_ENV !== 'production'
});

// Set up custom dimensions and metrics
// Custom Dimension 1: Movie Name
// Custom Metric 1: Requested (value 1, it will aggregate)
const DIMENSION_MOVIE_NAME = 1;
const METRIC_REQUESTED = 1;

// Event Categories
const CATEGORY = {
    ACTION: 'Action',
    COMEDY: 'Comedy',
    DRAMA: 'Drama',
    FANTASY: 'Fantasy',
    HORROR: 'Horror',
    THRILLER: 'Thriller',
    WESTERN: 'Western'
};

// Action types
const ACTION = {
    GET_MOVIES: 'GET /movies',
    GET_MOVIE: 'GET /movies/:id',
    GET_REVIEWS: 'GET /reviews',
    POST_REVIEWS: 'POST /reviews',
    GET_MOVIE_REVIEWS: 'GET /reviews/:movieId'
};

// Event labels
const LABEL = {
    MOVIE_REQUEST: 'API Request for Movie',
    REVIEW_REQUEST: 'API Request for Movie Review'
};

/**
 * Track a movie view
 * @param {Object} movie - The movie object
 * @param {String} action - The action being performed
 */
function trackMovie(movie, action) {
    if (!movie) return;

    const customDimensions = {
        [DIMENSION_MOVIE_NAME]: movie.title
    };

    const customMetrics = {
        [METRIC_REQUESTED]: 1
    };

    ua.event({
        category: movie.genre || 'Unknown',
        action: action,
        label: LABEL.MOVIE_REQUEST,
        value: 1,
        customDimensions,
        customMetrics
    });
}

/**
 * Track a review action
 * @param {Object} review - The review object
 * @param {Object} movie - The associated movie
 * @param {String} action - The action being performed
 */
function trackReview(review, movie, action) {
    if (!movie) return;

    const customDimensions = {
        [DIMENSION_MOVIE_NAME]: movie.title
    };

    const customMetrics = {
        [METRIC_REQUESTED]: 1
    };

    ua.event({
        category: movie.genre || 'Unknown',
        action: action,
        label: LABEL.REVIEW_REQUEST,
        value: 1,
        customDimensions,
        customMetrics
    });
}

module.exports = {
    CATEGORY,
    ACTION,
    LABEL,
    trackMovie,
    trackReview
}; 