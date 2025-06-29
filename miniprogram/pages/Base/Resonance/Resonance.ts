// 定义数学常数

Page({
  data: {
    // 电源内阻相关
    resistanceValue: "",
    resistanceUnits: ["Ω", "kΩ", "MΩ"],
    resistanceUnitIndex: 0, // 默认Ω
    
    // 电容相关
    capacitanceValue: "",
    capacitanceUnits: ["pF", "nF", "μF", "mF"],
    capacitanceUnitIndex: 2, // 默认μF
    
    // 电感相关
    inductanceValue: "",
    inductanceUnits: ["nH", "μH", "mH", "H"],
    inductanceUnitIndex: 1, // 默认μH
    
    // 结果相关
    resonantFrequency: "",
    seriesImpedance: "",
    parallelImpedance: "",
    qValue: "",
    showResults: false
  },

  // 电源内阻输入处理
  onResistanceInput(e: WechatMiniprogram.Input) {
    this.setData({ resistanceValue: e.detail.value });
  },
  
  // 电源内阻单位选择
  onResistanceUnitChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ resistanceUnitIndex: Number(e.detail.value) });
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
      case "resistance":
        // Ω, kΩ, MΩ
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
  
  // 格式化频率值
  formatFrequency(value: number): string {
    if (isNaN(value)) return "";
    
    let absValue = Math.abs(value);
    let unit = "Hz";
    let units = ["Hz", "kHz", "MHz", "GHz"];
    let unitIndex = 0;
    
    while (absValue >= 1000 && unitIndex < units.length - 1) {
      value /= 1000;
      absValue = Math.abs(value);
      unitIndex++;
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
    
    return `${formattedValue} ${units[unitIndex]}`;
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
    } else if (absValue < 0.001) {
      // 极小值使用科学计数法
      return value.toExponential(2) + " Ω";
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
      resistanceValue, resistanceUnitIndex,
      capacitanceValue, capacitanceUnitIndex,
      inductanceValue, inductanceUnitIndex
    } = this.data;
    
    // 转换为基本单位 (Ω, F, H)
    const r = this.convertToBaseUnit(parseFloat(resistanceValue), resistanceUnitIndex, "resistance");
    const c = this.convertToBaseUnit(parseFloat(capacitanceValue), capacitanceUnitIndex, "capacitance");
    const l = this.convertToBaseUnit(parseFloat(inductanceValue), inductanceUnitIndex, "inductance");
    
    // 验证输入
    if (isNaN(c) || isNaN(l)) {
      wx.showToast({
        title: '请输电容和电感值',
        icon: 'none'
      });
      this.setData({ showResults: false });
      return;
    }
    
    if (c <= 0 || l <= 0) {
      wx.showToast({
        title: '电容和电感必须大于0',
        icon: 'none'
      });
      this.setData({ showResults: false });
      return;
    }
    
    // 计算谐振频率 fr = 1 / (2π√(LC))
    const fr = 1 / (2*Math.PI * Math.sqrt(l * c));
    
    // 计算串联谐振阻抗（理想情况下为0，但实际为电源内阻）
    let seriesZ = 0;
    if (!isNaN(r) && r > 0) {
      seriesZ = r;
    } else {
      seriesZ = 0; // 理想情况
    }
    
    // 计算并联谐振阻抗 Z_parallel = L/(C×R)
    let parallelZ = Infinity;
    if (!isNaN(r) && r > 0) {
      parallelZ = l / (c * r);
    } else {
      // 如果没有电源内阻，无法计算实际并联阻抗
      parallelZ = Infinity;
    }
    
    // 计算Q值 (如果有电源内阻)
    let q = "";
    if (!isNaN(r) && r > 0) {
      // Q = (1/R) × √(L/C)
      const z = Math.sqrt(l / c); // 特性阻抗
      q = (z / r).toFixed(2);
    }
    
    // 格式化结果
    let seriesZText = "0 Ω";
    if (seriesZ > 0) {
      seriesZText = this.formatImpedance(seriesZ);
    }
    
    let parallelZText = "∞ (无穷大)";
    if (isFinite(parallelZ)) {
      parallelZText = this.formatImpedance(parallelZ);
    }
    
    this.setData({
      resonantFrequency: this.formatFrequency(fr),
      seriesImpedance: seriesZText,
      parallelImpedance: parallelZText,
      qValue: q,
      showResults: true
    });
  }
});