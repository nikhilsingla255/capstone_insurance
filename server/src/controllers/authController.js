const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId, userRole) => {
    return jwt.sign(
        { id: userId, role: userRole },
        process.env.JWT_SECRET
    );
}

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid Credentials" });
    }

    await User.findByIdAndUpdate(
        user._id,
        { lastLoginAt: new Date() },
        {
            new: true
        }
    );

    const token = generateToken(user._id, user.role);

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
        user: {
            userId: user._id,
            name: user.username,
            email: user.email,
            role: user.role,
            permissions: user.permissions
        }
    })
}

exports.logout = async (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
}

