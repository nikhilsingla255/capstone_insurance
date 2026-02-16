const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer')) {
        token = auth.split(" ")[1];
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