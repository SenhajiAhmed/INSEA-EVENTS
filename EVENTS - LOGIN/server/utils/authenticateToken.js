const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.sendStatus(401); // if there isn't any token
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.sendStatus(403); // if token is no longer valid
        }
        req.user = user;
        next(); // move on to the next middleware or route handler
    });
}

module.exports = authenticateToken;