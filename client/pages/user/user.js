var qcloud = require('../../vendor/wafer2-client-sdk/index');
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

Page({

  /**
   * 页面的初始数据
   */
  data: {
  /**
   * 链接
   */
    uploadUserUrl: config.service.upUserInfoUrl,
    companiesUrl: config.service.companiesUrl,

    realName:'',
    phoneNum:'',
    company:'',
    companyArr:[],
    companyIndex:0,
    companyId:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // var userInfo = wx.getStorageSync("userInfo")
    // // console.log(userInfo)
    // this.setData({
    //   realName: userInfo.nickName,
    //   avatarUrl:userInfo.avatarUrl
    // })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let userData = wx.getStorageSync('userData');
    let userInfo = wx.getStorageSync('userInfo')
    let c_name = '';

    if (userData.username != userInfo.nickName){
      c_name = userData.username
    }

    this.setData({
      company: userData.company,
      realName: c_name,
      phoneNum:userData.phone
    })

    // 进入获取公司列表
    this.getCompanies();
  },

  onInput: function (e) {
    var d = {};
    var val = e.detail.value
    d[e.target.id] = val;
    this.setData(d);
  },

  /**
   * 获取公司列表
   */
  getCompanies(){
    let that = this;
    qcloud.request({
      // 要请求的地址
      url: that.data.companiesUrl,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      // data: reqJson,
      success(result) {
        that.setData({
          companyArr: result.data.companies
        })
        var nowCompanyId = wx.getStorageSync('userData').company.id
        console.log(nowCompanyId)
        result.data.companies.forEach(function(el,index){
          if(el.id == nowCompanyId){
            that.setData({
              companyIndex: index
            })
          }
        })
      },
      fail(error) {
        showModel('请求失败', error);
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    })
  },

// 公司选择
  bindPickerChange: function (e) {
    
    let index = e.detail.value
    let val = this.data.companyArr[index]
    console.log('picker发送选择改变，携带值为', val.id)
    this.setData({
      companyIndex: index,
      companyId: val.id
    })

    // console.log(this.data.qcompanyId)
  },

  uploadUserInfo:function(){
    let that = this;
    let reg = new RegExp(/^1(3|4|5|7|8)[0-9]\d{8}$/)
    if (that.data.realName == ''){
      wx.showModal({
        content: '请填写您的真实姓名',
        showCancel: false
      });
      return
    } else if(!reg.test(that.data.phoneNum)) {
      wx.showModal({
        content: '请填写正确的联系方式',
        showCancel: false
      });
      return
    }
    let req = {
        userInfo:{
            userOpenid: wx.getStorageSync('userInfo').openId,
            companyId: that.data.companyId,
            phone: that.data.phoneNum,
            name: that.data.realName,
            avatarUrl: wx.getStorageSync('userInfo').avatarUrl
          }
        }
    let reqJson = JSON.stringify(req)
    qcloud.request({
      // 要请求的地址
      url: that.data.uploadUserUrl,
      method: 'POST',
      // header: {
      //   'content-type': 'application/x-www-form-urlencoded' // 默认值
      // },
      data: reqJson,
      success(result) {
        showSuccess('保存成功');
        wx.setStorageSync('isExit', true);
        let userInfo = {
          companyId: that.data.companyId,
          companyName: that.data.companyArr[that.data.companyIndex * 1].name,
          company: that.data.companyArr[that.data.companyIndex * 1],
          phone: that.data.phoneNum,
          name: that.data.realName,
          avatarUrl: wx.getStorageSync('userInfo').avatarUrl,
          lastUpdateTime: wx.getStorageSync('userData').lastUpdateTime
        }
        wx.setStorageSync('userData', userInfo)
        // wx.navigateTo({ url: '../index/index' });
        wx.navigateBack({
          delta: 1
        })
      },
      fail(error) {
        showModel('请求失败', error);
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    })
  }

})