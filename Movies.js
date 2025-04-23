var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

// Define the Actor Schema inside the MovieSchema
var ActorSchema = new Schema({
    actorName: { type: String, required: true },
    characterName: { type: String, required: true }
});

// Movie schema
var MovieSchema = new Schema({
    title: { type: String, required: true, index: true },
    releaseDate: { type: Number, required: true, min: [1900, 'Must be greater than 1899'], max: [2100, 'Must be less than 2100'] },
    genre: { type: String, required: true },
    actors: [ActorSchema],
    imageUrl: String // Updated to match assignment requirements
});

// return the model
module.exports = mongoose.model('Movie', MovieSchema);