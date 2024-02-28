const router = require('express').Router();
const mongoose = require('mongoose');
const Match = require('../models/Match.model');
const User = require('../models/User.model');
const Profile = require('../models/Profile.model');

// POST - Create a new match
// only gets info from client
router.post('/matches', async (req, res, next) => {
  try {
    // the only thing I can get from the FE is the clientId
    const { clientId } = req.body;

    // GET Profiles
    const profiles = await Profile.find({}).populate('user');

    console.log('profiles:', profiles);

    const clientProfile = profiles.find(
      profile => profile.user._id.toString() === clientId
    );
    console.log('client profile:', clientProfile); // gets the client

    const therapistsProfiles = profiles.filter(
      profile => profile.user.isTherapist === true
    );
    console.log('therapists profiles:', therapistsProfiles); // gets the array of therapists

    // Match check functions
    // FUNCTIONS ARE NOT WORKING
    const checkSetup = (client, therapist) => {
      const findCommonSetup = (client, therapist) => {
        for (let i = 0; i < client.therapySetup.length; i++) {
          for (let j = 0; j < therapist.therapySetup.length; j++) {
            if (client.therapySetup[i] === therapist.therapySetup[j]) {
              return true;
            }
          }
          return false;
        }
      };

      if (findCommonSetup(client, therapist)) {
        if (
          client.therapySetup.includes('In-person') &&
          therapist.location !== client.location
        ) {
          return false;
        }
        return true;
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
          return false;
        }
      };

      return findCommonApproach(client, therapist);
    };

    const checkPrice = (client, therapist) => {
      /* if (therapist.price <= client.price || client.price === 0) {
        return true;
      } else {
        return false;
      } */

      return therapist.price <= client.price || client.price === 0;
    };

    // Store matches before loop
    const setupMatches = therapistsProfiles.map(therapist => {
      console.log('checkSetup function:', checkSetup(clientProfile, therapist)); // -> true
      return checkSetup(clientProfile, therapist);
    });
    const approachMatches = therapistsProfiles.map(therapist => {
      return checkApproach(clientProfile, therapist);
      /* console.log(
        'checkApproach function:',
        checkApproach(clientProfile, therapist)
      ); // -> true */
    });

    const priceMatches = therapistsProfiles.map(therapist => {
      return checkPrice(clientProfile, therapist);
      // console.log('checkPrice function:', checkPrice(clientProfile, therapist)); // -> true
    });

    console.log('setupMatches:', setupMatches);
    console.log('approachMatches:', approachMatches);
    console.log('priceMatches:', priceMatches);

    const matchesToCreate = [];
    for (let i = 0; i < therapistsProfiles.length; i++) {
      if (setupMatches[i] && approachMatches[i] && priceMatches[i]) {
        matchesToCreate.push({
          client: clientId,
          therapist: therapistsProfiles[i].user._id,
          matchedSetup: setupMatches[i],
          matchedApproach: approachMatches[i],
          matchedPrice: priceMatches[i],
          matchedTraits: null,
        });
      }
    }

    console.log('Matches to create in the DB', matchesToCreate);

    // Create matches in DB in bulk if there are any to create
    if (matchesToCreate.length > 0) {
      const newMatches = await Match.create(matchesToCreate);

      // Update the client with the new matches
      await User.findByIdAndUpdate(
        clientId,
        {
          $push: { matches: { $each: newMatches.map(match => match._id) } },
        },
        { new: true }
      );

      console.log('New Matches in DB:', newMatches);
      res.status(201).json(newMatches);
    }

    /* else {
      res.status(500).json({ message: 'No matches to create' });
    } */

    /* WITH MATCHMAKING & DATABASE CREATION INSIDE LOOP
    Not best practice

    for (const therapistProfile of therapistsProfiles) {
      if (
        checkSetup(clientProfile, therapistProfile) &&
        checkApproach(clientProfile, therapistProfile) &&
        checkPrice(clientProfile, therapistProfile)
      ) {
        // create a new match in the DB
        const newMatch = await Match.create({
          client: clientId,
          therapist: therapistProfile.user._id,
          matchedSetup: checkSetup(clientProfile, therapistProfile),
          matchedApproach: checkApproach(clientProfile, therapistProfile),
          matchedPrice: checkPrice(clientProfile, therapistProfile),
          matchedTraits: null,
        });

        // update the client with the match
        await User.findByIdAndUpdate(clientId, {
          $push: { matches: newMatch._id },
        });

        console.log('New Match:', newMatch);
        res.status(201).json(newMatch); */
  } catch (error) {
    console.log('An error occurred creating the match', error);
    next(error);
  }
});
// Postman - test passed before matchmaking

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
    client,
    therapist,
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
        client,
        therapist,
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
