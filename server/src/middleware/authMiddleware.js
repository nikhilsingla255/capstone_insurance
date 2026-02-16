const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;
    
    // Check for token in Authorization header
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer')) {
        token = auth.split(" ")[1];
    }
    
    // Check for token in cookies
    if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not Authorized' });
    }

    try{
        const verifiedToken = jwt.verify(token,process.env.JWT_SECRET);
        req.user = await User.findById(verifiedToken.id).select("-passwordHash");

        next();
    }catch(e){
        res.status(401).json({message:'Invalid Token'})
    }
}