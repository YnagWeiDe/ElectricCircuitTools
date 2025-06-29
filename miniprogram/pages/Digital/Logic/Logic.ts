Page({
    data: {
      expression: '',
      result: '',
      processText: '输入表达式后点击"化简"按钮',
      error: ''
    },
  
    onExpressionInput(e: WechatMiniprogram.Input) {
      this.setData({
        expression: e.detail.value,
        error: ''
      });
    },
  
    clearInput() {
      this.setData({
        expression: '',
        result: '',
        processText: '输入表达式后点击"化简"按钮',
        error: ''
      });
    },
  
    simplifyExpression() {
      const expression = this.data.expression.trim();
      this.setData({ error: '', result: '', processText: '计算中...' });
      
      if (!expression) {
        this.setData({ error: '请输入布尔表达式' });
        return;
      }
      
      try {
        // 预处理输入：转大写，去空格
        const processedInput = expression.toUpperCase().replace(/\s+/g, '');
        
        // 分割立方体
        const cubeStrs = processedInput.split('+').filter(s => s.length > 0);
        
        // 收集所有最小项
        const allMinterms = new Set<number>();
        const processSteps: string[] = [];
        
        processSteps.push(`输入表达式: ${expression}`);
        processSteps.push(`预处理结果: ${processedInput}`);
        processSteps.push(`分割立方体: ${cubeStrs.join(', ')}`);
        
        for (const s of cubeStrs) {
          const cube = this.parseCube(s);
          const minterms = this.expandCube(cube);
          minterms.forEach(m => allMinterms.add(m));
          
          processSteps.push(`立方体 ${s} 解析为: [${cube.join(', ')}]`);
          processSteps.push(`展开为最小项: ${minterms.join(', ')}`);
        }
        
        processSteps.push(`所有最小项: ${Array.from(allMinterms).join(', ')}`);
        
        // 特殊情况处理
        if (allMinterms.size === 0) {
          this.setData({ result: '0', processText: processSteps.join('\n') });
          return;
        } else if (allMinterms.size === 16) {
          this.setData({ result: '1', processText: processSteps.join('\n') });
          return;
        }
        
        // 找到质蕴涵项
        const primes = this.findPrimeImplicants(allMinterms);
        processSteps.push(`质蕴涵项: ${primes.join(', ')}`);
        
        if (primes.length === 0) {
          this.setData({ result: '0', processText: processSteps.join('\n') });
          return;
        }
        
        // 使用Petrick方法找到最小覆盖
        const essentialPrimes = this.petrickMethod(primes, allMinterms);
        processSteps.push(`最小覆盖: ${essentialPrimes.join(', ')}`);
        
        // 输出化简结果
        if (essentialPrimes.length === 0) {
          this.setData({ result: '0', processText: processSteps.join('\n') });
        } else {
          const resultExpr = essentialPrimes.map(p => this.implicantToExpr(p)).join(' + ');
          this.setData({ result: resultExpr, processText: processSteps.join('\n') });
        }
        
      } catch (error) {
        this.setData({ 
          error: error.message || '计算错误',
          processText: '计算过程中发生错误'
        });
      }
    },
    
    // 解析立方体字符串（如 "A'B'C"）为4元组（A,B,C,D），值：'0', '1', '-'
    parseCube(cubeStr: string): string[] {
      const cube = ['-', '-', '-', '-']; // 初始化4个变量均为无关（'-'）
      const varIndex: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      let i = 0;
      
      while (i < cubeStr.length) {
        const c = cubeStr[i];
        if (varIndex.hasOwnProperty(c)) {
          const idx = varIndex[c];
          if (i + 1 < cubeStr.length && cubeStr[i + 1] === '\'') {
            cube[idx] = '0'; // 带'表示补
            i += 2; // 跳过变量和'
          } else {
            cube[idx] = '1'; // 不带'表示原变量
            i += 1;
          }
        } else {
          i++; // 跳过无效字符
        }
      }
      
      return cube;
    },
    
    // 将立方体展开为最小项列表（整数表示）
    expandCube(cube: string[]): number[] {
      const minterms: number[] = [];
      const undecided: number[] = []; // 记录无关变量的位置
      
      for (let i = 0; i < 4; i++) {
        if (cube[i] === '-') undecided.push(i);
      }
  
      let base = 0;
      for (let i = 0; i < 4; i++) {
        if (cube[i] === '1') base |= (1 << (3 - i)); // A在最高位（第3位）
      }
  
      const n = undecided.length;
      for (let mask = 0; mask < (1 << n); mask++) {
        let term = base;
        for (let j = 0; j < n; j++) {
          if (mask & (1 << j)) {
            term |= (1 << (3 - undecided[j])); // 设置无关位为1
          }
        }
        minterms.push(term);
      }
      
      return minterms;
    },
    
    // 计算二进制字符串中1的个数
    countOnes(s: string): number {
      let count = 0;
      for (let i = 0; i < s.length; i++) {
        if (s[i] === '1') count++;
      }
      return count;
    },
    
    // 合并两个项（只有一位不同）
    combineTerms(a: string, b: string): string {
      let diff = 0;
      let combined = '';
      
      for (let i = 0; i < 4; i++) {
        if (a[i] !== b[i]) {
          diff++;
          if (diff > 1) return '';
          if ((a[i] === '0' && b[i] === '1') || (a[i] === '1' && b[i] === '0')) {
            combined += '-';
          } else {
            return '';
          }
        } else {
          combined += a[i];
        }
      }
      
      return (diff === 1) ? combined : '';
    },
    
    // 使用Quine-McCluskey算法找到质蕴涵项
    findPrimeImplicants(mintermsSet: Set<number>): string[] {
      if (mintermsSet.size === 0) return [];
      if (mintermsSet.size === 16) return ["----"]; // 全1
  
      // 初始分组（按1的个数）
      const groups: string[][] = [[], [], [], [], []];
      for (const m of mintermsSet) {
        let bin = "";
        for (let i = 3; i >= 0; i--) { // A(3), B(2), C(1), D(0)
          bin += ((m >> i) & 1) ? '1' : '0';
        }
        groups[this.countOnes(bin)].push(bin);
      }
  
      const primeImplicantsSet = new Set<string>();
      let currentGroups = groups;
      let changed = true;
  
      while (changed) {
        changed = false;
        const newTerms = new Set<string>();
        const nextGroups: string[][] = [[], [], [], [], []];
        const used: boolean[][] = currentGroups.map(group => group.map(() => false));
  
        // 合并相邻组
        for (let i = 0; i < currentGroups.length - 1; i++) {
          for (let j = 0; j < currentGroups[i].length; j++) {
            for (let k = 0; k < currentGroups[i + 1].length; k++) {
              const a = currentGroups[i][j];
              const b = currentGroups[i + 1][k];
              const c = this.combineTerms(a, b);
              if (c) {
                newTerms.add(c);
                used[i][j] = true;
                used[i + 1][k] = true;
                changed = true;
              }
            }
          }
        }
  
        // 收集未被合并的项（质蕴涵项）
        for (let i = 0; i < currentGroups.length; i++) {
          for (let j = 0; j < currentGroups[i].length; j++) {
            if (!used[i][j]) {
              primeImplicantsSet.add(currentGroups[i][j]);
            }
          }
        }
  
        // 为下一轮准备新分组
        for (const term of newTerms) {
          nextGroups[this.countOnes(term)].push(term);
        }
        currentGroups = nextGroups;
      }
  
      // 收集最后一轮的质蕴涵项
      for (const group of currentGroups) {
        for (const term of group) {
          primeImplicantsSet.add(term);
        }
      }
  
      return Array.from(primeImplicantsSet);
    },
    
    // 质蕴涵项覆盖的最小项
    covers(implicant: string, minterm: number): boolean {
      let bin = "";
      for (let i = 3; i >= 0; i--) {
        bin += ((minterm >> i) & 1) ? '1' : '0';
      }
      
      for (let i = 0; i < 4; i++) {
        if (implicant[i] !== '-' && implicant[i] !== bin[i]) {
          return false;
        }
      }
      
      return true;
    },
    
    // 使用Petrick方法找到最小覆盖
    petrickMethod(primes: string[], minterms: Set<number>): string[] {
      const mintermsVec = Array.from(minterms);
      const mintermToPrimes: Record<number, Set<number>> = {};
      
      for (const m of mintermsVec) {
        mintermToPrimes[m] = new Set<number>();
        for (let i = 0; i < primes.length; i++) {
          if (this.covers(primes[i], m)) {
            mintermToPrimes[m].add(i);
          }
        }
      }
  
      // 初始化乘积表达式（每个最小项的覆盖集合）
      let sop: Set<number>[] = [new Set()];
      
      for (const m of mintermsVec) {
        const newSop: Set<number>[] = [];
        
        for (const prod of sop) {
          for (const primeIdx of mintermToPrimes[m]) {
            const newProd = new Set(prod);
            newProd.add(primeIdx);
            newSop.push(newProd);
          }
        }
        
        // 简化：去除被包含的集合
        newSop.sort((a, b) => a.size - b.size);
        sop = [];
        
        for (let i = 0; i < newSop.length; i++) {
          let dominated = false;
          
          for (let j = 0; j < i; j++) {
            if (this.isSuperset(newSop[i], newSop[j])) {
              dominated = true;
              break;
            }
          }
          
          if (!dominated) {
            sop.push(newSop[i]);
          }
        }
      }
  
      // 找到最小覆盖
      if (sop.length === 0) return [];
      const minCover = sop.reduce((min, curr) => 
        curr.size < min.size ? curr : min, sop[0]);
      
      return Array.from(minCover).map(idx => primes[idx]);
    },
    
    // 检查集合A是否是集合B的超集
    isSuperset(a: Set<number>, b: Set<number>): boolean {
      for (const elem of b) {
        if (!a.has(elem)) {
          return false;
        }
      }
      return true;
    },
    
    // 将质蕴涵项转换为表达式字符串
    implicantToExpr(imp: string): string {
      let expr = "";
      const vars = "ABCD";
      
      for (let i = 0; i < 4; i++) {
        if (imp[i] === '0') {
          expr += vars[i] + "'";
        } else if (imp[i] === '1') {
          expr += vars[i];
        }
      }
      
      return expr || "1"; // 全无关返回1
    }
  });