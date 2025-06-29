// ts
Page({
  data: {
    inputValue: '',
    baseIndex: 2, // 默认选择十进制
    baseOptions: ['2进制', '8进制', '10进制', '16进制', '8421BCD码'],
    binaryOriginal: '',
    binaryInverse: '',
    binaryComplement: '',
    octal: '',
    hex: '',
    bcd: '',
    processText: '',
    error: ''
  },

  onInput(e: WechatMiniprogram.Input) {
    const input = e.detail.value;
    this.setData({ inputValue: input, error: '' });
    
    if (input) {
      this.calculate();
    } else {
      this.setData({
        binaryOriginal: '',
        binaryInverse: '',
        binaryComplement: '',
        octal: '',
        hex: '',
        bcd: '',
        processText: '等待输入...'
      });
    }
  },

  onBaseChange(e: WechatMiniprogram.PickerChange) {
    // 修复类型错误：确保获取的是数字类型的索引
    const value = e.detail.value;
    const index = Array.isArray(value) ? value[0] : Number(value);
    
    this.setData({ 
      baseIndex: Number(index),
      inputValue: '',
      error: '',
      binaryOriginal: '',
    binaryInverse: '',
    binaryComplement: '',
    octal: '',
    hex: '',
    bcd: '',
    processText: ''
    });
    
    if (this.data.inputValue) {
      this.calculate();
    }
  },

  calculate() {
    const input = this.data.inputValue.trim();
    const baseType = this.data.baseIndex;
    
    // 重置结果
    this.setData({
      binaryOriginal: '',
      binaryInverse: '',
      binaryComplement: '',
      octal: '',
      hex: '',
      bcd: '',
      processText: '',
      error: '',
    });
    
    // 处理输入为空的情况
    if (!input) {
      this.setData({ processText: '等待输入...' });
      return;
    }
    
    // 处理不同进制的输入
    try {
      let decimalValue = 0;
      const processSteps: string[] = [];
      
      // 根据选择的进制类型解析输入
      switch (baseType) {
        case 0: // 2进制
          if (!/^[-01]+$/.test(input)) {
            throw new Error('二进制输入只能包含0、1和可选的负号');
          }
          decimalValue = this.parseBinary(input);
          processSteps.push(`输入值: ${input} (二进制)`);
          processSteps.push(`解析: ${input} → 十进制: ${decimalValue}`);
          break;
          
        case 1: // 8进制
          if (!/^[-0-7]+$/.test(input)) {
            throw new Error('八进制输入只能包含0-7和可选的负号');
          }
          decimalValue = parseInt(input, 8);
          if (isNaN(decimalValue)) {
            throw new Error('无效的八进制数值');
          }
          processSteps.push(`输入值: ${input} (八进制)`);
          processSteps.push(`解析: ${input} → 十进制: ${decimalValue}`);
          break;
          
        case 2: // 10进制
          if (!/^[-0-9]+$/.test(input)) {
            throw new Error('十进制输入只能包含0-9和可选的负号');
          }
          decimalValue = parseInt(input, 10);
          if (isNaN(decimalValue)) {
            throw new Error('无效的十进制数值');
          }
          processSteps.push(`输入值: ${input} (十进制)`);
          processSteps.push(`直接使用十进制值: ${decimalValue}`);
          break;
          
        case 3: // 16进制
          if (!/^[-0-9A-Fa-f]+$/.test(input)) {
            throw new Error('十六进制输入只能包含0-9,A-F和可选的负号');
          }
          decimalValue = parseInt(input, 16);
          if (isNaN(decimalValue)) {
            throw new Error('无效的十六进制数值');
          }
          processSteps.push(`输入值: ${input} (十六进制)`);
          processSteps.push(`解析: ${input} → 十进制: ${decimalValue}`);
          break;
          
        case 4: // 8421BCD码
          if (!/^[01]+$/.test(input)) {
            throw new Error('BCD码输入只能包含0和1');
          }
          if (input.length % 4 !== 0) {
            throw new Error('BCD码长度必须是4的倍数');
          }
          decimalValue = this.parseBCD(input);
          processSteps.push(`输入值: ${input} (BCD码)`);
          processSteps.push(`解析: 每4位一组 → ${this.formatBCD(input)}`);
          processSteps.push(`转换为十进制: ${decimalValue}`);
          break;
      }
      
      // 检查数值范围（8位有符号整数）
      if (decimalValue < -128 || decimalValue > 127) {
        throw new Error('数值超出范围（-128~127）');
      }
      
      // 计算各种表示形式
      this.calculateRepresentations(decimalValue, processSteps);
      
      // 更新过程文本
      this.setData({ processText: processSteps.join('\n') });
      
    } catch (error) {
      this.setData({ 
        error: error.message,
        processText: '计算过程中发生错误'
      });
    }
  },
  
  parseBinary(binaryStr: string): number {
    let isNegative = false;
    let cleanStr = binaryStr;
    
    // 处理负数
    if (binaryStr.startsWith('-')) {
      isNegative = true;
      cleanStr = binaryStr.substring(1);
    }
    
    // 转换为十进制
    let decimal = parseInt(cleanStr, 2);
    if (isNaN(decimal)) {
      throw new Error('无效的二进制数值');
    }
    
    return isNegative ? -decimal : decimal;
  },
  
  parseBCD(bcdStr: string): number {
    let result = 0;
    const groups = [];
    
    // 每4位一组处理
    for (let i = 0; i < bcdStr.length; i += 4) {
      const group = bcdStr.substring(i, i + 4);
      const decimal = parseInt(group, 2);
      
      // 检查是否有效的BCD码
      if (decimal > 9) {
        throw new Error(`无效BCD码组: ${group} (不能大于9)`);
      }
      
      groups.push(`${group} → ${decimal}`);
      result = result * 10 + decimal;
    }
    
    return result;
  },
  
  formatBCD(bcdStr: string): string {
    const groups = [];
    for (let i = 0; i < bcdStr.length; i += 4) {
      groups.push(bcdStr.substring(i, i + 4));
    }
    return groups.join(' ');
  },
  
  calculateRepresentations(decimalValue: number, processSteps: string[]) {
    // 计算二进制原码
    const original = this.calculateBinaryOriginal(decimalValue);
    this.setData({ binaryOriginal: original });
    processSteps.push(`二进制原码: ${original}`);
    
    // 计算二进制反码
    const inverse = this.calculateBinaryInverse(decimalValue);
    this.setData({ binaryInverse: inverse });
    processSteps.push(`二进制反码: ${inverse}`);
    
    // 计算二进制补码
    const complement = this.calculateBinaryComplement(decimalValue);
    this.setData({ binaryComplement: complement });
    processSteps.push(`二进制补码: ${complement}`);
    
    // 计算八进制
    const octal = this.calculateOctal(decimalValue);
    this.setData({ octal: octal });
    processSteps.push(`八进制: ${octal}`);
    
    // 计算十六进制
    const hex = this.calculateHex(decimalValue);
    this.setData({ hex: hex });
    processSteps.push(`十六进制: ${hex}`);
    
    // 计算BCD码
    const bcd = this.calculateBCD(decimalValue);
    this.setData({ bcd: bcd });
    processSteps.push(`8421BCD码: ${bcd}`);
  },
  
  calculateBinaryOriginal(value: number): string {
    if (value >= 0) {
      return value.toString(2).padStart(8, '0');
    } else {
      // 负数原码：符号位为1，其余为绝对值的二进制
      const absBinary = Math.abs(value).toString(2).padStart(7, '0');
      return '1' + absBinary;
    }
  },
  
  calculateBinaryInverse(value: number): string {
    if (value >= 0) {
      return value.toString(2).padStart(8, '0');
    } else {
      // 负数反码：符号位不变，其余位取反
      const original = this.calculateBinaryOriginal(value);
      let inverse = '1';
      for (let i = 1; i < 8; i++) {
        inverse += original[i] === '0' ? '1' : '0';
      }
      return inverse;
    }
  },
  
  calculateBinaryComplement(value: number): string {
    if (value >= 0) {
      return value.toString(2).padStart(8, '0');
    } else {
      // 负数补码：反码+1
      const inverse = this.calculateBinaryInverse(value);
      let carry = 1;
      let complement = '';
      
      for (let i = 7; i >= 0; i--) {
        const bit = inverse[i];
        if (bit === '0') {
          complement = (carry ? '1' : '0') + complement;
          carry = 0;
        } else {
          complement = (carry ? '0' : '1') + complement;
        }
      }
      
      return complement;
    }
  },
  
  calculateOctal(value: number): string {
    const absValue = Math.abs(value);
    const octal = absValue.toString(8);
    return value >= 0 ? octal : `-${octal}`;
  },
  
  calculateHex(value: number): string {
    const absValue = Math.abs(value);
    const hex = absValue.toString(16).toUpperCase();
    return value >= 0 ? hex : `-${hex}`;
  },
  
  calculateBCD(value: number): string {
    if (value < 0) {
      return '负数没有BCD表示';
    }
    
    const digits = value.toString().split('');
    return digits.map(d => {
      return parseInt(d).toString(2).padStart(4, '0');
    }).join('');
  }
});