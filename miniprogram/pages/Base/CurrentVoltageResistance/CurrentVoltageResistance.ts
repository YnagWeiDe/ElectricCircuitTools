Page({
    data: {
      // 电压相关
      voltageValue: "",
      voltageUnits: ["V", "mV", "μV"],
      voltageUnitIndex: 0,
      
      // 电流相关
      currentValue: "",
      currentUnits: ["A", "mA", "μA"],
      currentUnitIndex: 0,
      
      // 电阻相关
      resistanceValue: "",
      resistanceUnits: ["Ω", "kΩ", "MΩ"],
      resistanceUnitIndex: 0,
      
      // 结果相关
      result: "",
      otherResults: [] as string[],
      showResults: false
    },
  
    // 电压输入处理
    onVoltageInput(e: WechatMiniprogram.Input) {
      this.setData({ voltageValue: e.detail.value });
    },
    
    // 电压单位选择
    onVoltageUnitChange(e: WechatMiniprogram.PickerChange) {
      this.setData({ voltageUnitIndex: Number(e.detail.value) });
    },
    
    // 电流输入处理
    onCurrentInput(e: WechatMiniprogram.Input) {
      this.setData({ currentValue: e.detail.value });
    },
    
    // 电流单位选择
    onCurrentUnitChange(e: WechatMiniprogram.PickerChange) {
      this.setData({ currentUnitIndex: Number(e.detail.value) });
    },
    
    // 电阻输入处理
    onResistanceInput(e: WechatMiniprogram.Input) {
      this.setData({ resistanceValue: e.detail.value });
    },
    
    // 电阻单位选择
    onResistanceUnitChange(e: WechatMiniprogram.PickerChange) {
      this.setData({ resistanceUnitIndex: Number(e.detail.value) });
    },
  
    // 单位转换辅助函数
    convertToBaseUnit(value: number, unitIndex: number, unitsType: string): number {
      if (isNaN(value)) return NaN;
      
      switch(unitsType) {
        case "voltage":
          // V, mV, μV
          return value * Math.pow(10, -3 * unitIndex);
          
        case "current":
          // A, mA, μA
          return value * Math.pow(10, -3 * unitIndex);
          
        case "resistance":
          // Ω, kΩ, MΩ
          return value * Math.pow(10, 3 * unitIndex);
          
        default:
          return value;
      }
    },
    
    // 格式化为最佳单位
    formatToBestUnit(value: number, units: string[], type: string): string {
      if (isNaN(value)) return "";
      
      let unitIndex = 0;
      let absValue = Math.abs(value);
      
      if (type === "voltage" || type === "current") {
        if (absValue < 0.001) {
          unitIndex = 2; // μV/μA
          value *= 1000000;
        } else if (absValue < 1) {
          unitIndex = 1; // mV/mA
          value *= 1000;
        }
      } else if (type === "resistance") {
        if (absValue >= 1000000) {
          unitIndex = 2; // MΩ
          value /= 1000000;
        } else if (absValue >= 1000) {
          unitIndex = 1; // kΩ
          value /= 1000;
        }
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
    
    // 计算函数
    calculate() {
      const { 
        voltageValue, voltageUnitIndex, voltageUnits,
        currentValue, currentUnitIndex, currentUnits,
        resistanceValue, resistanceUnitIndex, resistanceUnits
      } = this.data;
      
      // 转换为基本单位 (V, A, Ω)
      const v = this.convertToBaseUnit(parseFloat(voltageValue), voltageUnitIndex, "voltage");
      const i = this.convertToBaseUnit(parseFloat(currentValue), currentUnitIndex, "current");
      const r = this.convertToBaseUnit(parseFloat(resistanceValue), resistanceUnitIndex, "resistance");
      
      // 验证输入
      const inputs = [v, i, r];
      const filledCount = inputs.filter(val => !isNaN(val)).length;
      
      if (filledCount < 2) {
        wx.showToast({
          title: '请至少输入两个值',
          icon: 'none'
        });
        this.setData({ 
          showResults: false,
          otherResults: []
        });
        return;
      }
      
      let result = "";
      let calculatedValue = 0;
      let resultType = "";
      const otherResults = [];
      
      // 计算缺失的值
      if (isNaN(v)) {
        // 计算电压: V = I * R
        if (isNaN(i) || isNaN(r)) {
          wx.showToast({ title: '需要电流和电阻值', icon: 'none' });
          return;
        }
        
        if (r === 0) {
          wx.showToast({ title: '电阻不能为0', icon: 'none' });
          return;
        }
        
        calculatedValue = i * r;
        resultType = "voltage";
        result = `电压: ${this.formatToBestUnit(calculatedValue, voltageUnits, "voltage")}`;
        
        // 添加其他单位结果
        otherResults.push(this.formatToBestUnit(calculatedValue * 1000, ["mV"], "voltage"));
        otherResults.push(this.formatToBestUnit(calculatedValue * 1000000, ["μV"], "voltage"));
        
      } else if (isNaN(i)) {
        // 计算电流: I = V / R
        if (isNaN(v) || isNaN(r)) {
          wx.showToast({ title: '需要电压和电阻值', icon: 'none' });
          return;
        }
        
        if (r === 0) {
          wx.showToast({ title: '电阻不能为0', icon: 'none' });
          return;
        }
        
        calculatedValue = v / r;
        resultType = "current";
        result = `电流: ${this.formatToBestUnit(calculatedValue, currentUnits, "current")}`;
        
        // 添加其他单位结果
        otherResults.push(this.formatToBestUnit(calculatedValue * 1000, ["mA"], "current"));
        otherResults.push(this.formatToBestUnit(calculatedValue * 1000000, ["μA"], "current"));
        
      } else if (isNaN(r)) {
        // 计算电阻: R = V / I
        if (isNaN(v) || isNaN(i)) {
          wx.showToast({ title: '需要电压和电流值', icon: 'none' });
          return;
        }
        
        if (i === 0) {
          wx.showToast({ title: '电流不能为0', icon: 'none' });
          return;
        }
        
        calculatedValue = v / i;
        resultType = "resistance";
        result = `电阻: ${this.formatToBestUnit(calculatedValue, resistanceUnits, "resistance")}`;
        
        // 添加其他单位结果
        otherResults.push(this.formatToBestUnit(calculatedValue / 1000, ["kΩ"], "resistance"));
        otherResults.push(this.formatToBestUnit(calculatedValue / 1000000, ["MΩ"], "resistance"));
        
      } else {
        // 验证所有值是否一致
        const tolerance = 0.0001;
        if (Math.abs(v - i * r) < tolerance) {
          result = "输入值一致";
        } else {
          result = `输入值不一致 (${(v - i * r).toExponential(2)}V 偏差)`;
        }
      }
      
      this.setData({
        result,
        otherResults,
        showResults: true
      });
    }
  });