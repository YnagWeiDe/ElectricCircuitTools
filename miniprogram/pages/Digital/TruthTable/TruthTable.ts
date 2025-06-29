// TS
Page({
    data: {
      gateList: [
        "与门 (AND)", 
        "或门 (OR)", 
        "非门 (NOT)", 
        "与非门 (NAND)", 
        "或非门 (NOR)", 
        "异或门 (XOR)", 
        "同或门 (XNOR)"
      ],
      flipflopList: [
        "基本RS触发器", 
        "同步RS触发器", 
        "D触发器", 
        "JK触发器", 
        "T触发器", 
        "T'触发器"
      ],
      gateIndex: -1,
      flipflopIndex: -1,
      currentType: '', // 'gate' 或 'flipflop'
      currentTable: {
        title: "请选择逻辑操作符或触发器",
        description: "选择上方选项查看真值表",
        headers: ["输入", "输出"],
        rows: [
          ["-", "-"],
          ["-", "-"]
        ] as (string|number)[][]
      }
    },
  
    onLoad() {
      // 初始化默认显示
      this.setData({
        currentTable: {
          title: "请选择逻辑操作符或触发器",
          description: "选择上方选项查看真值表",
          headers: ["输入", "输出"],
          rows: [
            ["-", "-"],
            ["-", "-"]
          ]
        }
      });
    },
  
    onGateChange(e: any) {
      const value = e.detail.value;
      this.setGateTable(Number(value));
      this.setData({
        currentType: 'gate',
        flipflopIndex: -1
      });
    },
  
    onFlipflopChange(e: any) {
      const value = e.detail.value;
      this.setFlipflopTable(Number(value));
      this.setData({
        currentType: 'flipflop',
        gateIndex: -1
      });
    },
  
    setGateTable(index: number) {
      const gateTables = [
        {
          title: "与门",
          description: "所有输入为1时输出1",
          headers: ["A", "B", "输出"],
          rows: [
            [0, 0, 0],
            [0, 1, 0],
            [1, 0, 0],
            [1, 1, 1]
          ]
        },
        {
          title: "或门",
          description: "任一输入为1时输出1",
          headers: ["A", "B", "输出"],
          rows: [
            [0, 0, 0],
            [0, 1, 1],
            [1, 0, 1],
            [1, 1, 1]
          ]
        },
        {
          title: "非门",
          description: "输出输入的反相",
          headers: ["A", "输出"],
          rows: [
            [0, 1],
            [1, 0]
          ]
        },
        {
          title: "与非门",
          description: "与门后加非门",
          headers: ["A", "B", "输出"],
          rows: [
            [0, 0, 1],
            [0, 1, 1],
            [1, 0, 1],
            [1, 1, 0]
          ]
        },
        {
          title: "或非门",
          description: "或门后加非门",
          headers: ["A", "B", "输出"],
          rows: [
            [0, 0, 1],
            [0, 1, 0],
            [1, 0, 0],
            [1, 1, 0]
          ]
        },
        {
          title: "异或门",
          description: "输入不同时输出1",
          headers: ["A", "B", "输出"],
          rows: [
            [0, 0, 0],
            [0, 1, 1],
            [1, 0, 1],
            [1, 1, 0]
          ]
        },
        {
          title: "同或门",
          description: "输入相同时输出1",
          headers: ["A", "B", "输出"],
          rows: [
            [0, 0, 1],
            [0, 1, 0],
            [1, 0, 0],
            [1, 1, 1]
          ]
        }
      ];
      
      this.setData({
        gateIndex: index,
        currentTable: gateTables[index]
      });
    },
  
    setFlipflopTable(index: number) {
      const flipflopTables = [
        {
          title: "基本RS触发器",
          description: "基本置位复位触发器",
          headers: ["R", "S", "Q", "Q'"],
          rows: [
            [0, 0, "不定", "不定"],
            [0, 1, 0, 1],
            [1, 0, 1, 0],
            [1, 1, "-", "-"]
          ]
        },
        {
          title: "同步RS触发器",
          description: "带时钟控制的RS触发器",
          headers: ["CLK", "R", "S", "Q'"],
          rows: [
            [0, "X", "X", "-"],
            [1, 0, 0, "-"],
            [1, 0, 1, 1],
            [1, 1, 0, 0],
            [1, 1, 1, "不定"]
          ]
        },
        {
          title: "D触发器",
          description: "数据锁存器，存储1位数据",
          headers: ["CLK", "D", "Q'"],
          rows: [
            ["↑", 0, 0],
            ["↑", 1, 1],
            [0, "X", "-"],
            [1, "X", "-"]
          ]
        },
        {
          title: "JK触发器",
          description: "功能最全的触发器",
          headers: ["CLK", "J", "K", "Q'"],
          rows: [
            ["↑", 0, 0, "-"],
            ["↑", 0, 1, 0],
            ["↑", 1, 0, 1],
            ["↑", 1, 1, "翻转"],
            [0, "X", "X", "-"],
            [1, "X", "X", "-"]
          ]
        },
        {
          title: "T触发器",
          description: "翻转触发器",
          headers: ["CLK", "T", "Q'"],
          rows: [
            ["↑", 0, "-"],
            ["↑", 1, "翻转"],
            [0, "X", "-"],
            [1, "X", "-"]
          ]
        },
        {
          title: "T'触发器",
          description: "每时钟周期翻转一次",
          headers: ["CLK", "Q'"],
          rows: [
            ["↑", "翻转"],
            [0, "-"],
            [1, "-"]
          ]
        }
      ];
      
      this.setData({
        flipflopIndex: index,
        currentTable: flipflopTables[index]
      });
    }
  });