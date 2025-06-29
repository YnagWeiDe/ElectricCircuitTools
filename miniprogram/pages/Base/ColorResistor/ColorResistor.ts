// 定义颜色键的类型
type ColorKey = 'black' | 'brown' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'violet' | 'gray' | 'white' | 'gold' | 'silver';

Page({
  data: {
    // 色环类型（4、5、6）
    bandType: 4,
    
    // 色环标签
    bandLabels: ["第一位", "第二位", "乘数", "误差"] as string[],
    
    // 所有可用颜色
    colors: {
      black: { name: "黑色", value: "#000000", digit: 0, multiplier: 1, tolerance: null, tempCoeff: 250 },
      brown: { name: "棕色", value: "#795548", digit: 1, multiplier: 10, tolerance: "±1%", tempCoeff: 100 },
      red: { name: "红色", value: "#f44336", digit: 2, multiplier: 100, tolerance: "±2%", tempCoeff: 50 },
      orange: { name: "橙色", value: "#ff9800", digit: 3, multiplier: 1000, tolerance: null, tempCoeff: 15 },
      yellow: { name: "黄色", value: "#ffeb3b", digit: 4, multiplier: 10000, tolerance: null, tempCoeff: 25 },
      green: { name: "绿色", value: "#4caf50", digit: 5, multiplier: 100000, tolerance: "±0.5%", tempCoeff: 20 },
      blue: { name: "蓝色", value: "#2196f3", digit: 6, multiplier: 1000000, tolerance: "±0.25%", tempCoeff: 10 },
      violet: { name: "紫色", value: "#9c27b0", digit: 7, multiplier: 10000000, tolerance: "±0.1%", tempCoeff: 5 },
      gray: { name: "灰色", value: "#9e9e9e", digit: 8, multiplier: null, tolerance: "±0.05%", tempCoeff: 1 },
      white: { name: "白色", value: "#ffffff", digit: 9, multiplier: null, tolerance: null, tempCoeff: null },
      gold: { name: "金色", value: "#ffd700", digit: null, multiplier: 0.1, tolerance: "±5%", tempCoeff: null },
      silver: { name: "银色", value: "#c0c0c0", digit: null, multiplier: 0.01, tolerance: "±10%", tempCoeff: null }
    } as Record<ColorKey, {
      name: string;
      value: string;
      digit: number | null;
      multiplier: number | null;
      tolerance: string | null;
      tempCoeff: number | null;
    }>,
    
    // 当前选择的颜色（按色环位置）
    selectedColors: ["brown", "black", "red", "gold"] as ColorKey[],
    
    // 计算结果
    resistanceValue: "0 Ω",
    toleranceValue: "±20%",
    tempCoeffValue: "-",
    
    // 颜色选择器状态
    showColorPicker: false,
    currentBandIndex: 0,
    availableColors: [] as Array<{key: ColorKey; value: string; name: string}>
  },

  onLoad() {
    this.calculateResistance();
  },

  // 色环类型变化
  onBandTypeChange(e: any) {
    const bandType = parseInt(e.detail.value);
    
    // 根据色环类型更新标签和默认颜色
    let bandLabels: string[];
    let defaultColors: ColorKey[];
    
    if (bandType === 4) {
      bandLabels = ["第一位", "第二位", "乘数", "误差"];
      defaultColors = ["brown", "black", "red", "gold"];
    } else if (bandType === 5) {
      bandLabels = ["第一位", "第二位", "第三位", "乘数", "误差"];
      defaultColors = ["brown", "black", "black", "red", "gold"];
    } else {
      bandLabels = ["第一位", "第二位", "第三位", "乘数", "误差", "温度系数"];
      defaultColors = ["brown", "black", "black", "red", "gold", "brown"];
    }
    
    this.setData({
      bandType,
      bandLabels,
      selectedColors: defaultColors
    }, () => {
      this.calculateResistance();
    });
  },

  // 打开颜色选择器
  openColorPicker(e: any) {
    const index = e.currentTarget.dataset.index;
    const bandType = this.data.bandType;
    
    // 根据位置确定可用的颜色
    let availableColors: ColorKey[] = [];
    
    if (bandType === 4) {
      if (index < 2) {
        // 前两位数字
        availableColors = ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "gray", "white"];
      } else if (index === 2) {
        // 乘数
        availableColors = ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "gray", "white", "gold", "silver"];
      } else {
        // 误差
        availableColors = ["brown", "red", "green", "blue", "violet", "gray", "gold", "silver"];
      }
    } else if (bandType === 5) {
      if (index < 3) {
        // 前三位数字
        availableColors = ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "gray", "white"];
      } else if (index === 3) {
        // 乘数
        availableColors = ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "gray", "white", "gold", "silver"];
      } else {
        // 误差
        availableColors = ["brown", "red", "green", "blue", "violet", "gray", "gold", "silver"];
      }
    } else {
      if (index < 3) {
        // 前三位数字
        availableColors = ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "gray", "white"];
      } else if (index === 3) {
        // 乘数
        availableColors = ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "gray", "white", "gold", "silver"];
      } else if (index === 4) {
        // 误差
        availableColors = ["brown", "red", "green", "blue", "violet", "gray", "gold", "silver"];
      } else {
        // 温度系数
        availableColors = ["brown", "red", "orange", "yellow", "blue", "violet"];
      }
    }
    
    // 格式化为 {key, value, name} 数组
    const formattedColors = availableColors.map(key => ({
      key,
      value: this.data.colors[key].value,
      name: this.data.colors[key].name
    }));
    
    this.setData({
      showColorPicker: true,
      currentBandIndex: index,
      availableColors: formattedColors
    });
  },

  // 选择颜色
  selectColor(e: any) {
    const colorKey = e.currentTarget.dataset.color as ColorKey;
    const index = this.data.currentBandIndex;
    
    const newColors = [...this.data.selectedColors] as ColorKey[];
    newColors[index] = colorKey;
    
    this.setData({
      selectedColors: newColors,
      showColorPicker: false
    }, () => {
      this.calculateResistance();
    });
  },

  // 关闭颜色选择器
  closeColorPicker() {
    this.setData({
      showColorPicker: false
    });
  },

  // 计算电阻值
  calculateResistance() {
    const { bandType, selectedColors, colors } = this.data;
    let resistance = 0;
    let tolerance = "±20%";
    let tempCoeff = "-";
    
    try {
      if (bandType === 4) {
        // 4色环：前两位数字，第三位乘数，第四位误差
        const digit1 = colors[selectedColors[0]].digit || 0;
        const digit2 = colors[selectedColors[1]].digit || 0;
        const multiplier = colors[selectedColors[2]].multiplier || 1;
        
        resistance = (digit1 * 10 + digit2) * multiplier;
        tolerance = colors[selectedColors[3]].tolerance || "±20%";
      } else if (bandType === 5) {
        // 5色环：前三位数字，第四位乘数，第五位误差
        const digit1 = colors[selectedColors[0]].digit || 0;
        const digit2 = colors[selectedColors[1]].digit || 0;
        const digit3 = colors[selectedColors[2]].digit || 0;
        const multiplier = colors[selectedColors[3]].multiplier || 1;
        
        resistance = (digit1 * 100 + digit2 * 10 + digit3) * multiplier;
        tolerance = colors[selectedColors[4]].tolerance || "±20%";
      } else {
        // 6色环：前三位数字，第四位乘数，第五位误差，第六位温度系数
        const digit1 = colors[selectedColors[0]].digit || 0;
        const digit2 = colors[selectedColors[1]].digit || 0;
        const digit3 = colors[selectedColors[2]].digit || 0;
        const multiplier = colors[selectedColors[3]].multiplier || 1;
        
        resistance = (digit1 * 100 + digit2 * 10 + digit3) * multiplier;
        tolerance = colors[selectedColors[4]].tolerance || "±20%";
        
        const tempCoeffValue = colors[selectedColors[5]].tempCoeff;
        tempCoeff = tempCoeffValue ? `${tempCoeffValue} ppm/°C` : "-";
      }
      
      // 格式化电阻值
      let formattedResistance = "";
      if (resistance >= 1000000) {
        formattedResistance = (resistance / 1000000).toFixed(3) + " MΩ";
      } else if (resistance >= 1000) {
        formattedResistance = (resistance / 1000).toFixed(3) + " kΩ";
      } else if (resistance < 1) {
        formattedResistance = resistance.toFixed(4) + " Ω";
      } else {
        formattedResistance = resistance.toFixed(2) + " Ω";
      }
      
      this.setData({
        resistanceValue: formattedResistance,
        toleranceValue: tolerance,
        tempCoeffValue: tempCoeff
      });
      
    } catch (error) {
      console.error("计算电阻值时出错:", error);
      this.setData({
        resistanceValue: "计算错误",
        toleranceValue: "-",
        tempCoeffValue: "-"
      });
    }
  }
});