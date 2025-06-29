Page({
    data: {
      // 输入值
      U1: '5',
      U2: '0',
      Vef: '3.3',
      
      // 单位索引
      U1UnitIndex: 0,
      U2UnitIndex: 0,
      VefUnitIndex: 0,
      
      // 可用单位
      voltageUnits: ['V', 'mV', 'μV'],
      
      // 计算结果
      resistorPairs: [] as {R1: number, R2: number, error: number}[],
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
        U1: '5',
        U2: '0',
        Vef: '3.3'
      });
    },
  
    // 输入处理函数
    onU1Input(e: any) {
      this.setData({ U1: e.detail.value });
    },
    
    onU2Input(e: any) {
      this.setData({ U2: e.detail.value });
    },
    
    onVefInput(e: any) {
      this.setData({ Vef: e.detail.value });
    },
    
    // 单位选择处理函数
    onU1UnitChange(e: any) {
      this.setData({ U1UnitIndex: e.detail.value });
    },
    
    onU2UnitChange(e: any) {
      this.setData({ U2UnitIndex: e.detail.value });
    },
    
    onVefUnitChange(e: any) {
      this.setData({ VefUnitIndex: e.detail.value });
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
      const U1 = parseFloat(this.data.U1) || 0;
      const U2 = parseFloat(this.data.U2) || 0;
      const Vef = parseFloat(this.data.Vef) || 0;
      
      // 转换单位到标准单位（V）
      const U1_std = this.convertVoltageToV(U1, this.data.U1UnitIndex);
      const U2_std = this.convertVoltageToV(U2, this.data.U2UnitIndex);
      const Vef_std = this.convertVoltageToV(Vef, this.data.VefUnitIndex);
      
      // 验证输入
      if (U1_std <= U2_std) {
        wx.showToast({
          title: '高电位必须大于低电位',
          icon: 'none'
        });
        this.setData({ isCalculating: false });
        return;
      }
      
      if (Vef_std <= U2_std || Vef_std >= U1_std) {
        wx.showToast({
          title: '参考电位必须在高低电位之间',
          icon: 'none'
        });
        this.setData({ isCalculating: false });
        return;
      }
      
      // 计算电阻比例系数
      const k = (U1_std - Vef_std) / (Vef_std - U2_std);
      
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
      
      // 遍历所有可能的R2值
      for (const R2 of allResistors) {
        // 更新进度
        currentIteration++;
        this.setData({
          progress: Math.min(95, Math.floor((currentIteration / totalIterations) * 100))
        });
        
        // 计算所需的R1理想值
        const R1_ideal = k * R2;
        if (R1_ideal > 1000000 || R1_ideal < 1) continue;
        
        // 在所有电阻中找到最接近的R1值
        let closestR1 = 0;
        let minDiff = Infinity;
        
        for (const candidate of allResistors) {
          const diff = Math.abs(candidate - R1_ideal);
          if (diff < minDiff) {
            minDiff = diff;
            closestR1 = candidate;
          }
        }
        
        // 计算实际Vef值
        const Vef_actual = U2_std + (U1_std - U2_std) * R2 / (closestR1 + R2);
        
        // 计算误差百分比
        const error = Number((Math.abs(Vef_actual - Vef_std) / Vef_std * 100).toFixed(2));
        
        // 只保留误差小于1%的组合
        if (error < 1) {
          // 创建唯一标识键（R1 和 R2 的组合）
          const pairKey = `${closestR1},${R2}`;
          
          // 检查是否已添加过该组合
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey);
            pairs.push({
              R1: Number(closestR1.toFixed(2)),
              R2: Number(R2.toFixed(2)),
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