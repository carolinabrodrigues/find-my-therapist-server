const { Schema, model } = require('mongoose');

const matchSchema = new Schema({
  client: { type: Schema.Types.ObjectId, ref: 'Client' },
  therapist: { type: Schema.Types.ObjectId, ref: 'Therapist' },
  matchedSetup: Boolean,
  matchedApproach: Boolean,
  matchedPrice: Boolean,
  matchedTraits: Boolean,
  matchStatus: {
    type: String,
    enum: [
      'Pending',
      'Accepted by Client',
      'Rejected by Client',
      'Accepted by Therapist',
      'Rejected by Therapist',
    ],
  },
});

const Match = model('Match', matchSchema);

module.exports = Match;
