// 定义数学常数

Page({
  data: {
    // 频率相关
    frequencyValue: "",
    frequencyUnits: ["Hz", "kHz", "MHz", "GHz"],
    frequencyUnitIndex: 1, // 默认kHz
    
    // 电容相关
    capacitanceValue: "",
    capacitanceUnits: ["pF", "nF", "μF", "mF"],
    capacitanceUnitIndex: 1, // 默认nF
    
    // 电感相关
    inductanceValue: "",
    inductanceUnits: ["nH", "μH", "mH", "H"],
    inductanceUnitIndex: 1, // 默认μH
    
    // 结果相关
    calculatedCapacitance: "",
    calculatedInductance: "",
    characteristicImpedance: "",
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
        return value * Math.pow(10, -12) * Math.pow(10, 3 * unitIndex);
        
      case "inductance":
        // nH, μH, mH, H
        // 转换为亨利(H): nH(10^-9), μH(10^-6), mH(10^-3), H(1)
        return value * Math.pow(10, -9) * Math.pow(10, 3 * unitIndex);
        
      default:
        return value;
    }
  },
  
  // 格式化电容值
  formatCapacitance(value: number): string {
    if (isNaN(value)) return "";
    
    const units = ["pF", "nF", "μF", "mF"];
    const factors = [1e12, 1e9, 1e6, 1e3];
    
    let bestValue = value;
    let bestUnitIndex = 3; // 从最大单位开始 (mF)
    
    // 找到最佳单位
    for (let i = units.length - 1; i >= 0; i--) {
      const converted = value * factors[i];
      if (converted >= 1 || i === 0) {
        bestValue = converted;
        bestUnitIndex = i;
        break;
      }
    }
    
    // 格式化数值
    let formattedValue: string;
    if (Math.abs(bestValue) < 0.001) {
      formattedValue = bestValue.toExponential(2);
    } else if (Math.abs(bestValue) < 1) {
      formattedValue = bestValue.toFixed(4).replace(/\.?0+$/, '');
    } else if (Math.abs(bestValue) < 1000) {
      formattedValue = bestValue.toFixed(3).replace(/\.?0+$/, '');
    } else {
      formattedValue = bestValue.toFixed(2).replace(/\.?0+$/, '');
    }
    
    // 添加相邻单位
    let result = `${formattedValue} ${units[bestUnitIndex]}`;
    
    // 添加上一单位
    if (bestUnitIndex > 0) {
      const prevValue = value * factors[bestUnitIndex - 1];
      result += ` / ${prevValue.toFixed(2)} ${units[bestUnitIndex - 1]}`;
    }
    
    return result;
  },
  
  // 格式化电感值
  formatInductance(value: number): string {
    if (isNaN(value)) return "";
    
    const units = ["nH", "μH", "mH", "H"];
    const factors = [1e9, 1e6, 1e3, 1];
    
    let bestValue = value;
    let bestUnitIndex = 3; // 从最大单位开始 (H)
    
    // 找到最佳单位
    for (let i = units.length - 1; i >= 0; i--) {
      const converted = value * factors[i];
      if (converted >= 1 || i === 0) {
        bestValue = converted;
        bestUnitIndex = i;
        break;
      }
    }
    
    // 格式化数值
    let formattedValue: string;
    if (Math.abs(bestValue) < 0.001) {
      formattedValue = bestValue.toExponential(2);
    } else if (Math.abs(bestValue) < 1) {
      formattedValue = bestValue.toFixed(4).replace(/\.?0+$/, '');
    } else if (Math.abs(bestValue) < 1000) {
      formattedValue = bestValue.toFixed(3).replace(/\.?0+$/, '');
    } else {
      formattedValue = bestValue.toFixed(2).replace(/\.?0+$/, '');
    }
    
    // 添加相邻单位
    let result = `${formattedValue} ${units[bestUnitIndex]}`;
    
    // 添加上一单位
    if (bestUnitIndex > 0) {
      const prevValue = value * factors[bestUnitIndex - 1];
      result += ` / ${prevValue.toFixed(2)} ${units[bestUnitIndex - 1]}`;
    }
    
    return result;
  },
  
  // 格式化阻抗值
  formatImpedance(value: number): string {
    if (isNaN(value)) return "";
    
    const units = ["Ω", "kΩ", "MΩ"];
    const factors = [1, 1e-3, 1e-6];
    
    let bestValue = value;
    let bestUnitIndex = 0; // 从最小单位开始 (Ω)
    
    // 找到最佳单位
    for (let i = units.length - 1; i >= 0; i--) {
      const converted = value * factors[i];
      if (converted >= 1 || i === 0) {
        bestValue = converted;
        bestUnitIndex = i;
        break;
      }
    }
    
    // 格式化数值
    let formattedValue: string;
    if (Math.abs(bestValue) < 0.001) {
      formattedValue = bestValue.toExponential(2);
    } else if (Math.abs(bestValue) < 1) {
      formattedValue = bestValue.toFixed(4).replace(/\.?0+$/, '');
    } else if (Math.abs(bestValue) < 1000) {
      formattedValue = bestValue.toFixed(3).replace(/\.?0+$/, '');
    } else {
      formattedValue = bestValue.toFixed(2).replace(/\.?0+$/, '');
    }
    
    return `${formattedValue} ${units[bestUnitIndex]}`;
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
        title: '请输入谐振频率',
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
    let calculatedCapacitance = "";
    let calculatedInductance = "";
    let characteristicImpedance = "";
    
    // 计算缺失的参数
    if (!isNaN(c) && isNaN(l)) {
      // 计算电感 L = 1 / (4π²f²C)
      if (c <= 0) {
        wx.showToast({ title: '电容必须大于0', icon: 'none' });
        return;
      }
      const inductance = 1 / (4 * Math.PI*Math.PI * f * f * c);
      calculatedInductance = this.formatInductance(inductance);
    } 
    else if (isNaN(c) && !isNaN(l)) {
      // 计算电容 C = 1 / (4π²f²L)
      if (l <= 0) {
        wx.showToast({ title: '电感必须大于0', icon: 'none' });
        return;
      }
      const capacitance = 1 / (4 * Math.PI*Math.PI * f * f * l);
      calculatedCapacitance = this.formatCapacitance(capacitance);
    }
    else if (!isNaN(c) && !isNaN(l)) {
      // 验证谐振频率
      const fr = 1 / (2 * Math.PI * Math.sqrt(l * c));
      const error = Math.abs(f - fr) / f * 100;
      
      if (error < 0.1) {
        calculatedCapacitance = "输入值一致";
        calculatedInductance = "输入值一致";
      } else {
        calculatedCapacitance = `偏差 ${error.toFixed(2)}%`;
        calculatedInductance = `偏差 ${error.toFixed(2)}%`;
      }
    }
    
    // 计算特性阻抗 (如果两者都有)
    if (!isNaN(c) && !isNaN(l) && c > 0 && l > 0) {
      const z = Math.sqrt(l / c);
      characteristicImpedance = this.formatImpedance(z);
    }
    
    this.setData({
      calculatedCapacitance,
      calculatedInductance,
      characteristicImpedance,
      showResults: true
    });
  }
});