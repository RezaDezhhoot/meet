const cors = require('cors');
exports.Headers = (req, res, next) => {
    res.set(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    }));

    next();
}