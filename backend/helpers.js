module.exports.asset = function (path) {
    return new URL(path , process.env.APP_URL.replace(/^\/|\/$/g, '')).href
}