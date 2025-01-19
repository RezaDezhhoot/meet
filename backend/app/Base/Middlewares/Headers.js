const cors = require('cors');
exports.Headers = (req, res, next) => {
    console.log(process.env.FRONTEND_URL)
    res.set(cors({
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'],
        credentials: true,
    }));

    next();
}