const Treaty = require("../models/Treaty");

exports.createTreaty = async (req, res) => {
  try {
    const treaty = await Treaty.create(req.body);
    res.status(201).json(treaty);
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
};

exports.getTreaties = async (req, res) => {
  const treaties = await Treaty.find().populate("reinsurerId");
  res.json(treaties);
};

exports.updateTreaty = async (req, res) => {
  const treaty = await Treaty.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(treaty);
};