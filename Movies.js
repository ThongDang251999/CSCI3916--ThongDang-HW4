var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

// Define valid genres
const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
    'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller',
    'Action, Adventure, Comedy', 'Action, Adventure, Thriller'  // Add combined genres
];

// Define the Actor Schema inside the MovieSchema
var ActorSchema = new Schema({
    actorName: { type: String, required: true },
    characterName: { type: String, required: true }
});

// Movie schema
var MovieSchema = new Schema({
    title: { type: String, required: true, index: true },
    releaseDate: { type: Number, min: [1900, 'Must be greater than 1899'], max: [2100, 'Must be less than 2100']},
    genre: { type: String, enum: genres },
    actors: [{
        actorName: String,
        characterName: String
    }],
    imageUrl: String,
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
});

// return the model
module.exports = mongoose.model('Movie', MovieSchema);