Page({
    data: {
      feedbackText: ""
    },
  
    onFeedbackInput(e: WechatMiniprogram.TextareaInput) {
      this.setData({ feedbackText: e.detail.value });
    },
  
    copyEmail() {
      const email = "2227355261@qq.com";
      wx.setClipboardData({
        data: email,
        success: () => {
          wx.showToast({
            title: '邮箱已复制',
            icon: 'success'
          });
        }
      });
    },
  
    copyWeChat() {
      const wechat = "Yang19905494385";
      wx.setClipboardData({
        data: wechat,
        success: () => {
          wx.showToast({
            title: '微信号已复制',
            icon: 'success'
          });
        }
      });
    },
  
    copyQQ() {
      const qq = "2227355261";
      wx.setClipboardData({
        data: qq,
        success: () => {
          wx.showToast({
            title: 'QQ号已复制',
            icon: 'success'
          });
        }
      });
    },
  
    submitFeedback() {
      const { feedbackText } = this.data;
      
      if (!feedbackText.trim()) {
        wx.showToast({
          title: '请填写反馈内容',
          icon: 'none'
        });
        return;
      }
      
      // 在实际应用中，这里应该发送反馈到服务器
      // 此处仅模拟提交成功
      wx.showToast({
        title: '反馈提交成功',
        icon: 'success',
        duration: 2000
      });
      
      // 清空输入框
      this.setData({ feedbackText: "" });
      
      // 显示感谢信息
      setTimeout(() => {
        wx.showModal({
          title: '感谢反馈',
          content: '您的意见对我们非常重要，我们会尽快处理！',
          showCancel: false
        });
      }, 2000);
    }
  });