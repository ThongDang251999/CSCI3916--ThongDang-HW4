// Simple fallback analytics implementation
const crypto = require('crypto');
let ga4;
let isFallback = false;

// Try to load node-ga4, but fall back to a simple implementation if it fails
async function initializeGA4() {
    try {
        const GA4 = await import('node-ga4');
        
        // Use GA4 Measurement ID from environment variable or hardcoded value
        const GA4_MEASUREMENT_ID = process.env.GA_KEY || 'G-B1QLX7WMCE';
        const GA4_API_SECRET = process.env.GA_SECRET;
        
        console.log('Initializing GA4 with:', {
            measurement_id: GA4_MEASUREMENT_ID,
            api_secret_available: !!GA4_API_SECRET,
            api_secret_length: GA4_API_SECRET ? GA4_API_SECRET.length : 0,
            api_secret_prefix: GA4_API_SECRET ? GA4_API_SECRET.substring(0, 4) : 'none'
        });
        
        // Initialize GA4 with your measurement ID and options
        ga4 = new GA4.default(GA4_MEASUREMENT_ID, {
            // Generate a consistent client ID for each user session
            clientId: () => crypto.randomBytes(16).toString("hex"),
            debug: true,
            secret: GA4_API_SECRET // Add the API secret here
        });
        
        isFallback = false;
    } catch (error) {
        console.error('Failed to initialize node-ga4, using fallback implementation:', error.message);
        isFallback = true;
        
        // Create a dummy ga4 object that won't crash the application
        ga4 = {
            event: (params) => {
                console.log('Analytics event (fallback):', params);
                return Promise.resolve({ success: true, fallback: true });
            }
        };
    }
}

// Initialize GA4 when this module is loaded
initializeGA4();

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
async function trackMovie(movie, action) {
    if (!movie) return Promise.resolve({ success: false, reason: 'No movie provided' });

    console.log('Tracking movie view:', {
        title: movie.title,
        action: action,
        measurement_id: process.env.GA_KEY || 'G-B1QLX7WMCE',
        api_secret_available: !!process.env.GA_SECRET
    });
    
    try {
        const response = await ga4.event({
            name: EVENT_NAMES.MOVIE_VIEW,
            params: {
                movie_name: movie.title,
                movie_genre: movie.genre || 'Unknown',
                action_type: action,
                event_label: LABEL.MOVIE_REQUEST,
                request_count: 1
            }
        });
        console.log('GA4 tracking success:', response);
        return response;
    } catch (error) {
        console.error('GA4 tracking error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Track a review action
 * @param {Object} review - The review object
 * @param {Object} movie - The associated movie
 * @param {String} action - The action being performed
 */
async function trackReview(review, movie, action) {
    if (!movie) return Promise.resolve({ success: false, reason: 'No movie provided' });

    console.log('Tracking review action:', {
        movie: movie.title,
        action: action,
        rating: review.rating,
        measurement_id: process.env.GA_KEY || 'G-B1QLX7WMCE',
        api_secret_available: !!process.env.GA_SECRET
    });
    
    try {
        const response = await ga4.event({
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
        console.log('GA4 tracking success:', response);
        return response;
    } catch (error) {
        console.error('GA4 tracking error:', error);
        return { success: false, error: error.message };
    }
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
        measurement_id: process.env.GA_KEY || 'G-B1QLX7WMCE',
        api_secret_available: !!process.env.GA_SECRET
    });
    
    try {
        const response = await ga4.event({
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
        console.log('GA4 test event success:', response);
        return response;
    } catch (error) {
        console.error('GA4 test event error:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    CATEGORY,
    ACTION,
    LABEL,
    trackMovie,
    trackReview,
    trackTest,
    isFallback
}; 