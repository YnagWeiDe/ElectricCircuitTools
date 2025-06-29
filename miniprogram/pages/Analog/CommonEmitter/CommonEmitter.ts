Page({
  data: {
    type: 'npn', // npn 或 pnp
    vbb: '5',
    vcc: '12',
    rb: '220',
    rc: '2.2',
    re: '1.0',
    beta: '100',
    vbe: '0.7',
    VceSat: '0.2',
    
    // 计算结果
    ib: '',
    ic: '',
    ie: '',
    vce: '',
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
    const rc = parseFloat(this.data.rc) || 0;
    const re = parseFloat(this.data.re) || 0;
    const beta = parseFloat(this.data.beta) || 0;
    const vbe = parseFloat(this.data.vbe) || 0;
    const VceSat = parseFloat(this.data.VceSat) || 0.2;
    
    let ib, ic, ie, vce, calcState, calcStateClass;
    
    if (this.data.type === 'npn') {
      // NPN计算逻辑
      ib = (vbb - vbe) / (rb * 1000); // 转换为安培
      ic = beta * ib;
      ie = ic + ib;
      vce = vcc - ic * (rc * 1000) - ie * (re * 1000);
      
      // 确定工作状态
      if (ib <= 0) {
        vce = vcc;
        calcState = '截止区';
        calcStateClass = 'cutoff';
        ic = 0;
        ie = 0;
      } else if (vce < VceSat) {
        vce = VceSat;
        calcState = '饱和区';
        calcStateClass = 'saturation';
        // 饱和区电流重新计算
        ic = (vcc - vce) / (rc * 1000 + re * 1000);
        ib = ic / beta;
        ie = ic + ib;
      } else {
        calcState = '放大区';
        calcStateClass = 'amplification';
      }
    } else {
      // PNP计算逻辑
      ib = (vbb - vbe) / (rb * 1000); // 基极电流方向与NPN相反
      ic = beta * ib;
      ie = ic + ib;
      vce = vcc - ic * (rc * 1000) - ie * (re * 1000);
      
      // 确定工作状态
      if (ib >= 0) { // PNP基极电流方向相反
        vce = vcc;
        calcState = '截止区';
        calcStateClass = 'cutoff';
        ic = 0;
        ie = 0;
      } else if (vce > -VceSat) {
        vce = -VceSat;
        calcState = '饱和区';
        calcStateClass = 'saturation';
        // 饱和区电流重新计算
        ic = (vcc - Math.abs(vce)) / (rc * 1000 + re * 1000);
        ib = ic / beta;
        ie = ic + ib;
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
  }
});