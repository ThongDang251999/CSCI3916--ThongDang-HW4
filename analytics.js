// Simple analytics implementation using GA4 Measurement Protocol
const crypto = require('crypto');
const axios = require('axios');
const request = require('axios');

const GA4_MEASUREMENT_ID = process.env.GA_KEY || 'G-B1QLX7WMCE';
const GA4_API_SECRET = process.env.GA_SECRET;
const GA4_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

// For Universal Analytics (needed for assignment requirements)
const GA_TRACKING_ID = process.env.GA_KEY || 'UA-XXXXXXXX-X';

console.log('Initializing GA4 with:', {
    measurement_id: GA4_MEASUREMENT_ID,
    api_secret_available: !!GA4_API_SECRET,
    api_secret_length: GA4_API_SECRET ? GA4_API_SECRET.length : 0,
    api_secret_prefix: GA4_API_SECRET ? GA4_API_SECRET.substring(0, 4) : 'none'
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
    SEARCH_MOVIES: 'search_movies',
    RATING: 'Rating'
};

// Event labels
const LABEL = {
    MOVIE_REQUEST: 'API Request for Movie',
    REVIEW_REQUEST: 'API Request for Movie Review',
    FEEDBACK: 'Feedback for Movie'
};

// Helper function to send events to GA4
async function sendEvent(name, params) {
    try {
        const clientId = crypto.randomBytes(16).toString("hex");
        const payload = {
            client_id: clientId,
            events: [{
                name,
                params
            }]
        };

        console.log('Sending GA4 event:', {
            endpoint: GA4_ENDPOINT,
            name,
            params
        });

        const response = await axios.post(GA4_ENDPOINT, payload);
        console.log('GA4 response:', response.status, response.statusText);
        return { success: true, status: response.status };
    } catch (error) {
        console.error('GA4 error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Track a movie view
 * @param {Object} movie - The movie object
 * @param {String} action - The action being performed
 */
async function trackMovie(movie, action) {
    if (!movie) return { success: false, reason: 'No movie provided' };

    console.log('Tracking movie view:', {
        title: movie.title,
        action: action,
        measurement_id: GA4_MEASUREMENT_ID,
        api_secret_available: !!GA4_API_SECRET
    });
    
    // Also track with Universal Analytics format for assignment requirements
    trackDimension(
        movie.genre || 'Unknown',  // Category: Genre of Movie
        action,                    // Action: URL Path
        LABEL.MOVIE_REQUEST,       // Label: API Request for Movie
        1,                         // Value: 1
        movie.title,               // Dimension: Movie Name
        1                          // Metric: Requested Value 1
    );
    
    return sendEvent(EVENT_NAMES.MOVIE_VIEW, {
        movie_name: movie.title,
        movie_genre: movie.genre || 'Unknown',
        action_type: action,
        event_label: LABEL.MOVIE_REQUEST,
        request_count: 1
    });
}

/**
 * Track a review action
 * @param {Object} review - The review object
 * @param {Object} movie - The associated movie
 * @param {String} action - The action being performed
 */
async function trackReview(review, movie, action) {
    if (!movie) return { success: false, reason: 'No movie provided' };

    console.log('Tracking review action:', {
        movie: movie.title,
        action: action,
        rating: review.rating,
        measurement_id: GA4_MEASUREMENT_ID,
        api_secret_available: !!GA4_API_SECRET
    });
    
    // Also track with Universal Analytics format for assignment requirements
    trackDimension(
        movie.genre || 'Unknown',   // Category: Genre of Movie
        action,                     // Action: URL Path 
        LABEL.REVIEW_REQUEST,       // Label: API Request for Movie Review
        1,                          // Value: 1
        movie.title,                // Dimension: Movie Name
        1                           // Metric: Requested Value 1
    );
    
    return sendEvent(EVENT_NAMES.REVIEW_ACTION, {
        movie_name: movie.title,
        movie_genre: movie.genre || 'Unknown',
        action_type: action,
        event_label: LABEL.REVIEW_REQUEST,
        request_count: 1,
        rating: review.rating
    });
}

/**
 * Send a test event to verify analytics is working
 * @param {String} movieName - Movie name to track
 * @param {String} rating - Rating value
 * @returns {Promise} - Promise that resolves when the event is tracked
 */
async function trackTest(movieName, rating) {
    console.log('Tracking test event:', {
        movie: movieName,
        rating: rating,
        measurement_id: GA4_MEASUREMENT_ID,
        api_secret_available: !!GA4_API_SECRET
    });
    
    // Also track with Universal Analytics format for assignment requirements
    trackDimension(
        CATEGORY.FEEDBACK,          // Category: Feedback
        ACTION.RATING,              // Action: Rating
        LABEL.FEEDBACK,             // Label: Feedback for Movie
        rating || 5,                // Value: rating
        movieName || 'Test Movie',  // Dimension: Movie Name
        1                           // Metric: Requested Value 1
    );
    
    return sendEvent(EVENT_NAMES.TEST_EVENT, {
        movie_name: movieName || 'Test Movie',
        movie_genre: CATEGORY.FEEDBACK,
        action_type: ACTION.RATING,
        event_label: LABEL.FEEDBACK,
        request_count: 1,
        rating: rating || 5
    });
}

/**
 * Track dimension using Universal Analytics format (as required by assignment)
 * @param {String} category - Event category (Genre of Movie)
 * @param {String} action - Event action (URL Path)
 * @param {String} label - Event label (API Request for Movie Review)
 * @param {Number} value - Event value (1)
 * @param {String} dimension - Custom dimension (Movie Name)
 * @param {Number} metric - Custom metric (Requested Value 1)
 */
function trackDimension(category, action, label, value, dimension, metric) {
    const options = {
        method: 'GET',
        url: 'https://www.google-analytics.com/collect',
        params: {
            // API Version.
            v: '1',
            // Tracking ID / Property ID.
            tid: GA_TRACKING_ID,
            // Random Client Identifier
            cid: crypto.randomBytes(16).toString("hex"),
            // Event hit type.
            t: 'event',
            // Event category.
            ec: category,
            // Event action.
            ea: action,
            // Event label.
            el: label,
            // Event value.
            ev: value,
            // Custom Dimension (Movie Name)
            cd1: dimension,
            // Custom Metric (Requested Value 1)
            cm1: metric
        },
        headers: { 'Cache-Control': 'no-cache' }
    };

    console.log('Sending Universal Analytics event:', {
        tracking_id: GA_TRACKING_ID,
        category,
        action,
        dimension
    });

    return axios(options)
        .then(response => {
            console.log('Universal Analytics response status:', response.status);
            return response;
        })
        .catch(error => {
            console.error('Universal Analytics error:', error.message);
            return error;
        });
}

module.exports = {
    CATEGORY,
    ACTION,
    LABEL,
    trackMovie,
    trackReview,
    trackTest,
    trackDimension
}; 