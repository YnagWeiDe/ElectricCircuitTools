// index.ts
Page({
    data: {
      // 输入值
      UI: '5',
      UO: '5',
      
      // 单位索引
      UIUnitIndex: 0,
      UOUnitIndex: 0,
      
      // 可用单位
      voltageUnits: ['V', 'mV', 'μV'],
      
      // 计算结果
      resistorPairs: [] as {R1: number, Rf: number, error: number}[],
      showNoResult: false,
      isCalculating: false,
      progress: 0,
      
      // E24标准电阻序列 (1%精度)
      e24Series: [
        1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
        3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
        10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30,
        33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91
      ],
      
      // 电阻数量级 (Ω)
      resistanceScales: [1, 10, 100, 1000, 10000, 100000]
    },
  
    onLoad() {
      // 页面加载时设置默认值
      this.setData({
        UI: '5',
        UO: '5'
      });
    },
  
    // 输入处理函数
    onUIInput(e: any) {
      this.setData({ UI: e.detail.value });
    },
    
    onUOInput(e: any) {
      this.setData({ UO: e.detail.value });
    },
    
    // 单位选择处理函数
    onUIUnitChange(e: any) {
      this.setData({ UIUnitIndex: e.detail.value });
    },
    
    onUOUnitChange(e: any) {
      this.setData({ UOUnitIndex: e.detail.value });
    },
    
    // 计算电阻组合
    calculateResistors() {
      // 显示加载状态
      this.setData({
        isCalculating: true,
        progress: 0,
        showNoResult: false,
        resistorPairs: []
      });
      
      // 获取输入值并转换为数字
      const UI = parseFloat(this.data.UI) || 0;
      const UO = parseFloat(this.data.UO) || 0;
      
      // 转换单位到标准单位（V）
      const UI_std = this.convertVoltageToV(UI, this.data.UIUnitIndex);
      const UO_std = this.convertVoltageToV(UO, this.data.UOUnitIndex);
      
      // 验证输入
      if (UI_std <= 0 || UO_std <= 0) {
        wx.showToast({
          title: '输入电压和输出电压必须大于0',
          icon: 'none'
        });
        this.setData({ isCalculating: false });
        return;
      }
      
      // 计算比例系数 k = |UO| / UI = Rf / R1
      const k = UO_std / UI_std;  // 因为UO是绝对值，所以直接除
      
      // 计算满足条件的电阻组合
      const pairs = [];
      const e24 = this.data.e24Series;
      const scales = this.data.resistanceScales;
      
      // 预先生成所有可能的电阻值
      const allResistors: number[] = [];
      for (let i = 0; i < scales.length; i++) {
        for (let j = 0; j < e24.length; j++) {
          const value = e24[j] * scales[i];
          if (value >= 1 && value <= 1000000) {
            allResistors.push(value);
          }
        }
      }
      
      // 计算总迭代次数
      const totalIterations = allResistors.length;
      let currentIteration = 0;
      
      // 使用 Set 跟踪已添加的电阻组合
      const seenPairs = new Set<string>();
      
      // 遍历所有可能的R1值
      for (const R1 of allResistors) {
        // 更新进度
        currentIteration++;
        this.setData({
          progress: Math.min(95, Math.floor((currentIteration / totalIterations) * 100))
        });
        
        // 计算所需的Rf理想值
        const Rf_ideal = k * R1;
        if (Rf_ideal > 1000000 || Rf_ideal < 1) continue;
        
        // 在所有电阻中找到最接近的Rf值
        let closestRf = 0;
        let minDiff = Infinity;
        
        for (const candidate of allResistors) {
          const diff = Math.abs(candidate - Rf_ideal);
          if (diff < minDiff) {
            minDiff = diff;
            closestRf = candidate;
          }
        }
        
        // 计算实际比例
        const actualK = closestRf / R1;
        
        // 计算误差百分比
        const error = Number((Math.abs(actualK - k) / k * 100).toFixed(2));
        
        // 只保留误差小于1%的组合
        if (error < 1) {
          // 创建唯一标识键（R1 和 Rf 的组合）
          const pairKey = `${R1},${closestRf}`;
          
          // 检查是否已添加过该组合
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey);
            pairs.push({
              R1: Number(R1.toFixed(2)),
              Rf: Number(closestRf.toFixed(2)),
              error: error
            });
          }
        }
      }
      
      // 按误差从小到大排序
      pairs.sort((a, b) => a.error - b.error);
      
      // 限制结果数量
      const maxResults = 100;
      const finalPairs = pairs.slice(0, maxResults);
      
      // 更新数据
      this.setData({
        resistorPairs: finalPairs,
        showNoResult: finalPairs.length === 0,
        isCalculating: false,
        progress: 100
      });
    },
    
    // 电压单位转换到V
    convertVoltageToV(value: number, unitIndex: number): number {
      const factors = [1, 0.001, 0.000001]; // V, mV, μV
      return value * factors[unitIndex];
    },
    
    // 格式化电阻值显示
    formatResistance(value: number): string {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'MΩ';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'kΩ';
      } else {
        return value.toFixed(0) + 'Ω';
      }
    }
  });