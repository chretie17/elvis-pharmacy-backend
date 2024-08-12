const jwt = require('jsonwebtoken');

exports.verifyToken = (roles) => {
    return (req, res, next) => {
        const token = req.headers['authorization'];

        if (!token) {
            return res.status(403).json({ message: 'No token provided' });
        }

        jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Failed to authenticate token' });
            }

            if (Array.isArray(roles) && !roles.includes(decoded.role) && decoded.role !== 'Admin') {
                return res.status(403).json({ message: 'You do not have permission to access this resource' });
            }

            req.user = decoded;
            next();
        });
    };
};
