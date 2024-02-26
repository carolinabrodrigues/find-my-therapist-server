const { Schema, model } = require('mongoose');

const matchSchema = new Schema({
  client: { type: Schema.Types.ObjectId, ref: 'Client' },
  therapist: { type: Schema.Types.ObjectId, ref: 'Therapist' },
  matchedSetup: Boolean,
  matchedApproach: Boolean,
  matchedPrice: Boolean,
  matchedTraits: Boolean,
  didClientConfirm: Boolean,
  didTherapistConfirm: Boolean,
});

const Match = model('Match', matchSchema);

module.exports = Match;
