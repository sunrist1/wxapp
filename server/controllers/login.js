// 登录授权接口
const { mysql } = require('../qcloud')

module.exports = async(ctx, next) => {
    // 通过 Koa 中间件进行登录之后
    // 登录信息会被存储到 ctx.state.$wxInfo
    // 具体查看：
    if (ctx.state.$wxInfo.loginState) {
        let result = ctx.state.$wxInfo.userinfo;
        result.data = {};
        result.open = ctx.state.$wxInfo.userinfo.userinfo.openId;
        // let result = ctx.state.$wxInfo.userinfo.userinfo;

        ctx.state.data = result;
    }
}