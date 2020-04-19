// Import and setup mongoose and underscore stuff
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// const _ = require('underscore');

const convertId = mongoose.Types.ObjectId;

let PixtModel = {};

const PixtSchema = new mongoose.Schema({
  // A string of hex codes representing colors for pixels
  pixels: {
    type: String,
    required: true,
  },
  favorites: {
    type: Number,
    default: 0,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

PixtSchema.statics.toAPI = (doc) => ({
  pixels: doc.pixels,
  favorites: doc.favorites,
});

// Values to get for every fetch
const selectors = 'pixels favorites';

PixtSchema.statics.findAll = (callback) => PixtModel.find().select(selectors).lean().exec(callback);

PixtSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return PixtModel.find(search).select(selectors).lean().exec(callback);
};

// Find all Pixts
PixtSchema.statics.findByTeam = (team, callback) => {
  const search = {
    team,
  };

  return PixtModel.find(search).select(selectors).lean().exec(callback);
};

PixtModel = mongoose.model('Pixt', PixtSchema);

module.exports = {
  PixtModel,
  PixtSchema,
};
