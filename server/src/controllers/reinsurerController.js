const Reinsurer = require("../models/Reinsurer");

exports.createReinsurer = async (req, res) => {
  try {
    const reinsurer = await Reinsurer.create(req.body);
    res.status(201).json(reinsurer);
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
};

exports.getReinsurers = async (req, res) => {
  const reinsurers = await Reinsurer.find();
  res.json(reinsurers);
};

exports.updateReinsurer = async (req, res) => {
  const reinsurer = await Reinsurer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(reinsurer);
};