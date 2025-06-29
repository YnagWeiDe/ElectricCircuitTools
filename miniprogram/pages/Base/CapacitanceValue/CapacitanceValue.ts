Page({
    data: {
      code: "",
      toleranceIndex: 0,
      tolerances: [
        "- (未选择)",
        "J(±5%)", 
        "K(±10%)", 
        "M(±20%)", 
        "Z(+80%-20%)"
      ],
      mainResult: "",
      otherResults: [] as string[],
      showResults: false
    },
  
    onInput(e: WechatMiniprogram.Input) {
      this.setData({ code: e.detail.value });
    },
  
    onToleranceChange(e: WechatMiniprogram.PickerChange) {
      const index = Number(e.detail.value);
      this.setData({ toleranceIndex: index });
    },
  
    calculate() {
      const { code, tolerances, toleranceIndex } = this.data;
      
      // 输入验证
      if (!code.match(/^\d{3,4}$/)) {
        wx.showToast({ title: '请输入3-4位数字', icon: 'none' });
        this.setData({ showResults: false });
        return;
      }
  
      // 解析电容值
      const digits = code.slice(0, -1);
      const multiplier = parseInt(code.slice(-1));
      const baseValue = parseInt(digits);
      const pfValue = baseValue * Math.pow(10, multiplier);
  
      // 计算所有单位的值
      const ufValue = pfValue / 1000000;
      const nfValue = pfValue / 1000;
      
      // 自动选择主单位
      let mainValue, mainUnit;
      if (pfValue >= 1000000) {
        mainValue = ufValue;
        mainUnit = "μF";
      } else if (pfValue >= 1000) {
        mainValue = nfValue;
        mainUnit = "nF";
      } else {
        mainValue = pfValue;
        mainUnit = "pF";
      }
  
      // 格式化主结果
      let mainResult = this.formatValue(mainValue) + mainUnit;
      
      // 添加容差
      if (toleranceIndex > 0) {
        const tolerance = tolerances[toleranceIndex].split('(')[0];
        mainResult += ` ${tolerance}`;
      }
  
      // 计算其他单位结果
      const otherResults = [];
      
      // 如果主单位是μF，则显示nF和pF
      if (mainUnit === "μF") {
        otherResults.push(`${this.formatValue(nfValue)}nF`);
        otherResults.push(`${pfValue}pF`);
      } 
      // 如果主单位是nF，则显示μF和pF
      else if (mainUnit === "nF") {
        otherResults.push(`${this.formatValue(ufValue)}μF`);
        otherResults.push(`${pfValue}pF`);
      } 
      // 如果主单位是pF，则显示nF和μF
      else {
        otherResults.push(`${this.formatValue(nfValue)}nF`);
        otherResults.push(`${this.formatValue(ufValue)}μF`);
      }
  
      this.setData({
        mainResult,
        otherResults,
        showResults: true
      });
    },
    
    // 格式化数值：去除多余的零
    formatValue(value: number): string {
      // 处理小数
      if (value < 1) {
        const fixedValue = value.toFixed(4).replace(/\.?0+$/, '');
        return fixedValue === "0" ? "0" : fixedValue;
      }
      
      // 处理整数
      const intValue = Math.round(value);
      if (Math.abs(intValue - value) < 0.0001) {
        return intValue.toString();
      }
      
      // 处理小数部分
      return value.toFixed(2).replace(/\.?0+$/, '');
    }
  });