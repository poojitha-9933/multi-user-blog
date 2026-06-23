const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // This explicitly forces Vercel to treat this folder as a running engine
  res.status(200).json({ status: "Backend engine running successfully" });
};
