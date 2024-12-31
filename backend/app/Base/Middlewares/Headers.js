const cors = require('cors');
exports.Headers = (req, res, next) => {
    res.set(cors({
        origin: "*",
        methods: ['*'],
        allowedHeaders: ['*'],
        exposedHeaders: ["Authorization"],
        credentials: true,
    }));

    next();
}