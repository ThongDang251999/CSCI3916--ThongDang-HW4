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

