// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/wafer2-client-sdk/index');

// 引入配置
var config = require('../../config');

// pages/person/person.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    personStepUrl: config.service.personStepUrl,

    weekData:[],
    monthData:[],

    lastData:{},

    animationData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.id)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getPersonSteps()
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })

    this.animation = animation

    animation.width('100%').step()

    this.setData({
      animationData: animation.export()
    })

    // setTimeout(function () {
    //   animation.width('100%').step()
    //   that.setData({
    //     animationData: animation.export()
    //   })
    // }.bind(that), 500)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  /**
   * 获取用户历史上传步数情况
   */
  getPersonSteps(){
    let that = this;
    qcloud.request({
      // 要请求的地址
      url: this.data.personStepUrl,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        type: 'MON',
        userOpenid: wx.getStorageSync('userInfo').openId
      },
      login: true,
      success(result) {
        let stepsData = result.data.statDatas,
            dateReg = new RegExp(/(\d{4})(\d{2})(\d{2})/),
            maxStepItem = stepsData[0];
        stepsData.sort(function(a,b){
          return b.statDate - a.statDate 
        })
        for(let i = 0;i<stepsData.length;i++){
          if (maxStepItem.step < stepsData[i].step){
            maxStepItem = stepsData[i]
          }
        }
        
        stepsData.forEach(function(el,index){
          el.statDate = el.statDate.replace(dateReg,'$2-$3')
          let per = 0
          if (el.step / maxStepItem.step * 100 > 95){
            per = '95%'
          } else if (el.step / maxStepItem.step * 100 < 30){
            per = '30%'
          }else{
            per = `${el.step / maxStepItem.step * 100}%`
          }
          // el.per = '0%'
          el.per = per

        })
        that.setData({
          lastData: stepsData.shift()
        })
        that.setData({
          weekData: stepsData
        })
      },
      fail(error) {
        showModel('请求失败', '')
        console.log('request fail', error);
      },
      complete(res) {
        wx.hideToast();
        console.log('request complete');
      }
    });
  }
})