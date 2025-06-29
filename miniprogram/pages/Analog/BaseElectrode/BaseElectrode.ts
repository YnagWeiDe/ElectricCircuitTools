// index.ts
Page({
    data: {
        type: 'npn', // 三极管类型：npn 或 pnp
        vcc: '10', // 正电源电压 (V)
        vee: '10', // 负电源电压 (V) 实际为负值，但输入为正数
        rb: '100', // 基极接地电阻 (kΩ)
        re: '10', // 发射极电阻 (kΩ)
        rc: '5', // 集电极电阻 (kΩ)
        beta: '100', // 电流放大倍数
        vbe: '0.7', // 基极-发射极电压 (V)
        vceSat: '0.2', // 饱和压降 (V)
        
        // 计算结果
        ib: '',
        ic: '',
        ie: '',
        vce: '',
        calcState: '',
        calcStateClass: ''
    },

    // 切换三极管类型
    changeType(e: any) {
        const type = e.currentTarget.dataset.type;
        this.setData({ type });
    },

    // 输入处理
    onInput(e: any) {
        const field = e.currentTarget.dataset.field;
        this.setData({ [field]: e.detail.value });
    },

    // 计算静态工作点
    calculate() {
        // 获取输入值并转换为数字
        const vcc = parseFloat(this.data.vcc) || 0;
        const vee = -Math.abs(parseFloat(this.data.vee) || 0); // 确保为负值
        const rb = parseFloat(this.data.rb) || 0;
        const re = parseFloat(this.data.re) || 0;
        const rc = parseFloat(this.data.rc) || 0;
        const beta = parseFloat(this.data.beta) || 0;
        const vbe = parseFloat(this.data.vbe) || 0.7;
        const vceSat = parseFloat(this.data.vceSat) || 0.2;
        const type = this.data.type;
        
        let ib: number = 0, ic: number = 0, ie: number = 0, vce: number = 0;
        let calcState: string = '', calcStateClass: string = '';
        
        try {
            if (type === 'npn') {
                // NPN三极管计算逻辑
                // 迭代计算基极电流
                let ibEst = 0.0001; // 初始估计值 0.1mA
                let delta = 1;
                let iterations = 0;
                
                while (delta > 1e-9 && iterations < 100) {
                    // 基极电压 (Vb = -Ib * Rb * 1000)
                    const vb = -ibEst * rb * 1000;
                    
                    // 发射极电压 (Ve = Vb - Vbe)
                    const ve = vb - vbe;
                    
                    // 发射极电流 (Ie = (Ve - VEE) / (Re * 1000))
                    const ieNew = (ve - vee) / (re * 1000);
                    
                    // 新的基极电流 (Ib = Ie / (β + 1))
                    const ibNew = ieNew / (beta + 1);
                    
                    // 计算变化量
                    delta = Math.abs(ibNew - ibEst);
                    ibEst = ibNew;
                    iterations++;
                }
                
                ib = ibEst;
                ie = ib * (beta + 1);
                ic = beta * ib;
                
                // 集电极电压 (Vc = VCC - Ic * Rc * 1000)
                const vc = vcc - ic * rc * 1000;
                
                // 发射极电压 (Ve = -Ib * Rb * 1000 - Vbe)
                const veResult = -ib * rb * 1000 - vbe;
                
                // Vce = Vc - Ve
                vce = vc - veResult;
                
                // 确定工作状态
                if (ib <= 1e-6) { // 小于1μA视为截止
                    calcState = '截止区';
                    calcStateClass = 'cutoff';
                } else if (vce < vceSat) {
                    calcState = '饱和区';
                    calcStateClass = 'saturation';
                } else {
                    calcState = '放大区';
                    calcStateClass = 'amplification';
                }
            } else {
                // PNP三极管计算逻辑
                // 迭代计算基极电流
                let ibEst = -0.0001; // 初始估计值 -0.1mA
                let delta = 1;
                let iterations = 0;
                
                while (delta > 1e-9 && iterations < 100) {
                    // 基极电压 (Vb = Ib * Rb * 1000)
                    const vb = ibEst * rb * 1000;
                    
                    // 发射极电压 (Ve = Vb + Vbe)
                    const ve = vb + vbe;
                    
                    // 发射极电流 (Ie = (VCC - Ve) / (Re * 1000))
                    const ieNew = (vcc - ve) / (re * 1000);
                    
                    // 新的基极电流 (Ib = -Ie / (β + 1))
                    const ibNew = -ieNew / (beta + 1);
                    
                    // 计算变化量
                    delta = Math.abs(ibNew - ibEst);
                    ibEst = ibNew;
                    iterations++;
                }
                
                ib = ibEst;
                ie = -ib * (beta + 1);
                ic = -ib * beta;
                
                // 集电极电压 (Vc = VEE + Ic * Rc * 1000)
                const vc = vee + ic * rc * 1000;
                
                // 发射极电压 (Ve = Ib * Rb * 1000 + Vbe)
                const veResult = ib * rb * 1000 + vbe;
                
                // Vce = Vc - Ve
                vce = vc - veResult;
                
                // 确定工作状态
                if (ib >= -1e-6) { // 大于-1μA视为截止
                    calcState = '截止区';
                    calcStateClass = 'cutoff';
                } else if (vce > -vceSat) {
                    calcState = '饱和区';
                    calcStateClass = 'saturation';
                } else {
                    calcState = '放大区';
                    calcStateClass = 'amplification';
                }
            }
            
            // 更新计算结果
            this.setData({
                ib: (Math.abs(ib) * 1000000).toFixed(2),
                ic: (Math.abs(ic) * 1000).toFixed(2),
                ie: (Math.abs(ie) * 1000).toFixed(2),
                vce: vce.toFixed(2),
                calcState,
                calcStateClass
            });
            
            // 显示成功消息
            wx.showToast({
                title: '计算完成',
                icon: 'success',
                duration: 1500
            });
            
        } catch (error) {
            // 显示错误消息
            wx.showToast({
                title: '计算错误',
                icon: 'error',
                duration: 2000
            });
            console.error("计算错误:", error);
        }
    },
    
    onLoad() {
        // 初始化逻辑
        wx.setNavigationBarTitle({
            title: '共基极静态工作点计算器'
        });
    }
});