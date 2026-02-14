const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleGuard");

router.post("/create", protect, authorize("ADMIN"), userController.createUser);
router.get("/", protect, authorize("ADMIN"), userController.getUsers);
router.get("/:id", protect, authorize("ADMIN"), userController.getUserById);
router.put("/:id", protect, authorize("ADMIN"), userController.updateUser);
router.delete("/:id", protect, authorize("ADMIN"), userController.deleteUser);

module.exports = router;