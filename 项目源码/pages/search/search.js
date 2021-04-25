// pages/songlist/songlist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue: null,
    //定义搜索关键字变量
    kw:"",
    //歌曲数组
    songs:null,
    //定义歌曲封面数组存储歌曲列表的封面
    albumPicUrls:[],
    //搜索的条数
    limit:10,
    focus:true,
    hotKeyShow:true,
    historyKeyShow:true,
    historyKeyList:['我们的歌','我们'],
    hotKeyList:['我们的歌','我们',1]
  },

  /**
   * 生命周期函数--监听页面加载   预定义  
   */
  onLoad: function() {},
 
  clearInput() {
    //清空输入框
    this.setData({
      sInput: '',
      isNull: true,
      searchResult:[]
    })
  },
  searchThisKey(e) {
    //点击热门搜索值
    var key = e.target.dataset.key.replace(/\s+/g, "");
    this.setData({
      sInput: key,
      hotHide: true,
      isNull: false,
      haveKeys: false,
      havaResult: true,
      isCancel: true,
      inputShowed: true,
      sInput: key,
      searchResult:[]
    })
    this.searchKeyword(key, 1);
  },
  in_array(v, arr) {
    var output = true;
    for (var i in arr) {
      if (v == arr[i]) {
        output = false;
        return output;
      }
    }
    output = true;
    return output;
  },
  /**
   * 监听播放图标被点击的函数     自定义
   * e:event
   */
  gotoPlay:function(e){
      //接收页面通过事件传递的当前歌曲id参数
      var id = e.currentTarget.dataset.id;
      //跳转到播放页面
      //wx.navigateTo:保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面
      wx.navigateTo({
        //携带参数跳转播放页面路径
        // ?:路径和参数之间分隔符  格式：path?key=value&key2=value2
        url: '/pages/play/play?musicId='+id,
      })
  },
  /**
   * 舰艇mv图标被点击的函数
   */
  gotoMv:function(e){
    //接收mvid
    var mvid = e.currentTarget.dataset.mvid;
    //跳转到mv播放页面
    wx.navigateTo({
      url: '/pages/mv/mv?mvid='+mvid,
    })
  },
  /**
   * 获取输入的关键字
   */
  getKeyWord:function(e){
    //获取输入框中的内容
    var value = e.detail.value;
    //给data中的关键字赋值
    this.setData({
      kw:value
    })
  },
  gethotKeyWord:function(e){
    //获取内容
    var value = document.getElementById("hot");
    //给data中的关键字赋值
    this.setData({
      kw:value
    })
  },
  /**
   * 点击搜索按钮时触发的方法
   */
  doSearch:function(){
    //获取关键字
    var kw = this.data.kw;
    var that = this;
    if(kw!=""){
      //显示提示框
      wx.showLoading({
        title: '搜索中...',
      })
      //根据关键字搜索歌曲(发请求)
      wx.request({
        url: 'https://music.163.com/api/search/get?s=' + kw + '&type=1&limit='+that.data.limit,
        success: function (res) {
          //搜索解析之后的结果
          var resultSongs = res.data.result.songs;
          //songs没有专辑封面
          that.setData({
            songs: resultSongs
          })
          var searchIds = [];
          //遍历resultSongs,获取所有的歌曲id，并存放到数组中
          for(var i=0;i<resultSongs.length;i++){
            searchIds.push(resultSongs[i].id)
          }
          //清空图片的数组
          that.setData({
            albumPicUrls:[]
          })
          //专辑封面通过id访问歌曲详情接口获取
          that.getMusicImageById(searchIds,0,searchIds.length);
          //隐藏loading提示框
          wx.hideLoading();
        }
      })
    }
  },

  searchThisKey(e) {
    //点击热门搜索值
    var key = e.target.dataset.key.replace(/\s+/g, "");
    this.setData({
      sInput: key,
      hotHide: true,
      isNull: false,
      haveKeys: false,
      havaResult: true,
      isCancel: true,
      inputShowed: true,
      sInput: key,
      searchResult:[]
    })
    this.doSearch();
  },

  /**
   * 根据歌曲id获取歌曲封面 searchIds:搜索出来的存放所有id的数组
   * 结论：不要在for循环写异步请求，返回的结果顺序不一定跟请求顺序保持一致
   *       可以使用递归解决
   * 递归(直接或者间接的调用自己)
   *     从哪儿开始，到哪儿结束
   * 方法参数：存放所有id的数组   数组的下标(从0开始)  数组的长度
   */
  getMusicImageById:function(searchIds,i,length){
    //根据传递的下标获取id
    var id = searchIds[i];
    var that = this;
    //使用全局变量存储封面
    var albumPicUrls = this.data.albumPicUrls;
    //根据id发请求
    wx.request({
      url: 'https://music.163.com/api/song/detail/?id='+id+'&ids=['+id+']',
      success:function(res){
        //获取当前歌曲的封面
        var picUrl = res.data.songs[0].album.picUrl;
        //将封面存储到albumPicUrls
        albumPicUrls.push(picUrl);
        that.setData({
          albumPicUrls:albumPicUrls
        })
        //递归调用 加条件限制
        // i++:先赋值后计算
        // ++i:先计算后赋值
        // 1<6    2
        // 2<6    3
        // 3<6    4
        // 4<6    5
        // 5<6    6
        // 6<6 递归结束
        if(++i<length){
          that.getMusicImageById(searchIds,i,length)
        }
      }
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
    //修改查询的条数
    this.setData({
      limit: this.data.limit + 5
    })
    //调用搜索歌曲方法
    this.doSearch();
  },
  clearInput() {
    //清空输入框
    this.setData({
      'inputValue': ''
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})