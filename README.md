# CSC3916 Assignment 4 - Movie API

This repository contains a RESTful API for managing movies and reviews. It supports user authentication, movie CRUD operations, reviews, and analytics tracking.

## Features

- User authentication with JWT
- Movie management with CRUD operations
- Review system for movies
- Analytics tracking with Google Analytics
- Aggregation of movies and reviews data

## Environment Variables

To run this application, you need to set up the following environment variables:

- `DB` - MongoDB connection string
- `SECRET_KEY` - Secret key for JWT token generation
- `GA_KEY` - Google Analytics Measurement ID
- `GA_SECRET` - Google Analytics API Secret
- `PORT` - (Optional) Port to run the server on

## Deployment Instructions for Render

1. Fork/clone this repository
2. Create a new Web Service in Render
3. Connect your GitHub repository
4. Configure the following settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Node.js version: 18.x
5. Add the environment variables:
   - Go to "Environment" tab
   - Add all required environment variables (DB, SECRET_KEY, GA_KEY, GA_SECRET)
6. Deploy the application

## API Endpoints

### Authentication
- `POST /signup` - Register a new user
- `POST /signin` - Log in a user and get JWT token

### Movies
- `GET /movies` - Get all movies
- `GET /movies?reviews=true` - Get all movies with reviews, sorted by rating
- `GET /movies/:id` - Get a specific movie
- `GET /movies/:id?reviews=true` - Get a specific movie with its reviews
- `POST /movies` - Create a new movie (JWT required)
- `POST /movies/search` - Search for movies (JWT required)

### Reviews
- `GET /reviews` - Get all reviews (JWT required)
- `GET /reviews/:movieId` - Get reviews for a specific movie (JWT required)
- `POST /reviews` - Create a new review (JWT required)

### Analytics
- `GET /analytics/test` - Test GA4 analytics
- `GET /analytics/ua-test` - Test Universal Analytics

## Testing

Run tests with:
```
npm test
```

## License

MIT

## Author

Original by Shawn McCarthy, modified by Thong Dang

# Assignment Four
## Purpose
The purpose of this assignment is to leverage Google's analytics policies to gather information about the requests being sent in by users.

Using the information already entered to MongoDB for the previous assignment, you will add another collection of reviews that are tied to the movies. This way users can query the database and get the previous information (title, year released and actors) as well as the reviews. These two entities should remain separate! Do not append the reviews to the existing movie information.  

Leverage the Async.js library or mongo $lookup aggregation capability to join the entities.


## Requirements
- Create a collection in MongoDB (Mongo Atlas) to hold reviews about existing movies.
    - A review contains the name of the reviewer, a small quote about what they thought about the movie, and their rating out of five stars.
        - movieId (from the movie collection)
        - username
        - review
        - rating
    - The review collection should have at least one review for each movie. – The review can be a simple, ficticious review that you create.
- This API should build upon the previous API in assignment three.
    - If the user sends a response with the query parameter reviews=true, then the response should include the movie information as well as all the reviews for the movie. If they do not pass this in, the response should not show the reviews. – The review information should be appended to the response to the user.
        - Hint: Look at $lookup on how to aggregate two collections
    - Implement GET/POST (DELETE is optional for reviews)
        - POST needs to be secured with a JWT authorization token.  The Username in the token should be stored with the review (indicating the user that submitted the review)
            - If review created send back JSON message { message: 'Review created!' } 
- Extra Credit:  Add custom analytics to return information about which movies users are querying.
    - Create a custom analytics policy that describes the number of times each movie has been reviewed. To do this, you will have to send a number of requests for each movie.
        - Custom Dimension: Movie Name
        - Custom Metric: Requested:  Value 1 (it will aggregate)
    - Custom Dimension and Metric should be sent with an Event type 
        - Event Category: Genre of Movie (e.g. Western)
        - Event Action: Url Path (e.g. post /reviews)
        - Event Label: API Request for Movie Review
        - Event Value: 1 


## Submissions
- Create a Postman test to test your API. You should include the following requests.
    - All tests from HW3 and
    - Valid request without the review query parameter (e.g reviews=true on the /movies route)
    - Invalid request (for a movie not in the database) without the review query parameter. 
    - Valid request with the review query parameter. (e.g reviews=true on the /movies/:id route)
    - Valid save review method that associates a review with a movie (save a review for a movie in your DB)
    - Invalid save review (movie missing from DB)
    - Export a report from Google Analytics (only if you do the Extra Credit)

- Create a readme.md at the root of your github repository with the embedded (markdown) to your test collection
    - Within the collection click the (…), share collection -> Embed
    - Static Button
    - Click update link
    - Include your environment settings
    - Copy to clipboard 
- Submit the Url to canvas with the REPO CSC_3916
- Note: All tests should be testing against your Heroku or Render endpoint

## Rubic
- This one has an extra credit – code the custom analytics that correctly sends the movie name and they attach a PDF or Excel report from Google Analytics you receive +4
- -2 if missing reviews collection
- -2 if missing query parameters ?reviews=true that returns reviews (should include both movie and reviews)
- -1 for each test that is missing (valid request for movie with query parameter, valid save review, invalid movie request, invalid save review) – for max of (-4 for missing all tests)
- -2 if you have to manually copy the JWT token to get their tests to run (versus saving it from the sign-in call)
- Try changing the review data to enter a different review before submitting to validate new review are returned – if not (-1)

## Resources
- https://github.com/daxko/universal-ga
- https://developers.google.com/analytics/devguides/collection/analyticsjs/custom-dims-mets 
- https://cloud.google.com/appengine/docs/flexible/nodejs/integrating-with-analytics
- https://caolan.github.io/async/index.html
- https://support.google.com/analytics/answer/2709829

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/41738630-ded64cc4-9c8d-4fa1-b758-26e229762c50?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D41738630-ded64cc4-9c8d-4fa1-b758-26e229762c50%26entityType%3Dcollection%26workspaceId%3D77c36a26-bf1f-4213-a6de-4ea208f5bdf5#?env%5BThongDang-HW4%5D=W3sia2V5IjoiYmFzZV91cmwiLCJ2YWx1ZSI6Imh0dHBzOi8vY3NjaTM5MTYtdGhvbmdkYW5nLWh3NC5vbnJlbmRlci5jb20iLCJlbmFibGVkIjp0cnVlLCJzZXNzaW9uVmFsdWUiOiJodHRwczovL2NzY2kzOTE2LXRob25nZGFuZy1odzQub25yZW5kZXIuY29tIiwiY29tcGxldGVTZXNzaW9uVmFsdWUiOiJodHRwczovL2NzY2kzOTE2LXRob25nZGFuZy1odzQub25yZW5kZXIuY29tIiwic2Vzc2lvbkluZGV4IjowfSx7ImtleSI6ImF1dGhfdG9rZW4iLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWUsInNlc3Npb25WYWx1ZSI6IkpXVC4uLiIsImNvbXBsZXRlU2Vzc2lvblZhbHVlIjoiSldUIGV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwWkNJNklqWTNaamxoWlRBMFpqQTNaV1pqTURBME5qVm1PVEJtT0NJc0luVnpaWEp1WVcxbElqb2lkWE5sY2pFM05EUTBNVFl5TmpBM01qZ2lMQ0pwWVhRaU9qRTNORFEwTVRZeU5qTjkuLU94VER3cUw4clBiTnVGakJSM2Nla2RDQkZaUTFoaEhqaEhmdTh1UkN4VSIsInNlc3Npb25JbmRleCI6MX0seyJrZXkiOiJ0ZXN0X3VzZXJuYW1lIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlLCJzZXNzaW9uVmFsdWUiOiJ1c2VyMTc0NDQxNjI2MDcyOCIsImNvbXBsZXRlU2Vzc2lvblZhbHVlIjoidXNlcjE3NDQ0MTYyNjA3MjgiLCJzZXNzaW9uSW5kZXgiOjJ9LHsia2V5IjoidGVzdF9wYXNzd29yZCIsInZhbHVlIjoiIiwiZW5hYmxlZCI6dHJ1ZSwic2Vzc2lvblZhbHVlIjoicGFzc3dvcmQxNzQ0NDE2MjYwNzI4IiwiY29tcGxldGVTZXNzaW9uVmFsdWUiOiJwYXNzd29yZDE3NDQ0MTYyNjA3MjgiLCJzZXNzaW9uSW5kZXgiOjN9LHsia2V5IjoidGVzdF9uYW1lIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlLCJzZXNzaW9uVmFsdWUiOiJVc2VyIDE3NDQ0MTYyNjA3MjgiLCJjb21wbGV0ZVNlc3Npb25WYWx1ZSI6IlVzZXIgMTc0NDQxNjI2MDcyOCIsInNlc3Npb25JbmRleCI6NH0seyJrZXkiOiJtb3ZpZV9pZCIsInZhbHVlIjoiIiwiZW5hYmxlZCI6dHJ1ZSwic2Vzc2lvblZhbHVlIjoiIiwiY29tcGxldGVTZXNzaW9uVmFsdWUiOiIiLCJzZXNzaW9uSW5kZXgiOjV9XQ==)

## Extra Credit: Custom Analytics Implementation

For the extra credit portion, I've implemented a custom analytics policy that tracks the number of times each movie has been reviewed using Google Analytics 4 (GA4). 

### Analytics Implementation Details

My implementation in `analytics.js` captures the following data:

1. **Custom Dimension**: Movie Name
   - Each movie title is tracked as `movie_name` parameter

2. **Custom Metric**: Request Count 
   - Each review adds a count of 1 to aggregate the total number of reviews

3. **Event Category**: Movie Genre
   - The genre of the movie is tracked as `movie_genre` parameter

4. **Event Action**: API Path
   - Actions like "post_review" and "get_movie_reviews" are tracked

5. **Event Label**: API Request Description
   - "API Request for Movie Review" is tracked for review events

### Integration Points

Analytics events are tracked at the following points:

1. When a user submits a review for a movie
2. When a user views movie details
3. When a user views reviews for a movie

### Testing Analytics

The analytics implementation can be tested using:

1. The Postman collection's "Test Analytics" request
2. Directly accessing the `/analytics/test` endpoint with parameters:
   ```
   https://csci3916-thongdang-hw4.onrender.com/analytics/test?movie=TestMovie&rating=5
   ```

### GA4 Configuration

The Google Analytics 4 property is configured with:
- Measurement ID: G-B1QLX7WMCE
- API Secret: (stored securely in environment variables)

As noted in the assignment instructions, GA4 events may take 24-48 hours to appear in reports.

# Movie API Backend

This is the backend API for the Movie Application (Assignment 5).

## Requirements Implemented

1. **JWT Auth Protected Routes**: All routes are protected with JWT authentication.
2. **Movie model with imageUrl**: The Movie schema includes an imageUrl field with default value.
3. **Aggregation of Average Rating**: Using MongoDB's $lookup and $avg for calculating average ratings.
4. **/movies?reviews=true sorted by rating**: Endpoint returns movies with reviews, sorted by average rating.
5. **Movie detail endpoint with reviews**: Movie detail route includes reviews and aggregated ratings using $lookup.
6. **POST /movies/search**: Search functionality for finding movies by title, genre, or actor name.
7. **Connected to MongoDB**: Using MongoDB for data storage.
8. **Reviews.js and Users.js**: Database models for reviews and users are implemented.

## API Endpoints

### Authentication
- `POST /signup` - Register a new user
- `POST /signin` - Login to get a JWT token

### Movies
- `GET /movies` - Get all movies
- `GET /movies?reviews=true` - Get all movies with reviews, sorted by rating
- `GET /movies/toprated` - Get all movies sorted by average rating
- `GET /movies/:id` - Get a specific movie by ID
- `GET /movies/:id?reviews=true` - Get a specific movie with its reviews
- `POST /movies` - Create a new movie
- `POST /movies/search` - Search for movies by title, genre, or actor name

### Reviews
- `GET /reviews` - Get all reviews
- `GET /reviews/:movieId` - Get reviews for a specific movie
- `POST /reviews` - Add a new review for a movie

### Testing/Debugging
- `GET /test/aggregation` - Test the aggregation functionality
- `GET /movies/:id/averagerating` - Get the average rating for a specific movie

## How to Test Requirements

### JWT Auth Protected Routes
All routes are protected with JWT authentication. To test, try accessing protected routes without a token.

### Movie Model with imageUrl
When creating a movie, include an imageUrl field:

```json
{
  "title": "Test Movie",
  "releaseDate": 2022,
  "genre": "Action",
  "actors": [
    {"actorName": "Actor 1", "characterName": "Character 1"},
    {"actorName": "Actor 2", "characterName": "Character 2"},
    {"actorName": "Actor 3", "characterName": "Character 3"}
  ],
  "imageUrl": "https://example.com/image.jpg"
}
```

### Aggregation of Average Rating
Test using the `/movies?reviews=true` endpoint which uses MongoDB's $lookup and $avg to calculate ratings.

### Movies Sorted by Rating
Use the `/movies?reviews=true` endpoint which returns movies sorted by average rating in descending order.

### Movie Detail with Reviews
Use the `/movies/:id?reviews=true` endpoint which uses $match and $lookup to get a movie with its reviews.

### Search Functionality
Use the `/movies/search` endpoint with a POST request:

```json
{
  "search": "search term"
}
```

## Implementation Details

### Aggregation in Movies Endpoint
The `/movies?reviews=true` endpoint uses the following aggregation pipeline:
```js
[
  { $match: query },
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
  { $sort: { avgRating: -1 } }
]
```

### Movie Detail Aggregation
The `/movies/:id?reviews=true` endpoint uses:
```js
[
  { $match: { _id: objectId } },
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
]
```

## Running the Server
```
npm install
npm start
```

The server will run on port 3001 by default or the port specified in the environment variable.

# MongoDB Aggregation Implementation

## Key Features Implemented

1. **MongoDB Schema with imageUrl**: Added `imageUrl` field to Movie schema
   ```javascript
   imageUrl: { type: String, default: '' }
   ```

2. **$lookup Aggregation for Reviews**: Using MongoDB's $lookup for joining movies and reviews
   ```javascript
   $lookup: {
     from: 'reviews',
     localField: '_id',
     foreignField: 'movieId',
     as: 'movieReviews'
   }
   ```

3. **$avg for Average Rating Calculation**: Using MongoDB's $avg operator
   ```javascript
   $addFields: {
     avgRating: { $avg: '$movieReviews.rating' }
   }
   ```

4. **GET /movies?reviews=true with Sorting**: Endpoint returns movies with reviews, sorted by rating
   ```javascript
   // When reviews=true, use aggregation with $lookup and $avg
   const aggregate = [
     { $match: query },
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
     { $sort: { avgRating: -1 } }
   ];
   ```

5. **Movie Detail with Reviews**: `/movies/:id?reviews=true` uses aggregation
   ```javascript
   const aggregate = [
     { $match: { _id: objectId } },
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
   ```

6. **Search Movies**: POST `/movies/search` endpoint for searching movies
   ```javascript
   router.route('/movies/search')
     .post(authJwtController.isAuthenticated, function (req, res) {
       // Implementation uses $lookup and $avg
     });
   ```

## Detailed Implementations

The MongoDB aggregation framework is used extensively in this API for:
- Joining movies with their reviews using $lookup
- Calculating average ratings using $avg
- Sorting movies by average rating
- Filtering movies by search terms

All endpoints are secured with JWT authentication and the API is ready to support a React frontend application.

