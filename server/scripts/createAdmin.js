// Script to create an admin user

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

(async () => {
    await mongoose.connect(process.env.MONGODB_URL);

    const hashed = await bcrypt.hash("12345", 10);

    await User.create({
        username: "Admin",
        email: "admin@capstone.com",
        passwordHash: hashed,
        role: "ADMIN",
        permissions: [
            "MANAGE_USERS",
            "MANAGE_POLICIES",
            "MANAGE_CLAIMS",
            "MANAGE_TREATIES",
            "VIEW_DASHBOARD"
        ],
        status: "ACTIVE",
        lastLoginAt: new Date(),
    });

    console.log("Admin user created");

    process.exit();
})();