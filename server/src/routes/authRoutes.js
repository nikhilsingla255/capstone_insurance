const router = require("express").Router();
const ctrl = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/login", ctrl.login);
router.post("/logout", protect, ctrl.logout);

module.exports = router;