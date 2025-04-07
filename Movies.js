var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

// Movie schema
var MovieSchema = new Schema({
    title: { type: String, required: true },
    releaseDate: { type: Number, required: true },
    genre: { type: String, required: true },
    actors: [{ 
        actorName: { type: String, required: true },
        characterName: { type: String, required: true }
    }]
});

// return the model
module.exports = mongoose.model('Movie', MovieSchema);