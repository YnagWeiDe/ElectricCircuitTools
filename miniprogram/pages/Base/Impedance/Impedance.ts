// 定义数学常数

Page({
  data: {
    // 频率相关
    frequencyValue: "",
    frequencyUnits: ["Hz", "kHz", "MHz", "GHz"],
    frequencyUnitIndex: 0,
    
    // 电容相关
    capacitanceValue: "",
    capacitanceUnits: ["pF", "nF", "μF", "mF"],
    capacitanceUnitIndex: 2, // 默认μF
    
    // 电感相关
    inductanceValue: "",
    inductanceUnits: ["nH", "μH", "mH", "H"],
    inductanceUnitIndex: 1, // 默认μH
    
    // 结果相关
    capacitiveReactance: "",
    inductiveReactance: "",
    showResults: false
  },

  // 频率输入处理
  onFrequencyInput(e: WechatMiniprogram.Input) {
    this.setData({ frequencyValue: e.detail.value });
  },
  
  // 频率单位选择
  onFrequencyUnitChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ frequencyUnitIndex: Number(e.detail.value) });
  },
  
  // 电容输入处理
  onCapacitanceInput(e: WechatMiniprogram.Input) {
    this.setData({ capacitanceValue: e.detail.value });
  },
  
  // 电容单位选择
  onCapacitanceUnitChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ capacitanceUnitIndex: Number(e.detail.value) });
  },
  
  // 电感输入处理
  onInductanceInput(e: WechatMiniprogram.Input) {
    this.setData({ inductanceValue: e.detail.value });
  },
  
  // 电感单位选择
  onInductanceUnitChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ inductanceUnitIndex: Number(e.detail.value) });
  },

  // 单位转换辅助函数
  convertToBaseUnit(value: number, unitIndex: number, unitsType: string): number {
    if (isNaN(value)) return NaN;
    
    switch(unitsType) {
      case "frequency":
        // Hz, kHz, MHz, GHz
        return value * Math.pow(10, 3 * unitIndex);
        
      case "capacitance":
        // pF, nF, μF, mF
        // 转换为法拉(F): pF(10^-12), nF(10^-9), μF(10^-6), mF(10^-3)
        return value * Math.pow(10, -12 + 3 * unitIndex);
        
      case "inductance":
        // nH, μH, mH, H
        // 转换为亨利(H): nH(10^-9), μH(10^-6), mH(10^-3), H(1)
        return value * Math.pow(10, -9 + 3 * unitIndex);
        
      default:
        return value;
    }
  },
  
  // 格式化阻抗值
  formatImpedance(value: number): string {
    if (isNaN(value)) return "";
    
    let absValue = Math.abs(value);
    let unit = "Ω";
    
    if (absValue >= 1000000) {
      value /= 1000000;
      unit = "MΩ";
    } else if (absValue >= 1000) {
      value /= 1000;
      unit = "kΩ";
    }
    
    // 格式化数值
    let formattedValue: string;
    if (Math.abs(value) < 0.001) {
      formattedValue = value.toExponential(2);
    } else if (Math.abs(value) < 1) {
      formattedValue = value.toFixed(4).replace(/\.?0+$/, '');
    } else if (Math.abs(value) < 1000) {
      formattedValue = value.toFixed(3).replace(/\.?0+$/, '');
    } else {
      formattedValue = value.toFixed(2).replace(/\.?0+$/, '');
    }
    
    return `${formattedValue} ${unit}`;
  },
  
  // 计算函数
  calculate() {
    const { 
      frequencyValue, frequencyUnitIndex,
      capacitanceValue, capacitanceUnitIndex,
      inductanceValue, inductanceUnitIndex
    } = this.data;
    
    // 转换为基本单位 (Hz, F, H)
    const f = this.convertToBaseUnit(parseFloat(frequencyValue), frequencyUnitIndex, "frequency");
    const c = this.convertToBaseUnit(parseFloat(capacitanceValue), capacitanceUnitIndex, "capacitance");
    const l = this.convertToBaseUnit(parseFloat(inductanceValue), inductanceUnitIndex, "inductance");
    
    // 验证输入
    if (isNaN(f)) {
      wx.showToast({
        title: '请输入频率值',
        icon: 'none'
      });
      this.setData({ showResults: false });
      return;
    }
    
    if (f <= 0) {
      wx.showToast({
        title: '频率必须大于0',
        icon: 'none'
      });
      this.setData({ showResults: false });
      return;
    }
    
    if (isNaN(c) && isNaN(l)) {
      wx.showToast({
        title: '请至少输入电容或电感',
        icon: 'none'
      });
      this.setData({ showResults: false });
      return;
    }
    
    // 初始化结果
    let capacitiveReactance = "";
    let inductiveReactance = "";
    
    // 计算容抗 (Xc = 1 / (2πfC))
    if (!isNaN(c)) {
      if (c <= 0) {
        wx.showToast({ title: '电容必须大于0', icon: 'none' });
        return;
      }
      const xc = 1 / (2* Math.PI  * f * c);
      capacitiveReactance = this.formatImpedance(xc);
    }
    
    // 计算感抗 (XL = 2πfL)
    if (!isNaN(l)) {
      if (l <= 0) {
        wx.showToast({ title: '电感必须大于0', icon: 'none' });
        return;
      }
      const xl = 2* Math.PI * f * l;
      inductiveReactance = this.formatImpedance(xl);
    }
    
    this.setData({
      capacitiveReactance,
      inductiveReactance,
      showResults: true
    });
  }
});