const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ROLES,ROLE_PERMISSIONS } = require('../constants/rolePermissions');

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const lowerEmail = email.toLowerCase();

        if (!(Object.values(ROLES).includes(role))) {
            return res.status(400).json({ message: "Invalid role" });
        }
        const exists = await User.exists({ email: lowerEmail });
        if (exists) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await User.create({
            username,
            email: lowerEmail,
            passwordHash,
            role,
            permissions: ROLE_PERMISSIONS[role],
            status: "ACTIVE",
        });
        res.status(201).json(user);
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
}

exports.getUsers = async (req, res) => {
    try {
        const allUsers = await User.find();
        res.status(200).json(allUsers)
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
}

exports.getUserById = async (req, res) => {
    try {
        const singleUser = await User.findById(req.params.id)

        if (!singleUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(singleUser);

    } catch (e) {
        res.status(400).json({ message: e.message })
    }
}

exports.updateUser = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    res.json(user);
};

exports.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
};