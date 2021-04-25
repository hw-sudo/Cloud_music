// pages/nav/nav.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navs:[
      {
        title:"本地音乐",
        index:0
      },
      {
        title: "下载管理",
        index:1
      },
      {
        title: "我的电台",
        index:2
      },
      {
        title: "我的收藏",
        index:3
      }
    ],
    //定义变量记录导航条的位置
    navPosition:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 鼠标点击导航栏执行的方法
   */
  changeNav:function(e){
    //接收点击的index
    var index = e.currentTarget.dataset.index;
    //修改导航条的位置
    this.setData({
      navPosition:index
    })
  },
  /**
   * 监听滑块滑动
   */
  changeSwiper:function(e){
    //获取当前滑块所在的下标
    var current = e.detail.current;
    //将滑块下标赋值给navPosition
    this.setData({
      navPosition:current
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})