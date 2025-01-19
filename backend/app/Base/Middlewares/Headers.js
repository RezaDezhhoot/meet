const cors = require('cors');
exports.Headers = (req, res, next) => {
    res.set(cors({
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    }));

    next();
}