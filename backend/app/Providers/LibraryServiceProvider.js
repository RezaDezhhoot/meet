const path = require('path');
const appDir = path.dirname(require.main.filename);
const LibraryDir = path.join(appDir,'app','Libraries');

exports.load = (app) => {
    require(path.join(LibraryDir,'Dotenv.js'));

    require(path.join(LibraryDir,'Morgan.js')).useByApp(app);

    require(path.join(LibraryDir,'Passport.js')).useByApp(app);

    require(path.join(LibraryDir,'Useragent.js')).useByApp(app);

    require(path.join(LibraryDir,'I18n.js')).useByApp(app);
}