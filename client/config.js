/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://669512587.junkwok.club';  // 正式环境地址
// var host = 'https://jkapsbgk.qcloud.la';  //开发环境地址
var knshost = 'https://pc.efoundation.com.cn/newlife/api/step';  // java
// var knshost = 'http://192.168.1.211:5757/weapp';    //  node
// var host = 'http://192.168.1.211:5757';
// var knshost = 'http://192.168.1.211:8080/newlife/api/step';
// var knshost = 'http://192.168.1.158:8080/newlife/api/step';

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 登录地址，用于建立会话
        loginUrl: `${host}/weapp/login`,

        // 测试的请求地址，用于测试会话
        userUrl: `${host}/weapp/user`,

        // 微信运动获取地址
        weRunUrl: `${host}/weapp/werun`,

        // 用户openId获取地址
        openIdUrl: `${host}/weapp/openid`,

        // 测试的信道服务地址
        tunnelUrl: `${host}/weapp/tunnel`,

        // 上传图片接口
        uploadUrl: `${host}/weapp/upload`,

        /**
         * 数据保存接口
         */
        // 用户信息，校验用户是否已经注册
        userInfoUrl: `${knshost}/userInfo.action`,
        // userInfoUrl: `${knshost}/userinfo`,
        // 上传用户信息
        upUserInfoUrl: `${knshost}/uploadUserInfo.action`,
        // upUserInfoUrl: `${knshost}/userinfo`,
        // 上传用户步数
        upStepsUrl: `${knshost}/uploadThirtySteps.action`,
        // 获取步数排名
        stepsRankUrl: `${knshost}/companyStat.action`,
        // 获取公司列表
        companiesUrl: `${knshost}/companies.action`,
        // 获取公告
        noticeUrl: `${knshost}/notices.action`
    }
};

module.exports = config;