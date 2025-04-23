var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

// Movie schema
var MovieSchema = new Schema({
    title: { type: String, required: true, index: true },
    releaseDate: { type: Number, required: true, min: [1900, 'Must be greater than 1899'], max: [2100, 'Must be less than 2100'] },
    genre: { type: String, required: true },
    actors: [{ 
        actorName: { type: String, required: true },
        characterName: { type: String, required: true }
    }],
    // IMPORTANT: imageUrl field added for Assignment 5 requirement
    imageUrl: { type: String, default: '' }
});

// return the model
module.exports = mongoose.model('Movie', MovieSchema);