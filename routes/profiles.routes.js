const router = require('express').Router();
const mongoose = require('mongoose');
const Profile = require('../models/Profile.model');
const User = require('../models/User.model');

// POST - Create a new profile
router.post('/profiles', async (req, res, next) => {
  const {
    userId,
    age,
    gender,
    location,
    therapySetup,
    psyApproach,
    importantTraits,
    price,
    calendarLink,
  } = req.body;

  try {
    // create a new profile in the DB
    const newProfile = await Profile.create({
      user: userId,
      age,
      gender,
      location,
      therapySetup,
      psyApproach,
      importantTraits,
      price,
      calendarLink,
    });

    // update the user with the profile
    await User.findByIdAndUpdate(userId, {
      $push: { profile: newProfile._id },
    });

    console.log('New Profile:', newProfile);
    res.status(201).json(newProfile);
  } catch (error) {
    console.log('An error occurred creating the profile', error);
    next(error);
  }
});

// Postman - test passed without userId (there are no users yet)
// TO-DO - Postman test with userId

// GET - Get all profiles
// QUESTION - Will I use it?
router.get('/profiles', async (req, res, next) => {
  try {
    const profiles = await Profile.find({});

    console.log('All profiles:', profiles);
    res.status(201).json(profiles);
  } catch (error) {
    console.log('An error occurred retrieving the profiles', error);
    next(error);
  }
});

// GET - Get a single profile
router.get('/profiles/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // throw an error if the id is not valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const profile = await Profile.findById(id);

    // to check if the id exists in the DB:
    if (!profile) {
      return res.status(404).json({ message: 'No profile found' });
    }

    res.json(profile);
  } catch (error) {
    console.log('An error occurred retrieving the profile', error);
    next(error);
  }
});
// Postman - test passed

// PUT - Edit a single profile
router.put('/profiles/:id', async (req, res, next) => {
  const { id } = req.params;

  // QUESTION: the userId is not supposed to be updated - should it be retrieved from the req.body anyways?
  const {
    age,
    gender,
    location,
    therapySetup,
    psyApproach,
    importantTraits,
    price,
    calendarLink,
  } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const updatedProfile = await Profile.findByIdAndUpdate(
      id,
      {
        age,
        gender,
        location,
        therapySetup,
        psyApproach,
        importantTraits,
        price,
        calendarLink,
      },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'No profile found' });
    }

    res.json(updatedProfile);
  } catch (error) {
    console.log('An error occurred updating the profile', error);
    next(error);
  }
});
// Postman - test passed

module.exports = router;
