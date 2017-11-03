var WXBizDataCrypt = require('../WXBizDataCrypt')
const { mysql } = require('../qcloud')
const config = require('../config')

module.exports = async ctx => {
    ctxObj = JSON.parse(ctx.query.reqData)
    let skey = ctx.query.key,
        encryptedData = ctxObj.encryptedData,
        iv = ctxObj.iv

    let resData

    await mysql('cSessionInfo').select('*').where({ 'skey': skey }).then(function(res) {
        let openId = res[0].open_id
        let sessionKey = res[0].session_key

        var pc = new WXBizDataCrypt(config.appId, sessionKey)
        var data = pc.decryptData(encryptedData, iv)

        console.log(data)
        ctx.state.data = { res: data }
    })
}