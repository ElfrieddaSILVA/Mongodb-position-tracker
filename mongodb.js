const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Replace with your MongoDB connection string
const MONGO_URI = 'mongodb+srv://<username>:<password>@cluster.mongodb.net/test?retryWrites=true&w=majority';

// Connect to the MongoDB cluster
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Create a MongoDB schema for the user profile
const userProfileSchema = new mongoose.Schema({
  username: String,
  password: String,
  location: {
    latitude: Number,
    longitude: Number
  }
});

// Create a MongoDB model for the user profile
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

app.get('/profile/:username', (req, res) => {
  const username = req.params.username;
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;

  // Find the user profile in the MongoDB cluster
  UserProfile.findOne({ username: username }, (err, userProfile) => {
    if (err) {
      res.status(500).send('Error finding user profile in the database');
    } else if (userProfile) {
      // Update the user profile with the new location
      userProfile.location = {
        latitude: latitude,
        longitude: longitude
      };
      userProfile.save((err, updatedProfile) => {
        if (err) {
          res.status(500).send('Error updating user profile in the database');
        } else {
          // Generate a JSON web token for the user
          const token = jwt.sign({
            username: username,
            location: {
              latitude: latitude,
              longitude: longitude
            }
          }, 'secret');

          // Return the user profile and JSON web token
          res.send({
            userProfile: updatedProfile,
            token: token
          });
        }
      });
    } else {
      res.status(404).send('User profile not found');
    }
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
