// Import and setup mongoose and underscore stuff
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

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
const selectors = 'pixels favorites owner _id';

// Fetch all uploaded Pixts
PixtSchema.statics.findAll = (callback) => PixtModel.find().select(selectors).lean().exec(callback);

// Fetch all uploaded Pixts from a specific owner
PixtSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return PixtModel.find(search).select(selectors).lean().exec(callback);
};

PixtModel = mongoose.model('Pixt', PixtSchema);

module.exports = {
  PixtModel,
  PixtSchema,
};
