// index.ts
interface MultiplierMap {
    [key: string]: number;
  }
  
  const multiplierMapData: MultiplierMap = {
    X: -1,  // 10^-1 (例如: 01X = 10Ω)
    A: 0,   // 10^0  (例如: 01A = 100Ω)
    B: 2,   // 10^2  (例如: 02B = 10.2kΩ)
    C: 3,   // 10^3
    D: 4,   // 10^4
    E: 5,   // 10^5
    F: 6,   // 10^6
    R: -2   // 10^-2
  };
  
  Page({
    data: {
      code: '',
      resistanceValue: '0Ω',
      breakdownText: '等待输入...',
      e96Values: [
        100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130, 133, 137, 140, 143, 147, 150, 154, 158,
        162, 165, 169, 174, 178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232, 237, 243, 249, 255,
        261, 267, 274, 280, 287, 294, 301, 309, 316, 324, 332, 340, 348, 357, 365, 374, 383, 392, 402, 412,
        422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549, 562, 576, 590, 604, 619, 634, 649, 665,
        681, 698, 715, 732, 750, 768, 787, 806, 825, 845, 866, 887, 909, 931, 953, 976
      ],
      multiplierMap: multiplierMapData
    },
  
    onCodeInput(e: WechatMiniprogram.Input) {
      const input = e.detail.value.toUpperCase();
      this.setData({ code: input });
      
      if (input.length === 3) {
        this.calculateResistance(input);
      } else {
        this.setData({
          resistanceValue: '0Ω',
          breakdownText: '输入3位代码（如01A）'
        });
      }
    },
  
    calculateResistance(code: string) {
      const digits = code.substring(0, 2);
      const letter = code[2];
      
      // 验证输入
      if (isNaN(Number(digits))) {
        this.setData({
          resistanceValue: '输入无效',
          breakdownText: '前两位必须是数字（01-96）'
        });
        return;
      }
      
      const index = parseInt(digits, 10);
      if (index < 1 || index > 96) {
        this.setData({
          resistanceValue: '输入无效',
          breakdownText: '序号必须在01-96之间'
        });
        return;
      }
      
      const validLetter = letter as keyof typeof multiplierMapData;
      
      if (!(validLetter in this.data.multiplierMap)) {
        this.setData({
          resistanceValue: '输入无效',
          breakdownText: `无效的乘数字母: ${letter}`
        });
        return;
      }
      
      // 计算电阻值
      const baseValue = this.data.e96Values[index - 1];
      const multiplier = this.data.multiplierMap[validLetter];
      const resistance = baseValue * Math.pow(10, multiplier);
      
      // 生成解析文本
      let breakdown = `${digits} → E96值: ${baseValue}Ω`;
      breakdown += `\n${letter} → 乘数: 10^${multiplier}`;
      breakdown += `\n结果: ${baseValue} × 10^${multiplier} = `;
      
      // 格式化电阻值
      let formattedValue = '';
      if (resistance >= 1000000) {
        const valueInM = (resistance / 1000000);
        formattedValue = valueInM % 1 === 0 ? 
          `${valueInM}MΩ` : `${valueInM.toFixed(3)}MΩ`;
        breakdown += `${valueInM}MΩ`;
      } else if (resistance >= 1000) {
        const valueInK = (resistance / 1000);
        formattedValue = valueInK % 1 === 0 ? 
          `${valueInK}kΩ` : `${valueInK.toFixed(3)}kΩ`;
        breakdown += `${valueInK}kΩ`;
      } else if (resistance < 1) {
        formattedValue = resistance.toFixed(4) + 'Ω';
        breakdown += `${resistance.toFixed(4)}Ω`;
      } else {
        formattedValue = resistance.toString() + 'Ω';
        breakdown += `${resistance}Ω`;
      }
      
      this.setData({
        resistanceValue: formattedValue,
        breakdownText: breakdown
      });
    }
  });