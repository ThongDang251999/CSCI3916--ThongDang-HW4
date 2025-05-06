const mongoose = require('mongoose');
const Movie = require('./Movies');

// Use your MongoDB URI or default to local
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/movies';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const movies = await Movie.find({ title: 'The Dark Knight', releaseDate: 2008 });
    if (movies.length > 1) {
      // Keep only the first one, delete all others
      const [keep, ...toDelete] = movies;
      const idsToDelete = toDelete.map(m => m._id);
      await Movie.deleteMany({ _id: { $in: idsToDelete } });
      console.log('Deleted', idsToDelete.length, 'duplicate(s). Kept one.');
    } else if (movies.length === 1) {
      console.log('Only one "The Dark Knight" (2008) found. No duplicates to delete.');
    } else {
      console.log('No "The Dark Knight" (2008) movies found.');
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  }); 