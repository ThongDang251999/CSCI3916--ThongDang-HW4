const GA4 = require('node-ga4');
const crypto = require('crypto');

// Use GA4 Measurement ID from environment variable or hardcoded value
const GA4_MEASUREMENT_ID = process.env.GA_KEY || 'G-B1QLX7WMCE';

// Initialize GA4 with your measurement ID and options
const ga4 = new GA4(GA4_MEASUREMENT_ID, {
    // Generate a consistent client ID for each user session
    clientId: () => crypto.randomBytes(16).toString("hex")
});

// Define event parameters
const EVENT_NAMES = {
    MOVIE_VIEW: 'movie_view',
    REVIEW_ACTION: 'review_action',
    TEST_EVENT: 'test_event'
};

// Event Categories
const CATEGORY = {
    ACTION: 'Action',
    COMEDY: 'Comedy',
    DRAMA: 'Drama',
    FANTASY: 'Fantasy',
    HORROR: 'Horror',
    THRILLER: 'Thriller',
    WESTERN: 'Western',
    FEEDBACK: 'Feedback'
};

// Action types
const ACTION = {
    GET_MOVIES: 'get_movies',
    GET_MOVIE: 'get_movie',
    GET_REVIEWS: 'get_reviews',
    POST_REVIEWS: 'post_review',
    GET_MOVIE_REVIEWS: 'get_movie_reviews',
    RATING: 'Rating'
};

// Event labels
const LABEL = {
    MOVIE_REQUEST: 'API Request for Movie',
    REVIEW_REQUEST: 'API Request for Movie Review',
    FEEDBACK: 'Feedback for Movie'
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

/**
 * Send a test event to verify analytics is working
 * @param {String} movieName - Movie name to track
 * @param {String} rating - Rating value
 * @returns {Promise} - Promise that resolves when the event is tracked
 */
function trackTest(movieName, rating) {
    return ga4.event({
        name: EVENT_NAMES.TEST_EVENT,
        params: {
            movie_name: movieName || 'Test Movie',
            movie_genre: CATEGORY.FEEDBACK,
            action_type: ACTION.RATING,
            event_label: LABEL.FEEDBACK,
            request_count: 1,
            rating: rating || 5
        }
    });
}

module.exports = {
    CATEGORY,
    ACTION,
    LABEL,
    trackMovie,
    trackReview,
    trackTest
}; 