const router = require('express').Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isAuthenticated } = require('../middleware/jwt.middleware');

const saltRounds = 10;

// Signup route
router.post('/signup', async (req, res, next) => {
  const { email, password, firstName, lastName, isTherapist } = req.body;

  try {
    // validation
    // check if the values are really strings and not empty values
    if (
      email === '' ||
      password === '' ||
      firstName === '' ||
      lastName === ''
    ) {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    // email validation with regex
    const emailRegex = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/;

    // testing the email
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Provide a valid email address' });
    }

    // password validation with regex
    const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,64})/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must have at least 8 characters and contain one number, one lowercase, one uppercase, and one special character',
      });
    }

    // check if email already exists in the DB
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: 'The provided email is already registered' });
    }

    // encrypting the password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // create user
    const newUser = await User.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      isTherapist,
      matches: [],
    });

    // returning the created user without the hashed Password
    res.json({
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      _id: newUser._id,
      isTherapist: newUser.isTherapist,
    });
  } catch (error) {
    console.log('Error creating the user', error);
    next(error);
  }
});
// Postman - test passed

// Login route
// it doesn't post on the DB
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (email === '' || password == '') {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const user = await User.findOne({ email });

    // throw an error if there is no user
    if (!user) {
      return res
        .status(400)
        .json({ message: 'Provided email is not registered' });
    }

    // test if typed password (password) and stored hash password (user.password) match
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (isPasswordCorrect) {
      // create a payload for the JWT with the user info
      // QUESTION: do we need all the data from the user?
      const payload = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isTherapist: user.isTherapist,
      };

      // encrypting the token by mixing it with the token_secret
      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: 'HS256', // algorithm we want to encrypt the token with
        expiresIn: '6h', // time to live of the JWT
      });

      res.status(200).json({ authToken });
    } else {
      return res.status(401).json({ message: 'Unable to authenticate user' });
    }
  } catch (error) {
    console.log('An error occurred logging the user', error);
    next(error);
  }
});
// Postman - test passed

// verify route
router.get('/verify', isAuthenticated, (req, res, next) => {
  // if the jwt is valid, the payload gets decoded by the middleware
  // and is made available in req.payload
  console.log('req.payload', req.payload);

  // send it back with the user data from the token
  res.json(req.payload);
});
// Postman - test passed

module.exports = router;
