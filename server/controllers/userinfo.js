var WXBizDataCrypt = require('../WXBizDataCrypt')
const { mysql } = require('../qcloud')
const config = require('../config')
const moment = require('moment')

async function post(ctx, next) {
    console.log('=============post userinfo=================')
    let userinfo = ctx.request.body.userInfo
    console.log(typeof ctx.request.body)
    console.log(ctx.request.body)

    let query = {
        user_name: userinfo.name,
        phone: userinfo.phone,
        company_id: userinfo.companyId,
        avatarurl: userinfo.avatarUrl,
        open_id: userinfo.userOpenid,
        last_update_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        user_id: 1
    }

    console.log(query)

    await mysql('userinfo').insert(query).then(function(res) {
        console.log(res)
        ctx.body = ctx.request.body
    })

}

/* 
 * 用户信息获取和校验
 */
async function get(ctx, next) {
    let openid = ctx.query.userOpenid
    await mysql('userinfo').select('*').where({ 'open_id': openid }).then(function(res) {
        if (res.length < 1) {
            ctx.state.data = { isExists: false }
        }

    })
}

module.exports = {
    post,
    get
}