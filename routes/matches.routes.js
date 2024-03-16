const router = require('express').Router();
const mongoose = require('mongoose');
const Match = require('../models/Match.model');
const User = require('../models/User.model');
const Profile = require('../models/Profile.model');

// POST - Create a new match
// Postman - test passed
router.post('/matches', async (req, res, next) => {
  try {
    // the only thing I can get from the FE is the clientId
    const { clientId } = req.body;

    // GET Profiles
    const profiles = await Profile.find({}).populate('user');

    const clientProfile = profiles.find(
      profile => profile.user._id.toString() === clientId
    );
    //console.log('client profile:', clientProfile); // gets the client

    const therapistsProfiles = profiles.filter(
      profile => profile.user.isTherapist === true
    );
    // console.log('therapists profiles:', therapistsProfiles); // gets the array of therapists

    // Match check functions
    const checkSetup = (client, therapist) => {
      const findCommonSetup = (client, therapist) => {
        for (let i = 0; i < client.therapySetup.length; i++) {
          for (let j = 0; j < therapist.therapySetup.length; j++) {
            if (client.therapySetup[i] === therapist.therapySetup[j]) {
              return true; // Return true if a common setup is found
            }
          }
        }
        return false; // Return false if no common setup is found after checking all elements
      };

      if (findCommonSetup(client, therapist)) {
        if (client.therapySetup.includes('Online')) {
          return true;
        } else if (client.therapySetup.includes('In-person')) {
          if (therapist.location !== client.location) {
            return false;
          }
        }
        return true; // Moved from outside the location check
      } else {
        return false;
      }
    };

    const checkApproach = (client, therapist) => {
      const findCommonApproach = (client, therapist) => {
        for (let i = 0; i < client.psyApproach.length; i++) {
          for (let j = 0; j < therapist.psyApproach.length; j++) {
            if (client.psyApproach[i] === therapist.psyApproach[j]) {
              return true;
            }
          }
        }
        return false;
      };

      return findCommonApproach(client, therapist);
    };

    const checkPrice = (client, therapist) => {
      return therapist.price <= client.price || client.price === 0;
    };

    // Store matches before loop
    const setupMatches = therapistsProfiles.map(therapist => {
      return checkSetup(clientProfile, therapist);
    });

    const approachMatches = therapistsProfiles.map(therapist => {
      return checkApproach(clientProfile, therapist);
    });

    const priceMatches = therapistsProfiles.map(therapist => {
      return checkPrice(clientProfile, therapist);
    });

    // console.log('setupMatches:', setupMatches);
    // console.log('approachMatches:', approachMatches);
    // console.log('priceMatches:', priceMatches);

    // Add matches to create to an array
    let matchesToCreate = [];
    for (let i = 0; i < therapistsProfiles.length; i++) {
      if (setupMatches[i] && approachMatches[i] && priceMatches[i]) {
        matchesToCreate.push({
          client: clientId,
          therapist: therapistsProfiles[i].user._id,
          matchedSetup: setupMatches[i],
          matchedApproach: approachMatches[i],
          matchedPrice: priceMatches[i],
          matchStatus: 'Pending',
        });
      }
    }

    // console.log('Matches to be created:', matchesToCreate);

    // check if matches already exist in the DB
    let existingMatches = [];
    for (let i = 0; i < matchesToCreate.length; i++) {
      const match = matchesToCreate[i];
      const existingMatch = await Match.findOne({
        $and: [{ therapist: match.therapist }, { client: match.client }],
      });

      if (existingMatch) {
        existingMatches.push(existingMatch);
      }
    }
    // console.log('Existing matches from DB:', existingMatches);

    // if there is a match in the DB, we should not create it again
    if (existingMatches.length > 0) {
      const filteredMatchesToCreate = matchesToCreate.filter(
        match =>
          match.therapist.toString() !== existingMatches[0].therapist.toString()
      );

      matchesToCreate = filteredMatchesToCreate;
    }

    // console.log('Filtered matches to be created', matchesToCreate);

    // Create matches in DB in bulk if there are any to create
    if (matchesToCreate.length > 0) {
      const newMatches = await Match.create(matchesToCreate);

      // Update the client with the new matches
      await User.findByIdAndUpdate(
        clientId,
        {
          $push: { matches: newMatches.map(match => match._id) },
        },
        { new: true }
      );

      console.log('New Matches in DB:', newMatches);
      res.status(201).json(newMatches);
    } else {
      res.status(501).json({ message: 'No matches to create' });
    }
  } catch (error) {
    console.log('An error occurred creating the match', error);
    next(error);
  }
});

// GET - Get all matches
// Filter per user?
// Postman - test passed
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

// GET - Get all matches per user
router.get('/matches/:userId', async (req, res, next) => {
  const { userId } = req.params;

  try {
    // GET User by id
    const user = await User.findById(userId);
    let userMatches = [];

    // if therapist - find matches: therapist = user._id
    if (user.isTherapist) {
      userMatches = await Match.find({ therapist: user._id });
    } else {
      // if client - find matches: client = user._id
      userMatches = await Match.find({ client: user._id });
    }

    console.log('All matches for the user', userMatches);
    res.status(201).json(userMatches);
  } catch (error) {
    console.log('An error occurred retrieving the matches for the user', error);
    next(error);
  }
});

// GET - Get a specific match
// Postman - test passed
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

// PUT - Edit a specific match
// to update match status & add info from therapist
// Postman - test passed
router.put('/matches/:id', async (req, res, next) => {
  const { id } = req.params;

  const { matchStatus } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      id,
      {
        matchStatus,
      },
      { new: true }
    );

    // update the therapist with the match
    // if the match doesn't exist: find user and push new match
    // if the match exists: nothing happens in the user
    await User.findOneAndUpdate(
      { _id: therapist, matches: { $nin: [updatedMatch._id] } },
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

// DELETE - Delete a specific match
// Postman - test passed
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

module.exports = router;
