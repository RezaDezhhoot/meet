const Setting = require('../../../Models/Setting');

module.exports.base = async (req , res) => {
    const title = await Setting.findOne({where:{name: 'title' }})
    const logo = await Setting.findOne({where:{name:'logo'}})

    return res.status(200).json({
        data:{
            title: title?.value,
            logo: logo?.value
        },
        message: res.__("general.success")
    });
}