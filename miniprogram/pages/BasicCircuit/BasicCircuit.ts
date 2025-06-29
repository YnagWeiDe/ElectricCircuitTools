// pages/BasicCircuit/BasicCircuit.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  ToResistanceValue() {
    wx.navigateTo({
      url: '/pages/Base/ResistanceValue/ResistanceValue'
    });
  },
  
  // 跳转到电容值计算页面
  ToCapacitanceValue() {
    wx.navigateTo({
      url: '/pages/Base/CapacitanceValue/CapacitanceValue'
    });
  },
  
  // 跳转到基础电源计算页面
  ToCurrentVoltageResistance() {
    wx.navigateTo({
      url: '/pages/Base/CurrentVoltageResistance/CurrentVoltageResistance'
    });
  },
  
  // 跳转到频率下容感计算页面
  ToImpedance() {
    wx.navigateTo({
      url: '/pages/Base/Impedance/Impedance'
    });
  },
  
  // 跳转到谐振相关计算页面
  ToResonance1() {
    wx.navigateTo({
      url: '/pages/Base/Resonance/Resonance'
    });
  },
  ToResonanceFrequency() {
    wx.navigateTo({
      url: '/pages/Base/ResonanceT/ResonanceT'
    });
  },
  
  // 跳转到交流有效值计算页面
  ToValidValue() {
    wx.navigateTo({
      url: '/pages/Base/ValidValue/ValidValue'
    });
  },
  
  // 跳转到需求反馈页面
  ToFeedback() {
    wx.navigateTo({
      url: '/pages/Base/feedback/feedback'
    });
  },

  ToGetVef() {
    wx.navigateTo({
      url: '/pages/Base/GetVef/GetVef'
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})