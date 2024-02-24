const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First Name is required.'],
    },
    lastName: {
      type: String,
      required: [true, 'Last Name is required.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
    },
    isTherapist: Boolean,
    matches: [{ type: Schema.Types.ObjectId, ref: 'Match' }],
    profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model('User', userSchema);

module.exports = User;
