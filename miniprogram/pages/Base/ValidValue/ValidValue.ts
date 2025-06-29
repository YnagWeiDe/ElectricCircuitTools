

Page({
  data: {
    // 峰值电压相关
    peakVoltage: "",
    voltageUnits: ["V", "mV", "kV"],
    voltageUnitIndex: 0, // 默认V
    
    // 频率相关
    frequency: "",
    frequencyUnits: ["Hz", "kHz", "MHz"],
    frequencyUnitIndex: 0, // 默认Hz
    
    // 初始相位相关
    initialPhase: "",
    phaseUnits: ["°", "rad"],
    phaseUnitIndex: 0, // 默认度
    
    // 结果相关
    rmsValue: "",
    angularFrequency: "",
    voltageExpression: "",
    showResults: false
  },

  // 峰值电压输入处理
  onPeakVoltageInput(e: WechatMiniprogram.Input) {
    this.setData({ peakVoltage: e.detail.value });
  },
  
  // 电压单位选择
  onVoltageUnitChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ voltageUnitIndex: Number(e.detail.value) });
  },
  
  // 频率输入处理
  onFrequencyInput(e: WechatMiniprogram.Input) {
    this.setData({ frequency: e.detail.value });
  },
  
  // 频率单位选择
  onFrequencyUnitChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ frequencyUnitIndex: Number(e.detail.value) });
  },
  
  // 初始相位输入处理
  onInitialPhaseInput(e: WechatMiniprogram.Input) {
    this.setData({ initialPhase: e.detail.value });
  },
  
  // 相位单位选择
  onPhaseUnitChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ phaseUnitIndex: Number(e.detail.value) });
  },

  // 单位转换辅助函数
  convertToBaseUnit(value: number, unitIndex: number, unitsType: string): number {
    if (isNaN(value)) return NaN;
    
    switch(unitsType) {
      case "voltage":
        // V, mV, kV
        switch(unitIndex) {
          case 0: return value;       // V
          case 1: return value / 1000; // mV → V
          case 2: return value * 1000; // kV → V
          default: return value;
        }
      
      case "frequency":
        // Hz, kHz, MHz
        return value * Math.pow(1000, unitIndex);
        
      default:
        return value;
    }
  },
  
  // 格式化电压值
  formatVoltage(value: number): string {
    if (isNaN(value)) return "";
    
    const absValue = Math.abs(value);
    let unit = "V";
    
    if (absValue >= 1000) {
      value /= 1000;
      unit = "kV";
    } else if (absValue < 0.1) {
      value *= 1000;
      unit = "mV";
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
      peakVoltage, voltageUnitIndex,
      frequency, frequencyUnitIndex,
      initialPhase, phaseUnitIndex
    } = this.data;
    
    // 转换为基本单位 (V, Hz)
    const vmax = this.convertToBaseUnit(parseFloat(peakVoltage), voltageUnitIndex, "voltage");
    const f = this.convertToBaseUnit(parseFloat(frequency), frequencyUnitIndex, "frequency");
    const phase = parseFloat(initialPhase);
    
    // 验证输入
    if (isNaN(vmax)) {
      wx.showToast({
        title: '请输入峰值电压',
        icon: 'none'
      });
      this.setData({ showResults: false });
      return;
    }
    
    if (isNaN(f)) {
      wx.showToast({
        title: '请输入频率',
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
    
    // 处理初始相位 - 修复：直接使用phaseRad
    let phaseRad = 0;

    if (!isNaN(phase)) {
      if (phaseUnitIndex === 1) { // 度
        phaseRad = phase * 57.2958;
      } else { // 弧度
        phaseRad = phase;
      }
    }
    
    // 计算有效值 (RMS)
    const rms = vmax / Math.sqrt(2);
    
    // 计算角频率
    const omega = 2 * Math.PI * f;
    
    // 生成瞬时电压表达式 - 修复：使用phaseRad的值
    let expression = `v(t) = ${this.formatVoltage(vmax)} × sin(${omega.toFixed(2)}t`;
    
    if (!isNaN(phase)) {
      // 直接使用phaseRad的值
      if (phaseRad >= 0) {
        expression += ` + ${phaseRad.toFixed(3)}`;
      } else {
        expression += ` - ${Math.abs(phaseRad).toFixed(3)}`;
      }
      
      // 添加单位说明
      expression += "°";
    } else {
      expression += ")";
    }
    
    this.setData({
      rmsValue: this.formatVoltage(rms),
      angularFrequency: omega.toFixed(2),
      voltageExpression: expression,
      showResults: true
    });
  }
});