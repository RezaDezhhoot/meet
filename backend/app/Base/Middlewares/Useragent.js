exports.ApiHeaders = (req, res, next) => {
    const userAgent = req.useragent;
    if (
        (! userAgent.isBot) || (userAgent.isBot === 'postman' && process.env.MODE === 'development') ) {
        return next();
    } else {
        return res.status(400).json({'ua':true});
    }
}