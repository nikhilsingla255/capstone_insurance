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

exports.getReinsurerById = async (req, res) => {
  try {
    const reinsurer = await Reinsurer.findById(req.params.id);
    if (!reinsurer) {
      return res.status(404).json({ message: "Reinsurer not found" });
    }
    res.json(reinsurer);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.updateReinsurer = async (req, res) => {
  try {
    const reinsurer = await Reinsurer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!reinsurer) {
      return res.status(404).json({ message: "Reinsurer not found" });
    }
    res.json(reinsurer);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.deleteReinsurer = async (req, res) => {
  try {
    const reinsurer = await Reinsurer.findByIdAndDelete(req.params.id);
    if (!reinsurer) {
      return res.status(404).json({ message: "Reinsurer not found" });
    }
    res.json({ message: "Reinsurer deleted successfully", reinsurer });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};