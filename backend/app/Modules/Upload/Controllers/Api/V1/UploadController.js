const {asset} = require("../../../../../../helpers")
const path = require("path")

module.exports.uploadScreenRecorder = (req , res) => {

}

module.exports.uploadFile = (req , res) => {
    if (!req.file) {
        return res.status(400).json({
            data: {
                message: 'No file uploaded'
            }
        });
    }
    console.log(req.file.path)
    return res.status(201).json({
        data: {
            addr: asset(req.file.path)
        }
    });
}


module.exports.showFile = (req , res, next) => {
    const file = req.params.file

    res.setHeader('Content-Type', 'application/pdf');
    return res.sendFile(path.join(__dirname,'../../../../../../','./uploads', file));
}