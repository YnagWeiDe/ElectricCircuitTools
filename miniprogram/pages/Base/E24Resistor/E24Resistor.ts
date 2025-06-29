// TS
Page({
    data: {
      code: '',
      resistanceValue: '0Ω',
      breakdownText: '等待输入...'
    },
  
    onCodeInput(e: WechatMiniprogram.Input) {
      const input = e.detail.value.toUpperCase();
      this.setData({ code: input });
      
      if (input.length === 3) {
        this.calculateResistance(input);
      } else {
        this.setData({
          resistanceValue: '0Ω',
          breakdownText: '等待输入...'
        });
      }
    },
  
    calculateResistance(code: string) {
      let resistance = 0;
      let breakdown = '';
      
      // 处理包含R的情况（1R2, R12）
      if (code.includes('R')) {
        if (code[1] === 'R') {
          // 格式：1R2 = 1.2Ω
          const first = code[0];
          const third = code[2];
          
          if (isNaN(Number(first)) || isNaN(Number(third))) {
            this.setData({
              resistanceValue: '输入无效',
              breakdownText: '无效的E24代码格式，第二位是R时，第一和第三位必须是数字'
            });
            return;
          }
          
          resistance = parseFloat(`${first}.${third}`);
          breakdown = `解析：${first}R${third} = ${first}.${third}Ω`;
        } else if (code[0] === 'R') {
          // 格式：R12 = 0.12Ω
          const second = code[1];
          const third = code[2];
          
          if (isNaN(Number(second)) || isNaN(Number(third))) {
            this.setData({
              resistanceValue: '输入无效',
              breakdownText: '无效的E24代码格式，第一位是R时，第二和第三位必须是数字'
            });
            return;
          }
          
          resistance = parseFloat(`0.${second}${third}`);
          breakdown = `解析：R${second}${third} = 0.${second}${third}Ω`;
        } else {
          this.setData({
            resistanceValue: '输入无效',
            breakdownText: '无效的E24代码格式，R只能出现在第一位或第二位'
          });
          return;
        }
      } 
      // 处理纯数字情况（102）
      else if (!isNaN(Number(code))) {
        const firstTwo = code.substring(0, 2);
        const multiplier = parseInt(code[2]);
        
        resistance = parseInt(firstTwo) * Math.pow(10, multiplier);
        breakdown = `解析：${firstTwo} × 10^${multiplier} = ${resistance}Ω`;
      } 
      // 无效输入
      else {
        this.setData({
          resistanceValue: '输入无效',
          breakdownText: '无效的E24代码格式，请检查输入'
        });
        return;
      }
      
      // 格式化电阻值（添加单位）
      let formattedValue = '';
      if (resistance >= 1000000) {
        formattedValue = (resistance / 1000000).toFixed(2) + 'MΩ';
      } else if (resistance >= 1000) {
        formattedValue = (resistance / 1000).toFixed(2) + 'kΩ';
      } else {
        formattedValue = resistance.toString() + 'Ω';
      }
      
      this.setData({
        resistanceValue: formattedValue,
        breakdownText: breakdown
      });
    }
  });