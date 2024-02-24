const router = require('express').Router();
const mongoose = require('mongoose');
const Match = require('../models/Match.model');
const User = require('../models/User.model');

// POST - Create a new match
// only gets info from client
// matchmaking algorithm is here?
router.post('/matches', async (req, res, next) => {
  const {
    clientId,
    therapistId,
    matchedSetup,
    matchedApproach,
    matchedPrice,
    matchedTraits,
    didClientConfirm,
    didTherapistConfirm,
  } = req.body;

  try {
    // create a new match in the DB
    const newMatch = await Match.create({
      clientId,
      therapistId,
      matchedSetup,
      matchedApproach,
      matchedPrice,
      matchedTraits,
      didClientConfirm,
      didTherapistConfirm,
    });

    // update the client with the match
    await User.findByIdAndUpdate(clientId, {
      $push: { matches: newMatch._id },
    });

    console.log('New Match:', newMatch);
    res.status(201).json(newMatch);
  } catch (error) {
    console.log('An error occurred creating the match', error);
    next(error);
  }
});
// Postman - test passed

// GET - Get all matches
// Filter per user?
router.get('/matches', async (req, res, next) => {
  try {
    const matches = await Match.find({});

    console.log('All matches:', matches);
    res.status(201).json(matches);
  } catch (error) {
    console.log('An error occurred retrieving the matches', error);
    next(error);
  }
});
// Postman - test passed

// GET - Get a specific match
router.get('/matches/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // throw an error if the id is not valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const match = await Match.findById(id);

    // to check if the id exists in the DB:
    if (!match) {
      return res.status(404).json({ message: 'No match found' });
    }

    res.json(match);
  } catch (error) {
    console.log('An error occurred retrieving the match', error);
    next(error);
  }
});
// Postman - test passed

// PUT - Edit a specific match
// to add info from therapist
router.put('/matches/:id', async (req, res, next) => {
  const { id } = req.params;

  const {
    clientId,
    therapistId,
    matchedSetup,
    matchedApproach,
    matchedPrice,
    matchedTraits,
    didClientConfirm,
    didTherapistConfirm,
  } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      id,
      {
        clientId,
        therapistId,
        matchedSetup,
        matchedApproach,
        matchedPrice,
        matchedTraits,
        didClientConfirm,
        didTherapistConfirm,
      },
      { new: true }
    );

    // update the therapist with the match
    // if the match doesn't exist: find user and push new match
    // if the match exists: nothing happens
    await User.findOneAndUpdate(
      { _id: therapistId, matches: { $nin: [updatedMatch._id] } },
      { $push: { matches: updatedMatch._id } }
    );

    if (!updatedMatch) {
      return res.status(404).json({ message: 'No match found' });
    }

    res.json(updatedMatch);
  } catch (error) {
    console.log('An error occurred updating the match', error);
    next(error);
  }
});
// Postman - test passed

// DELETE - Delete a specific match
router.delete('/matches/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    await Match.findByIdAndDelete(id);

    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.log('An error occurred deleting the match', error);
    next(error);
  }
});
// Postman - test passed

module.exports = router;
