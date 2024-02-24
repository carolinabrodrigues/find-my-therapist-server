const { Schema, model } = require('mongoose');

const profileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  age: Number,
  gender: String,
  location: String,
  therapySetup: [String],
  psyApproach: [String],
  importantTraits: [String],
  price: Number,
  calendarLink: String,
});

const Profile = model('Profile', profileSchema);

module.exports = Profile;
