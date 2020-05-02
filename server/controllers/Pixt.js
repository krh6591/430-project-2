const models = require('../models');

const { Pixt } = models;

// Pixel size (3-channel) for pixts
const pixBufSize = 32 * 32 * 3;

// Render the main app page
const mainPage = (req, res) => {
  Pixt.PixtModel.findAll((err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'Error' });
    }

    return res.render('app', { csrfToken: req.csrfToken(), pixts: docs });
  });
};

// Render the profile page
const profilePage = (req, res) => {
  const userID = req.session.account._id;
  const search = {
    _id: userID,
  };

  // Fetch favorites
  models.Account.AccountModel.findOne(search, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'Error' });
    }

    // Fetch all Pixts to filter
    Pixt.PixtModel.findAll((errr, docs) => {
      if (errr) {
        console.log(errr);
        return res.status(400).json({ error: 'Error' });
      }

      const uploads = [];
      const favorites = [];

      // Filter all Pixts created and favorited by the user
      for (let i = 0; i < docs.length; ++i) {
        if (docs[i].owner === userID) {
          uploads.push(docs[i]);
        }
        if (doc.favorites.includes(docs[i]._id)) {
          favorites.push(docs[i]);
        }
      }
      return res.render('profile', { csrfToken: req.csrfToken() });
    });
    return 0;
  });
};

// Create a new Pixt from the provided pixel data
const createPixt = (req, res) => {
  // Ensure the pixel data is there
  if (!req.body.pixels) {
    return res.status(400).json({ error: 'Missing Pixt Data' });
  }

  // Ensure the data is valid
  if (typeof req.body.pixels !== 'string' || req.body.pixels.length !== pixBufSize) {
    return res.status(400).json({ error: 'Invalid Pixt Data' });
  }

  const pixtData = {
    pixels: req.body.pixels,
    owner: req.session.account._id,
  };

  const newPixt = new Pixt.PixtModel(pixtData);
  const newPromise = newPixt.save();

  newPromise.then(() => res.json({ redirect: '/' }));

  newPromise.catch((err) => {
    console.log(err);
    return res.status(400).json({ error: 'Error' });
  });

  return newPromise;
};

// Fetches a full list of all Pixts
const getPixts = (request, response) => {
  const res = response;

  return Pixt.PixtModel.findAll((err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'Error' });
    }

    return res.json({ pixts: docs });
  });
};

// Set or unset a favorite for the current user
const favorite = (request, response) => {
  const search = {
    _id: request.body.pixtID,
  };

  Pixt.PixtModel.findOne(search, (err, docc) => {
    const doc = docc;
    if (err) {
      console.log(err);
      return response.status(400).json({ error: 'Error' });
    }

    // Increment favorites if being favorited, decrement for the opposite
    const toFav = request.body.toFav === 'true';
    doc.favorites += toFav ? 1 : -1;

    doc.save((errr) => {
      if (errr) {
        console.log(errr);
        return response.status(400).json({ error: 'Error' });
      }
      return response.json({});
    });
    return 0;
  });
};

module.exports = {
  mainPage,
  profilePage,
  createPixt,
  getPixts,
  favorite,
};
