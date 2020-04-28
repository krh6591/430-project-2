const models = require('../models');

const { Pixt } = models;

const pixBufSize = 32 * 32 * 3;

const mainPage = (req, res) => {
  Pixt.PixtModel.findAll((err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'Error' });
    }

    return res.render('app', { csrfToken: req.csrfToken(), pixts: docs });
  });
};

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

const getPixts = (request, response) => {
  const res = response;
  
  console.log(request.session);
  
  const search = {
    _id: request.session._id
  };

  return Pixt.PixtModel.findAll((err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'Error' });
    }

    return res.json({ pixts: docs });
  });
};

module.exports = {
  mainPage,
  createPixt,
  getPixts,
};
