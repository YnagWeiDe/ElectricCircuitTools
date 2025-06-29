// index.ts

// 定义芯片接口
interface Chip {
    model: string;
    name: string;
    description: string;
    function: string;
    inputs: string;
    gates: string;
    outputType: string;
    pins: { left: string; right: string }[];
  }
  
  // 定义芯片数据接口
  interface ChipData {
    [key: string]: Chip[];
    '74LS系列': Chip[];
    'CC4000系列CMOS': Chip[];
  }
  
  Page({
    data: {
      // 芯片系列列表
      seriesList: ['74LS系列', 'CC4000系列CMOS'] as const,
      seriesIndex: 0,
      
      // 当前系列下的芯片列表（包含型号和名称）
      chipList: [] as string[],
      chipIndex: 0,
      
      // 芯片总数
      totalChips: 0,
      
      // 当前选中的芯片
      currentChip: {
        model: '',
        name: '',
        description: '',
        function: '',
        inputs: '',
        gates: '',
        outputType: '',
        pins: [] as { left: string; right: string }[]
      } as Chip,
      
      // 芯片数据库 - 使用 ChipData 接口确保类型安全
      chipData: {
        '74LS系列': [
            {
              model: '74LS00',
              name: '四2输入与非门',
              description: '包含4个独立的2输入与非门，每个门实现逻辑与非功能',
              function: '与非门',
              inputs: '2输入 × 4门',
              gates: '4',
              outputType: '推挽输出',
              pins: [
                {left: '1A', right: '1Y'},
                {left: '1B', right: '2Y'},
                {left: '2A', right: '2A'},
                {left: '2B', right: '2B'},
                {left: 'GND', right: '3Y'},
                {left: '3A', right: '3B'},
                {left: '3B', right: '4A'},
                {left: '4A', right: '4B'},
                {left: '4B', right: '4Y'},
                {left: 'VCC', right: 'NC'}
              ]
            },
            {
              model: '74LS02',
              name: '四2输入或非门',
              description: '包含4个独立的2输入或非门，每个门实现逻辑或非功能',
              function: '或非门',
              inputs: '2输入 × 4门',
              gates: '4',
              outputType: '推挽输出',
              pins: [
                {left: '1Y', right: '1A'},
                {left: '1A', right: '1B'},
                {left: '2Y', right: '2A'},
                {left: '2A', right: '2B'},
                {left: 'GND', right: '3Y'},
                {left: '3A', right: '3B'},
                {left: '4Y', right: '4A'},
                {left: '4A', right: '4B'},
                {left: 'NC', right: 'NC'},
                {left: 'VCC', right: 'NC'}
              ]
            },
            {
              model: '74LS04',
              name: '六反相器',
              description: '包含6个独立的反相器，每个反相器实现逻辑非功能',
              function: '非门',
              inputs: '1输入 × 6门',
              gates: '6',
              outputType: '推挽输出',
              pins: [
                {left: '1A', right: '1Y'},
                {left: '2A', right: '2Y'},
                {left: '3A', right: '3Y'},
                {left: 'GND', right: '4Y'},
                {left: '4A', right: '5Y'},
                {left: '5A', right: '6Y'},
                {left: '6A', right: 'NC'},
                {left: 'VCC', right: 'NC'}
              ]
            },
            {
              model: '74LS08',
              name: '四2输入与门',
              description: '包含4个独立的2输入与门，每个门实现逻辑与功能',
              function: '与门',
              inputs: '2输入 × 4门',
              gates: '4',
              outputType: '推挽输出',
              pins: [
                {left: '1A', right: '1Y'},
                {left: '1B', right: '2Y'},
                {left: '2A', right: '2A'},
                {left: '2B', right: '2B'},
                {left: 'GND', right: '3Y'},
                {left: '3A', right: '3B'},
                {left: '3B', right: '4A'},
                {left: '4A', right: '4B'},
                {left: '4B', right: '4Y'},
                {left: 'VCC', right: 'NC'}
              ]
            },
            {
              model: '74LS32',
              name: '四2输入或门',
              description: '包含4个独立的2输入或门，每个门实现逻辑或功能',
              function: '或门',
              inputs: '2输入 × 4门',
              gates: '4',
              outputType: '推挽输出',
              pins: [
                {left: '1A', right: '1Y'},
                {left: '1B', right: '2Y'},
                {left: '2A', right: '2A'},
                {left: '2B', right: '2B'},
                {left: 'GND', right: '3Y'},
                {left: '3A', right: '3B'},
                {left: '3B', right: '4A'},
                {left: '4A', right: '4B'},
                {left: '4B', right: '4Y'},
                {left: 'VCC', right: 'NC'}
              ]
            },
            {
              model: '74LS86',
              name: '四2输入异或门',
              description: '包含4个独立的2输入异或门，每个门实现逻辑异或功能',
              function: '异或门',
              inputs: '2输入 × 4门',
              gates: '4',
              outputType: '推挽输出',
              pins: [
                {left: '1A', right: '1Y'},
                {left: '1B', right: '2Y'},
                {left: '2A', right: '2A'},
                {left: '2B', right: '2B'},
                {left: 'GND', right: '3Y'},
                {left: '3A', right: '3B'},
                {left: '3B', right: '4A'},
                {left: '4A', right: '4B'},
                {left: '4B', right: '4Y'},
                {left: 'VCC', right: 'NC'}
              ]
            },
            {
              model: '74LS20',
              name: '双4输入与非门',
              description: '包含2个独立的4输入与非门，每个门实现多输入逻辑与非功能',
              function: '与非门',
              inputs: '4输入 × 2门',
              gates: '2',
              outputType: '推挽输出',
              pins: [
                {left: '1A', right: '1Y'},
                {left: '1B', right: 'NC'},
                {left: '1C', right: 'NC'},
                {left: '1D', right: 'NC'},
                {left: 'GND', right: '2Y'},
                {left: '2A', right: '2B'},
                {left: '2B', right: '2C'},
                {left: '2C', right: '2D'},
                {left: 'NC', right: 'NC'},
                {left: 'VCC', right: 'NC'}
              ]
            },
            {
              model: '74LS30',
              name: '8输入与非门',
              description: '包含1个8输入与非门，实现多输入逻辑与非功能',
              function: '与非门',
              inputs: '8输入',
              gates: '1',
              outputType: '推挽输出',
              pins: [
                {left: 'A', right: 'NC'},
                {left: 'B', right: 'NC'},
                {left: 'C', right: 'NC'},
                {left: 'D', right: 'Y'},
                {left: 'E', right: 'NC'},
                {left: 'F', right: 'NC'},
                {left: 'GND', right: 'NC'},
                {left: 'H', right: 'NC'},
                {left: 'NC', right: 'NC'},
                {left: 'VCC', right: 'NC'}
              ]
            }
          ],
          'CC4000系列CMOS': [
            {
              model: 'CD4001',
              name: '四2输入或非门',
              description: '包含4个独立的2输入或非门，CMOS工艺，低功耗',
              function: '或非门',
              inputs: '2输入 × 4门',
              gates: '4',
              outputType: '推挽输出',
              pins: [
                {left: 'VDD', right: '1A'},
                {left: '1B', right: '1Y'},
                {left: '2A', right: '2B'},
                {left: '2Y', right: '3A'},
                {left: '3B', right: '3Y'},
                {left: '4A', right: '4B'},
                {left: '4Y', right: 'VSS'},
                {left: 'NC', right: 'NC'},
                {left: 'NC', right: 'NC'},
                {left: 'NC', right: 'NC'}
              ]
            },
            {
              model: 'CD4011',
              name: '四2输入与非门',
              description: '包含4个独立的2输入与非门，CMOS工艺，宽工作电压范围',
              function: '与非门',
              inputs: '2输入 × 4门',
              gates: '4',
              outputType: '推挽输出',
              pins: [
                {left: '1A', right: '1Y'},
                {left: '1B', right: '2A'},
                {left: '2B', right: '2Y'},
                {left: '3A', right: '3B'},
                {left: '3Y', right: '4A'},
                {left: '4B', right: '4Y'},
                {left: 'VSS', right: 'VDD'},
                {left: 'NC', right: 'NC'},
                {left: 'NC', right: 'NC'},
                {left: 'NC', right: 'NC'}
              ]
            },
            {
              model: 'CD4071',
              name: '四2输入或门',
              description: '包含4个独立的2输入或门，CMOS工艺，适合电池供电应用',
              function: '或门',
              inputs: '2输入 × 4门',
              gates: '4',
              outputType: '推挽输出',
              pins: [
                {left: '1A', right: '1Y'},
                {left: '1B', right: '2A'},
                {left: '2B', right: '2Y'},
                {left: '3A', right: '3B'},
                {left: '3Y', right: '4A'},
                {left: '4B', right: '4Y'},
                {left: 'VSS', right: 'VDD'},
                {left: 'NC', right: 'NC'},
                {left: 'NC', right: 'NC'},
                {left: 'NC', right: 'NC'}
              ]
            },
            {
              model: 'CD4081',
              name: '四2输入与门',
              description: '包含4个独立的2输入与门，CMOS工艺，低静态电流',
              function: '与门',
              inputs: '2输入 × 4门',
              gates: '4',
              outputType: '推挽输出',
              pins: [
                {left: '1A', right: '1Y'},
                {left: '1B', right: '2A'},
                {left: '2B', right: '2Y'},
                {left: '3A', right: '3B'},
                {left: '3Y', right: '4A'},
                {left: '4B', right: '4Y'},
                {left: 'VSS', right: 'VDD'},
                {left: 'NC', right: 'NC'},
                {left: 'NC', right: 'NC'},
                {left: 'NC', right: 'NC'}
              ]
            },
            {
              model: 'CD4069',
              name: '六反相器',
              description: '包含6个独立的反相器，CMOS工艺，高噪声容限',
              function: '非门',
              inputs: '1输入 × 6门',
              gates: '6',
              outputType: '推挽输出',
              pins: [
                {left: '1A', right: '1Y'},
                {left: '2A', right: '2Y'},
                {left: '3A', right: '3Y'},
                {left: 'VDD', right: '4Y'},
                {left: '4A', right: '5Y'},
                {left: '5A', right: '6Y'},
                {left: '6A', right: 'VSS'},
                {left: 'NC', right: 'NC'},
                {left: 'NC', right: 'NC'},
                {left: 'NC', right: 'NC'}
              ]
            },
            {
              model: 'CD4070',
              name: '四异或门',
              description: '包含4个独立的异或门，CMOS工艺，高速操作',
              function: '异或门',
              inputs: '2输入 × 4门',
              gates: '4',
              outputType: '推挽输出',
              pins: [
                {left: '1A', right: '1Y'},
                {left: '1B', right: '2A'},
                {left: '2B', right: '2Y'},
                {left: '3A', right: '3B'},
                {left: '3Y', right: '4A'},
                {left: '4B', right: '4Y'},
                {left: 'VSS', right: 'VDD'},
                {left: 'NC', right: 'NC'},
                {left: 'NC', right: 'NC'},
                {left: 'NC', right: 'NC'}
              ]
            },
            {
              model: 'CD4002',
              name: '双4输入或非门',
              description: '包含2个独立的4输入或非门，CMOS工艺，适用于逻辑控制电路',
              function: '或非门',
              inputs: '4输入 × 2门',
              gates: '2',
              outputType: '推挽输出',
              pins: [
                {left: '1A', right: '1Y'},
                {left: '1B', right: 'NC'},
                {left: '1C', right: 'NC'},
                {left: '1D', right: 'NC'},
                {left: 'VDD', right: '2Y'},
                {left: '2A', right: '2B'},
                {left: '2B', right: '2C'},
                {left: '2C', right: '2D'},
                {left: 'NC', right: 'VSS'},
                {left: 'NC', right: 'NC'}
              ]
            }
          ]
      } as ChipData
    },
  
    onLoad() {
      // 初始化芯片列表
      this.updateChipList();
      // 计算芯片总数
      this.calculateTotalChips();
    },
  
    // 当芯片系列改变
    onSeriesChange(e: any) {
      const index = e.detail.value;
      this.setData({
        seriesIndex: index
      });
      this.updateChipList();
    },
  
    // 当芯片型号改变
    onChipChange(e: any) {
      const index = e.detail.value;
      this.setData({
        chipIndex: index
      });
      
      const series = this.data.seriesList[this.data.seriesIndex] as keyof ChipData;
      
      // 确保索引有效
      if (this.data.chipData[series] && this.data.chipData[series][index]) {
        this.setData({
          currentChip: this.data.chipData[series][index]
        });
      }
    },
  
    // 更新当前系列的芯片列表
    updateChipList() {
      // 使用类型断言确保访问安全
      const series = this.data.seriesList[this.data.seriesIndex] as keyof ChipData;
      
      // 获取当前系列的芯片数据
      const chipArray = this.data.chipData[series];
      
      if (chipArray && chipArray.length > 0) {
        // 修改这里：将型号和名称组合起来显示
        // const chips = this.data.chipData[series].map((chip: any) => chip.model); 这个只显示一个
        const chips = chipArray.map(chip => `${chip.model} ${chip.name}`);
        
        this.setData({
          chipList: chips,
          chipIndex: 0,
          currentChip: chipArray[0]
        });
      } else {
        // 处理空数据情况
        this.setData({
          chipList: [],
          chipIndex: 0,
          currentChip: {
            model: '',
            name: '无数据',
            description: '该系列暂无芯片数据',
            function: '',
            inputs: '',
            gates: '',
            outputType: '',
            pins: []
          }
        });
      }
    },
      
    // 计算芯片总数
    calculateTotalChips() {
      let total = 0;
      
      // 使用类型安全的迭代方式
      (Object.keys(this.data.chipData) as Array<keyof ChipData>).forEach(series => {
        total += this.data.chipData[series].length;
      });
      
      this.setData({
        totalChips: total
      });
    }
  });