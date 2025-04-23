/*
 * MongoDB Aggregation Examples for Assignment 5
 * This file explicitly demonstrates the required aggregation patterns
 */

// Example 1: Movies with reviews and average rating (sorted)
// Used in GET /movies?reviews=true
const moviesWithReviewsAggregation = [
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

// Example 2: Movie detail with reviews and average rating
// Used in GET /movies/:id?reviews=true
const movieDetailAggregation = [
  {
    $match: { _id: 'movieId' } // Replace with actual ObjectId in implementation
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

// Example 3: Movie search with reviews and average rating
// Used in POST /movies/search
const movieSearchAggregation = [
  {
    $match: {
      $or: [
        { title: 'searchPattern' }, // Replace with actual regex in implementation
        { genre: 'searchPattern' },
        { 'actors.actorName': 'searchPattern' }
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

// Export the aggregation patterns
module.exports = {
  moviesWithReviewsAggregation,
  movieDetailAggregation,
  movieSearchAggregation
}; 