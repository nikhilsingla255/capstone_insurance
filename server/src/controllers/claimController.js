const Claim = require("../models/Claim");

exports.createClaim = async (req, res) => {
    try {
        const claim = Claim.create(req.body);
        res.status(201).json(claim)
    } catch (error) {
        res.status(400).json({ message: error.message });
    }

}

exports.getClaims = async (req, res) => {
    try {
        const claims = await Claim.find().populate("policyId");
        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

exports.getClaimById = async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id);
        if (!claim) return res.status(404).json({ message: "Claim not found" });
        res.status(200).json(claim);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateClaimStatus = async (req, res) => {
  const { status } = req.body;
  const claim = await Claim.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );
  res.json(claim);
};

exports.deleteClaim = async (req, res) => {
  await Claim.findByIdAndDelete(req.params.id);
  res.json({ message: "Claim deleted" });
};