const Setting = require('../../../Models/Setting');
const helpers = require("../../../../../../utils/helpers");

module.exports.base = async (req , res) => {
    const title = await Setting.findOne({where:{name: 'title' }})
    const logo = await Setting.findOne({where:{name:'logo'}})

    return res.status(200).json({
        data:{
            title: title?.value,
            logo:  helpers.asset( logo?.value),
        },
        message: res.__("general.success")
    });
}