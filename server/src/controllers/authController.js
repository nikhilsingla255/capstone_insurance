const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId, userRole) => {
    return jwt.sign(
        { id: userId, role: userRole },
        process.env.JWT_SECRET
    );
}

// exports.register = async (req, res) => {
//     try {
//         const { email ,role} = req.body;

//         const exists = await User.exists({ email: email.toLowerCase() });
//         if (exists) {
//             return res.status(409).json({ message: 'User with this email already exists' });
//         }

//         const user = await User.create(req.body);
//         const token = generateToken(user._id,role);

//         res.status(201).json({
//             token, user
//         });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// }

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

    res.json({
        token,
        user: {
            userId: user._id,
            name: user.username,
            email: user.email,
            role: user.role,
            permissions: user.permissions
        }
    })
}

