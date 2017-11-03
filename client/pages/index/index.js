// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/wafer2-client-sdk/index');

// 引入配置
var config = require('../../config');

// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000
});

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
});

// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    });
};

/**
 * 使用 Page 初始化页面，具体可参考微信公众平台上的文档
 */
Page({

    /**
     * 初始数据，我们把服务地址显示在页面上
     */
    data: {
        loginUrl: config.service.loginUrl,
        userUrl: config.service.userUrl,
        tunnelUrl: config.service.tunnelUrl,
        uploadUrl: config.service.uploadUrl,
        weRunUrl: config.service.weRunUrl,
        openIdUrl: config.service.openIdUrl,
        // ====kns request url=====
        userInfoUrl: config.service.userInfoUrl,
        upStepsUrl: config.service.upStepsUrl,
        stepsRankUrl: config.service.stepsRankUrl,
        getNoticeUrl: config.service.noticeUrl,

        firstEnter:false,  // 是否首次进入小程序
        tunnelStatus: 'closed',
        tunnelStatusText: {
            closed: '已关闭',
            connecting: '正在连接...',
            connected: '已连接'
        },
        imgUrl: '',
        avatarImgUrl:'',
        realName:'',
        phoneNum:'',
        company:'',
        lastUpdateTime:'',
        rankArr:[],
        selfRank:{},

        isDay:true,
        isWeek:false,
        isMonth:false
    },
    onLoad:function(){
      console.log()
    },
    onReady: function () {
      // this.doLogin();
      this.doCheckSession();
      this.getRankData(1);

    },
    onShow:function(){
      this.refreshUserInfo();

      // wx.navigateTo({ url: '../person/person' });
    },
    /*
    * 分享活动首页
    */
    onShareAppMessage: function (res) {
      if (res.from === 'button') {
        // 来自页面内转发按钮
        console.log(res.target)
      }
      return {
        title: '凯歌悦跑 竞步善行',
        path: '/pages/index/index',
        imageUrl:'https://pc.efoundation.com.cn/newlife/common/asset/images/share_img_wxapp.jpg',
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    },

    /**
     * 点击「登录」按钮，测试登录功能
     */
    doLogin() {
        // showBusy('正在登录');
        let that = this;
        // 登录之前需要调用 qcloud.setLoginUrl() 设置登录地址，不过我们在 app.js 的入口里面已经调用过了，后面就不用再调用了
        qcloud.login({
            success(result) {
                // showSuccess('登录成功');
                // console.log('登录成功', result);
                let key = qcloud.getSession();
                wx.getUserInfo({
                  success:(res)=>{
                    qcloud.request({
                      // 要请求的地址
                      url: that.data.openIdUrl,
                      method: 'GET',
                      header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                      },
                      data: {
                        reqData: res,
                        key: key
                      },
                      // login: true,
                      success(result) {
                        // showSuccess('登录成功');
                        let userInfo = result.data.data.res;
                        that.setData({
                          realName: userInfo.nickName,
                          avatarImgUrl:userInfo.avatarUrl
                        })
                        wx.setStorageSync("userInfo", result.data.data.res);
                        that.isUserExit(result.data.data.res.openId)
                      },
                      fail(error) {
                        // showModel('请求失败', error);
                        that.doLogin();
                        console.log('request fail', error);
                      },
                      complete() {
                        console.log('request complete');
                      }
                    })
                  }
                })
            },

            fail(error) {
                showModel('登录失败', error);
                console.log('登录失败', error);
            }
        });
    },

    /**
     * 校验checksession
     */
    doCheckSession() {
      let that = this;
      wx.checkSession({
        success: function (res) {
          // console.log(res)
          that.refreshUserInfo()
          that.getRankData();
          that.doLogin();
          that.getNotice();
        },
        fail: function () {
          //登录态过期
          that.doLogin() //重新登录
          that.refreshUserInfo()
        }
      })
      // qcloud.request({
      //   // 要请求的地址
      //   url: this.data.userUrl,
      //   method: 'GET',
        
      //   success(result) {
      //     console.log(result)
      //   },
      //   fail(error) {
      //   },
      //   complete() {
      //   }
      // });
    },

    /**
     * 校验用户是否已经注册
     */
    isUserExit:function(openid){
      let that = this;
      qcloud.request({
        url: that.data.userInfoUrl,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        data:{
          "userOpenid":openid
        },
        success(res){
          // console.log("========isUserExit========:"+JSON.stringify(res))
          if (res.data.isExists === false){
            that.setData({
              firstEnter:true
            })
          }else{
            wx.setStorageSync('userData', res.data)
            that.refreshUserInfo()
          }
          that.getRankData(0);
        }
      })
    },

    /**
     * 更新用户信息
     */
    refreshUserInfo(){
      let data = wx.getStorageSync('userData');
      let avatarUrl = wx.getStorageSync('userInfo').avatarUrl;
      if(!data) return;
      let updateTime = '';
      if (data.lastUpdateTime !== undefined){
        let time = new Date(data.lastUpdateTime);
        updateTime = time.getFullYear() + '.' 
                    + (time.getMonth() + 1) + '.' 
                    + time.getDate() + ' '
                    + time.getHours() + ':'
                    + time.getMinutes() + ':'
                    + time.getSeconds()
      }
      this.setData({
        realName: data.username,
        company: data.company.name,
        phoneNum: data.phone,
        lastUpdateTime: updateTime,
        avatarImgUrl: avatarUrl
      })
    },

    // 请求微信运动数据
    doRequestYun() {
      if(!wx.getWeRunData){
        showModel('提示', '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。');
        return
      }
      showBusy('正在上传数据...');
      let that = this;
      let key = qcloud.getSession();
      wx.getWeRunData({
        success:res=>{
          qcloud.request({
            // 要请求的地址
            url: this.data.weRunUrl,
            method:'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            data:{
              reqData: res,
              key: key
            },
            login: true,
            success(result) {
              // showSuccess('请求成功完成');
              that.uploadStepsData(result.data.data.res);
            },
            fail(error) {
              // showModel("提示", "上传运动数据发生了错误，请重新上传");
              // if(error.code == -1){
                that.doLogin()
              // }else{
              //   showModel('请求失败', error);
              // }
              console.log('request fail', error);
            },
            complete(res) {
              // console.log(res)
              console.log('request complete');
            }
          });
        },
        complete:res=>{
          // showSuccess("获取运动数据成功")
        },
        fail:res=>{
          showModel('请求微信运动失败',res)
          console.log(res)
        }
      })
    },

    /**
     * 上传步数数据
     */
    uploadStepsData(data){
      let user = wx.getStorageSync('userData')
      // let newData = [];
      // if(user.username == '郭俊杰'){
        // data.forEach(function (el, index) {
        //   let obj = el;
        //   obj.step = el.step + 2000
        //   newData.push(obj)
        // })
      // }
      let that = this;
      qcloud.request({
        // 要请求的地址
        url: this.data.upStepsUrl,
        method: 'POST',
        // header: {
        //   'content-type': 'application/x-www-form-urlencoded' // 默认值
        // },
        data: {
          // stepData: newData,
          stepData: data,
          userOpenid: wx.getStorageSync('userInfo').openId
        },
        login: true,
        success(result) {
          showSuccess('上传步数完成');
          // console.log(result)
          that.getRankData();
          that.doLogin();        
        },
        fail(error) {
          showModel('上传步数失败', error);
          console.log('request fail', error);
        },
        complete() {
          console.log('request complete');
        }
      });
    },

    /**
     * 获取运动排名信息
     */
    getRankData(e){
      let type = 0;
      type = e && e.target ? e.target.id : 0;
      showBusy('正在加载排行数据...');
      let that = this;
      qcloud.request({
        // 要请求的地址
        url: this.data.stepsRankUrl,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        data: {
          type: type,
          userOpenid: wx.getStorageSync('userInfo').openId
        },
        login: true,
        success(result) {
          // showSuccess('请求成功完成');
          if (type == 0){
            that.setData({
              isDay:true,
              isWeek:false,
              isMonth:false
            })
          }else if(type == 2){
            that.setData({
              isDay: false,
              isWeek: true,
              isMonth: false
            })
          } else if (type == 1){
            that.setData({
              isDay: false,
              isWeek: false,
              isMonth: true
            })
          }
          let rankArr = result.data.statDatas;
          let haveSelf = false;
          if (!rankArr)return
          rankArr.forEach(function(el,index){
            if (el.isSelf === 'true'){
              that.setData({
                selfRank:el
              })
              haveSelf = true;
            }
          })
          if(!haveSelf){
            that.setData({
              selfRank: {}
            })
          }
          that.setData({
            rankArr: rankArr
          })
        },
        fail(error) {
          // showModel('请求失败', JSON.stringify(error));
          showModel('请求失败','')
          console.log('request fail', error);
        },
        complete(res) {
          wx.hideToast();
          // showModel('请求完成', JSON.stringify(res));
          console.log('request complete');
        }
      });
    },

    /**
     * 获取公告
     */
    getNotice(){
      let that = this;
      qcloud.request({
        // 要请求的地址
        url: that.data.getNoticeUrl,
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        login: true,
        success(result) {
          if (result.data.notices.length < 1)return;
          let noticeObj = result.data.notices[0];

          wx.showModal({
            title: noticeObj.title,
            content: noticeObj.content,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        },
        fail(error) {
          showModel('请求失败', error);
          that.doLogin();
          console.log('request fail', error);
        },
        complete() {
          console.log('request complete');
        }
      })
    },

    /**
     * 点击跳转修改个人信息页面
     */
    openUserEdit() {
      // 微信只允许一个信道再运行，聊天室使用信道前，我们先把当前的关闭
      wx.navigateTo({ url: '../user/user' });
    },

});
