// pages/collector-common/index.ts
Page({
  data: {
    type: 'npn', // npn 或 pnp
    vbb: '5',
    vcc: '12',
    rb: '220',
    re: '1.0',
    beta: '100',
    vbe: '0.7',
    
    // 计算结果
    ib: '',
    ic: '',
    ie: '',
    vce: '',
    gain: '',
    calcState: '',
    calcStateClass: ''
  },

  // 切换三极管类型
  changeType(e: any) {
    const type = e.currentTarget.dataset.type;
    this.setData({ type });
  },

  // 输入处理
  onInput(e: any) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  // 计算静态工作点
  calculate() {
    // 获取输入值并转换为数字
    const vbb = parseFloat(this.data.vbb) || 0;
    const vcc = parseFloat(this.data.vcc) || 0;
    const rb = parseFloat(this.data.rb) || 0;
    const re = parseFloat(this.data.re) || 0;
    const beta = parseFloat(this.data.beta) || 0;
    const vbe = parseFloat(this.data.vbe) || 0;
    
    let ib, ic, ie, vce, gain, calcState, calcStateClass;
    
    if (this.data.type === 'npn') {
      // NPN计算逻辑 - 共集电极电路
      // Ib = (Vbb - Vbe) / (Rb + (β+1) * Re)
      ib = (vbb - vbe) / (rb * 1000 + (beta + 1) * re * 1000);
      ic = beta * ib;
      ie = (beta + 1) * ib;
      
      // Vce = Vcc - Ie * Re
      vce = vcc - ie * (re * 1000);
      
      // 电压增益 ≈ 1 (实际略小于1)
      gain = (re * 1000 * ie / vbb).toFixed(3);
      if (parseFloat(gain) > 1) gain = "≈1.000";
      
      // 确定工作状态
      if (ib <= 0) {
        calcState = '截止区';
        calcStateClass = 'cutoff';
      } else if (vce < 0.3) {
        calcState = '饱和区';
        calcStateClass = 'saturation';
      } else {
        calcState = '放大区';
        calcStateClass = 'amplification';
      }
    } else {
      // PNP计算逻辑 - 共集电极电路
      ib = (vbb - vbe) / (rb * 1000 + (beta + 1) * re * 1000);
      ic = beta * ib;
      ie = (beta + 1) * ib;
      
      vce = vcc - ie * (re * 1000);
      gain = (re * 1000 * ie / Math.abs(vbb)).toFixed(3);
      if (parseFloat(gain) > 1) gain = "≈1.000";
      
      // 确定工作状态
      if (ib >= 0) {
        calcState = '截止区';
        calcStateClass = 'cutoff';
      } else if (vce > -0.3) {
        calcState = '饱和区';
        calcStateClass = 'saturation';
      } else {
        calcState = '放大区';
        calcStateClass = 'amplification';
      }
    }
    
    // 更新计算结果
    this.setData({
      ib: (ib * 1000000).toFixed(1),  // 转换为微安
      ic: (ic * 1000).toFixed(2),     // 转换为毫安
      ie: (ie * 1000).toFixed(2),     // 转换为毫安
      vce: vce.toFixed(2),
      gain,
      calcState,
      calcStateClass
    });
    
    // 显示成功消息
    wx.showToast({
      title: '计算完成',
      icon: 'success',
      duration: 1500
    });
  },
  
  onLoad() {
    // 初始化逻辑
    wx.setNavigationBarTitle({
      title: '共集电极计算器'
    });
  }
});