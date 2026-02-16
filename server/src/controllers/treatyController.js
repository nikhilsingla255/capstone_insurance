const Treaty = require("../models/Treaty");
const AuditLog = require("../models/AuditLog");
const { getClientIp } = require('../utils/getClientIp');

exports.createTreaty = async (req, res) => {
  try {
    // reinsurerId comes from request body (selected by user from dropdown)
    const treaty = await Treaty.create({
      ...req.body
    });

    await AuditLog.create({
      entityType: "TREATY",
      entityId: treaty._id,
      action: "CREATE",
      oldValue: null,
      newValue: treaty,
      performedBy: req.user._id,
      ipAddress: getClientIp(req)
    });

    res.status(201).json(treaty);
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
};

exports.getTreaties = async (req, res) => {
  try {
    const treaties = await Treaty.find().populate("reinsurerId", "name code");
    res.json(treaties);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.getTreatyById = async (req, res) => {
  try {
    const treaty = await Treaty.findById(req.params.id).populate("reinsurerId", "name code");
    if (!treaty) {
      return res.status(404).json({ message: "Treaty not found" });
    }
    res.json(treaty);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.updateTreaty = async (req, res) => {
  try {
    const oldTreaty = await Treaty.findById(req.params.id);
    if (!oldTreaty) {
      return res.status(404).json({ message: "Treaty not found" });
    }
    const oldValue = oldTreaty.toObject();
    
    const treaty = await Treaty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("reinsurerId", "name code");

    await AuditLog.create({
      entityType: "TREATY",
      entityId: treaty._id,
      action: "UPDATE",
      oldValue: oldValue,
      newValue: treaty,
      performedBy: req.user._id,
      ipAddress: getClientIp(req)
    });

    res.json(treaty);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.deleteTreaty = async (req, res) => {
  try {
    const treaty = await Treaty.findById(req.params.id);
    if (!treaty) {
      return res.status(404).json({ message: "Treaty not found" });
    }

    await Treaty.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      entityType: "TREATY",
      entityId: treaty._id,
      action: "DELETE",
      oldValue: treaty,
      newValue: null,
      performedBy: req.user._id,
      ipAddress: getClientIp(req)
    });

    res.json({ message: "Treaty deleted successfully" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};