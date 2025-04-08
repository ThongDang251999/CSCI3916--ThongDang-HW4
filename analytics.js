const GA4 = require('node-ga4');

// Use your GA4 Measurement ID
const GA4_MEASUREMENT_ID = 'G-B1QLX7WMCE';

// Initialize GA4 with your measurement ID
const ga4 = new GA4(GA4_MEASUREMENT_ID);

// Define event parameters
const EVENT_NAMES = {
    MOVIE_VIEW: 'movie_view',
    REVIEW_ACTION: 'review_action'
};

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
    GET_MOVIES: 'get_movies',
    GET_MOVIE: 'get_movie',
    GET_REVIEWS: 'get_reviews',
    POST_REVIEWS: 'post_review',
    GET_MOVIE_REVIEWS: 'get_movie_reviews'
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

    ga4.event({
        name: EVENT_NAMES.MOVIE_VIEW,
        params: {
            movie_name: movie.title,
            movie_genre: movie.genre || 'Unknown',
            action_type: action,
            event_label: LABEL.MOVIE_REQUEST,
            request_count: 1
        }
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

    ga4.event({
        name: EVENT_NAMES.REVIEW_ACTION,
        params: {
            movie_name: movie.title,
            movie_genre: movie.genre || 'Unknown',
            action_type: action,
            event_label: LABEL.REVIEW_REQUEST,
            request_count: 1,
            rating: review.rating
        }
    });
}

module.exports = {
    CATEGORY,
    ACTION,
    LABEL,
    trackMovie,
    trackReview
}; 