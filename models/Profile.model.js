const { Schema, model } = require('mongoose');

const profileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  age: Number,
  gender: String,
  location: String,
  therapySetup: { type: [String], enum: ['Remote', 'In-person'] },
  psyApproach: [String],
  importantTraits: [String],
  price: Number,
  calendarLink: String,
});

const Profile = model('Profile', profileSchema);

module.exports = Profile;
