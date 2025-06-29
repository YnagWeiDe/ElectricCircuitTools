// index.ts
Page({
    data: {
      // 输入值
      U1: '12',
      U2: '0',
      R1: '1000',
      R2: '2000',
      
      // 单位索引
      U1UnitIndex: 0,
      U2UnitIndex: 0,
      R1UnitIndex: 0,
      R2UnitIndex: 0,
      
      // 可用单位
      voltageUnits: ['V', 'mV', 'μV'],
      resistanceUnits: ['Ω', 'kΩ', 'MΩ'],
      
      // 计算结果
      Vef: 0 as number | string,
      VefUnit: 'V',
      breakdownText: '等待计算...',
      errorMessage: '' // 新增错误信息字段
    },
  
    onLoad() {
      // 页面加载时计算初始值
      this.calculateVef();
    },
  
    // 输入处理函数
    onU1Input(e: any) {
      this.setData({ U1: e.detail.value });
      this.calculateVef();
    },
    
    onU2Input(e: any) {
      this.setData({ U2: e.detail.value });
      this.calculateVef();
    },
    
    onR1Input(e: any) {
      this.setData({ R1: e.detail.value });
      this.calculateVef();
    },
    
    onR2Input(e: any) {
      this.setData({ R2: e.detail.value });
      this.calculateVef();
    },
    
    // 单位选择处理函数
    onU1UnitChange(e: any) {
      this.setData({ U1UnitIndex: e.detail.value }, () => {
        this.calculateVef();
      });
    },
    
    onU2UnitChange(e: any) {
      this.setData({ U2UnitIndex: e.detail.value }, () => {
        this.calculateVef();
      });
    },
    
    onR1UnitChange(e: any) {
      this.setData({ R1UnitIndex: e.detail.value }, () => {
        this.calculateVef();
      });
    },
    
    onR2UnitChange(e: any) {
      this.setData({ R2UnitIndex: e.detail.value }, () => {
        this.calculateVef();
      });
    },
    
    // 计算函数
    calculateVef() {
      // 重置错误信息
      this.setData({ errorMessage: '' });
      
      // 获取输入值并转换为数字
      const U1 = parseFloat(this.data.U1) || 0;
      const U2 = parseFloat(this.data.U2) || 0;
      const R1 = parseFloat(this.data.R1) || 0;
      const R2 = parseFloat(this.data.R2) || 0;
      
      // 转换单位到标准单位（V和Ω）
      const U1_std = this.convertVoltageToV(U1, this.data.U1UnitIndex);
      const U2_std = this.convertVoltageToV(U2, this.data.U2UnitIndex);
      const R1_std = this.convertResistanceToOhm(R1, this.data.R1UnitIndex);
      const R2_std = this.convertResistanceToOhm(R2, this.data.R2UnitIndex);
      
      // 检查高电位是否小于低电位
      if (U1_std < U2_std) {
        this.setData({
          Vef: '无效输入',
          VefUnit: '',
          breakdownText: '错误：高电位不能小于低电位',
          errorMessage: '错误：高电位不能小于低电位'
        });
        return;
      }
      
      // 防止除以0
      if (R1_std + R2_std === 0) {
        this.setData({
          Vef: '无效输入',
          VefUnit: '',
          breakdownText: '错误：电阻总和不能为0',
          errorMessage: '错误：电阻总和不能为0'
        });
        return;
      }
      
      // 计算公式: Vef = U2 + (U1 - U2) * R2 / (R1 + R2)
      const Vef_std = U2_std + (U1_std - U2_std) * R2_std / (R1_std + R2_std);
      
      // 自动选择合适的单位显示
      const { value: Vef, unit: VefUnit } = this.autoScaleVoltage(Vef_std);
      
      // 生成计算过程文本
      const breakdownText = 
        `U1 = ${this.formatWithUnit(U1, this.data.voltageUnits[this.data.U1UnitIndex])} = ${U1_std.toFixed(6)}V\n` +
        `U2 = ${this.formatWithUnit(U2, this.data.voltageUnits[this.data.U2UnitIndex])} = ${U2_std.toFixed(6)}V\n` +
        `R1 = ${this.formatWithUnit(R1, this.data.resistanceUnits[this.data.R1UnitIndex])} = ${R1_std.toFixed(2)}Ω\n` +
        `R2 = ${this.formatWithUnit(R2, this.data.resistanceUnits[this.data.R2UnitIndex])} = ${R2_std.toFixed(2)}Ω\n\n` +
        `Vef = ${U2_std.toFixed(6)} + (${U1_std.toFixed(6)} - ${U2_std.toFixed(6)}) × ${R2_std.toFixed(2)} / (${R1_std.toFixed(2)} + ${R2_std.toFixed(2)})\n` +
        `    = ${U2_std.toFixed(6)} + ${(U1_std - U2_std).toFixed(6)} × ${R2_std.toFixed(2)} / ${(R1_std + R2_std).toFixed(2)}\n` +
        `    = ${U2_std.toFixed(6)} + ${((U1_std - U2_std) * R2_std).toFixed(6)} / ${(R1_std + R2_std).toFixed(2)}\n` +
        `    = ${U2_std.toFixed(6)} + ${((U1_std - U2_std) * R2_std / (R1_std + R2_std)).toFixed(6)}\n` +
        `    = ${Vef_std.toFixed(6)}V ≈ ${Vef_std.toFixed(3)}V`;
      
      this.setData({
        Vef: Vef,
        VefUnit: VefUnit,
        breakdownText: breakdownText
      });
    },
    
    // 电压单位转换到V
    convertVoltageToV(value: number, unitIndex: number): number {
      const factors = [1, 0.001, 0.000001]; // V, mV, μV
      return value * factors[unitIndex];
    },
    
    // 电阻单位转换到Ω
    convertResistanceToOhm(value: number, unitIndex: number): number {
      const factors = [1, 1000, 1000000]; // Ω, kΩ, MΩ
      return value * factors[unitIndex];
    },
    
    // 自动缩放电压值并选择合适的单位
    autoScaleVoltage(value: number): { value: string, unit: string } {
      if (value === 0) return { value: '0', unit: 'V' };
      
      const absValue = Math.abs(value);
      
      if (absValue >= 1) {
        return { value: value.toFixed(4), unit: 'V' };
      } else if (absValue >= 0.001) {
        return { value: (value * 1000).toFixed(4), unit: 'mV' };
      } else {
        return { value: (value * 1000000).toFixed(4), unit: 'μV' };
      }
    },
    
    // 格式化带单位的显示
    formatWithUnit(value: number, unit: string): string {
      return `${value} ${unit}`;
    }
  });