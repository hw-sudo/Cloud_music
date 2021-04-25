// pages/play/play.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    action1:{
      method:"play"
    },
    //当前播放歌曲id(初始化)
    musicId:"",
    //定义歌曲的播放或者暂停状态的变量
    state:"play",
    //定义当前歌曲对象
    song:null,
    //存放最终歌词的数组
    lyricContent:null,
    //记录播放到的行号
    currentIndex:0,
    //歌词滚动的偏移量
    marginTop:0,
    //歌曲总时长
    max:0,
    //当前歌曲进度时间
    move:0,
    //当前播放时间
    playTime:"00:00",
    //结束时长
    endTime:"",
    //存放评论的变量
    commentData:null
  },

  /**
   * 生命周期函数--监听页面加载
   * options中包含上个页面传递的页面信息(参数)
   */
  onLoad: function (options) {
    //接收songlist页面传递过来的当前要播放的歌曲id、
    var mid = options.musicId;
    //将mid给data中的musicId赋值
    //this:当前对象
    this.setData({
      musicId:mid
    })
    //调用根据id获取歌曲详情的方法
    this.getMusicInfoById();
    //调用根据id获取歌词的方法
    this.getLyricById();
    //调用根据id获取评论的方法
    this.getCommentsById();
  },
  /**
   * 根据歌曲id获取评论
   */
  getCommentsById:function(){
    //获取当前播放歌曲的id
    var musicId = this.data.musicId;
    var that = this;
    //发起评论请求
    wx.request({
      url: 'https://music.163.com/api/v1/resource/comments/R_SO_4_'+musicId,
      success:function(res){
        var hotComments = res.data.hotComments;
        that.setData({
          commentData:hotComments
        })
      }
    })
  },
  /**
   * 定义根据歌曲id获取歌曲详情的方法
   */
  getMusicInfoById:function(){
    //获取当前正在播放歌曲的id
    var musicId = this.data.musicId;
    //用that记录下this（因为请求像用回调函数之后，this会改变，在没变之前存下来）
    var that = this;
    //使用歌曲id向网易云音乐服务器发请求   ajax
    wx.request({
      //url:发起请求的后台路径
      url: 'https://music.163.com/api/song/detail/?id=' + musicId + '&ids=[' + musicId+']',
      //success:接口调用成功的回调函数
      //res:result---->服务器给前端的响应内容
      success:function(res){
        //解析之后的歌曲对象
        var resultSong = res.data.songs[0];
        //将resultSong赋值给data中的song
        that.setData({
          song:resultSong
        })
      },
      //fail:接口调用失败的回调函数
      fail:function(){

      },

    })
  },
  /**
   * 根据歌曲id获取歌词
   */
  getLyricById:function(){
    //获取当前歌曲的id
    var musicId = this.data.musicId;
    var that = this;
    //根据歌曲id向歌词接口发请求
    wx.request({
      url: 'https://music.163.com/api/song/lyric?os=pc&id='+musicId+'&lv=-1&kv=-1&tv=-1',
      //成功之后执行的回调函数
      success:function(res){
        //层层遍历获取歌词内容
        var lyric = res.data.lrc.lyric;
        //调用解析歌词的方法
        var resultLyric = that.parseLyric(lyric);
        //去掉所有空字符串歌词
        resultLyric = that.sliceNull(resultLyric);
        //将resultLyric赋值给data中的歌词变量
        that.setData({
          lyricContent: resultLyric
        })
       
      },
    })
  },
  /**
   * 定义解析歌词的方法
   * 正则表达式:正则表达式通常被用来检索、替换那些符合某个模式(规则)的文本
   */
  parseLyric:function(lyric){
    //将lyric根据换行符切割成单行歌词
    //split:切割完之后返回数组
    var lyricArray = lyric.split("\n");
    //判断数组的最后一个元素是不是空字符，如果是，去掉
    if(lyricArray[lyricArray.length-1]==""){
      //去掉最后一个元素
      lyricArray.pop();
    }
    //时间规律：[00:00.000]
    //正则表达式：原子操作和数量描述
    //原子操作：abc 匹配abc
    //         [abc] 匹配a或者b或者c   abc
    //         [a-z] 匹配小写字母   [a-zA-Z]:匹配所有字母(大小写)
    //         [0-9] 匹配所有的数字 也可以写 \d（等价于[0-9]） 
    //         [a-zA-Z0-9]:匹配所有字母数字 
    //         点:匹配除了\r \n以外的任意字符
    //数量操作: {n}：代表前面字符的数量为n个
    //         {m,n}:代表前面字符的数量为m个到n个
    //  console.log("\"嘻嘻\"")   \:转义字符
    var re =  /\[\d{2}:\d{2}\.\d{2,3}]/; 
    //定义变量存储时间和歌词，并且歌词时间一一对应
    var result = []; 
    //使用forEach循环遍历歌词数组
    lyricArray.forEach(function(v/*取到数组中的每个元素*/,i/*每个元素对应的下标*/,a/*正在遍历的数组*/){
      //根据正则替换歌词中的时间
      //replace(被替换的内容，替换之后的内容)
      var lyricOne = v.replace(re,"")
      //提取时间
      var time = v.match(re);
      if(time!=null){
        //处理时间  1. 去掉外层中括号 [00:00.000]-->00:00.000
        //使用字符串的截取:slice(a,b):从下标a截取到下标b,
        //能够取到a，取不到b，左闭右开区间  [a,b)
        // js中下标可以为负值，最后一个元素的下标是长度减一或者-1
        var timeSlice = time[0].slice(1,-1);
        // 2. 统一时间单位为秒 
        var timeArray = timeSlice.split(":");
        //parseFloat():将字符串转换为小数 
        //parseInt():将字符串转换为整数
        var timeResult = parseFloat(timeArray[0]) * 60 +parseFloat(timeArray[1]);
        // 目标：将歌词跟时间一一对应
        // [
        //   [0,'作曲：李荣浩'],
        //   [1,'作词：周XX'],
        //   [30.71,'穿华丽的服装 为原始的渴望而站着']
        // ]
        //向集合/数组中添加元素使用push方法
        result.push([timeResult,lyricOne])
      }
    })
    return result;
  },
  /**
   * 去掉所有的空歌词,保留非空歌词
   */
  sliceNull:function(resultLyric){
    var result = [];
    for(var i=0;i<resultLyric.length;i++){
      //判断歌词是否为空
      if(resultLyric[i][1]!=""){
        //不是空，添加到result中
        result.push(resultLyric[i]);
      }
    }
    return result;
  },
  /**
   * 拖动进度条执行的方法
   */
  dragProgress:function(e){
    //获取拖动位置的值(时间)
    var value = e.detail.value;
    //修改歌曲进度
    this.setData({
      action1:{
        method:"setCurrentTime",
        data:value
      }
    })
  },
  /**
   * 歌曲进度改变时,触发执行的方法
   */
  changeTime:function(e){
    //1.---进度条实现
    //获取当前的歌曲播放进度   
    var currentTime = e.detail.currentTime;
    //获取歌曲的总时长
    var duration = e.detail.duration;
    //1.---将当前歌曲进度转换为几分几秒的格式
    // 121秒----》02:01
    //计算播放时长的分
    //Math.floor：向下取整  3.12-->3
    //Math.ceil:向上取整
    //Math.round:四舍五入
    var playMinutes = Math.floor(currentTime/60);
    //计算播放时长的秒
    var playSeconds = Math.floor(currentTime%60);
    if(playMinutes<10){
      playMinutes = "0"+playMinutes;
    } 
    if(playSeconds<10){
      playSeconds = "0"+playSeconds;
    }
    //2.---将歌曲总时长转换为几分几秒的格式
    var endMinutes = Math.floor(duration/60);
    var endSeconds = Math.floor(duration%60);
    if (endMinutes < 10) {
      endMinutes = "0" + endMinutes;
    }
    if (endSeconds < 10) {
      endSeconds = "0" + endSeconds;
    }
    //给data中的max和move、playTime、endTime赋值
    this.setData({
      max:duration,
      move:currentTime,
      playTime:playMinutes+":"+playSeconds,
      endTime:endMinutes+":"+endSeconds
    })




    
    //2---获取所有的歌词(二维数组)
    var lyricArray = this.data.lyricContent;
    //修改marginTop:跟行号有关系
    if(this.data.currentIndex>=6){
      //计算marginTop的值
      this.setData({
        marginTop:(this.data.currentIndex-6)*30
      })
    }else{
      this.setData({
        marginTop:0
      })
    }
    //判断是否唱到倒数第二句
    if(this.data.currentIndex==lyricArray.length-2){
      //判断当前歌曲进度是否大于最后一行的起始时间
      if(currentTime>=lyricArray[lyricArray.length-1][0]){
        this.setData({
          currentIndex:lyricArray.length-1
        })
      }
    }else{
      //遍历所有的歌词(除了最后一句))
      //将当前歌曲播放进度跟每句歌词的时间都对比
      for (var i = 0; i < lyricArray.length-1; i++) {
        //将当前歌曲的进度与歌词时间比较，要满足
        //大于等于当前行的时间，且小于下一行的时间
        if (currentTime >= lyricArray[i][0] && currentTime < lyricArray[i + 1][0]) {
          //记录行号
          this.setData({
            currentIndex: i
          })
        }
      }
    }
    
  },
  /**
   * 暂停与播放
   */
  pauseOrPlay:function(){
    //获取当前歌曲是什么状态？播放？ 暂停？
    var state = this.data.state;
    //判断当前的状态(state)
    if(state=='play'){
      //修改为暂停状态
      this.setData({
        action1:{
          method:"pause"
        },
        state:"pause"
      })
    }else{
      //修改为播放状态
      this.setData({
        action1:{
          method:"play"
        },
        state:"play"
      })
    }

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