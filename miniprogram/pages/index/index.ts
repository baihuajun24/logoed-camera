// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    countdownText: '00:00:00',
    targetDate: '2022-11-20', // 设置目标日期，例如：new Date('2023-12-31 23:59:59')
    canvasHeight: 800,
    canvasWidth: 600
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs',
    })
  },
  onLoad() {
    // @ts-ignore
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }

    // 开始倒计时
    this.startCountdown();
  },

  getRemainingTime() {
    const currentTime = new Date();
    const testTime = new Date(this.data.targetDate + ' 00:00:00');
    let remainingTime: number;
    if (currentTime > testTime) {
      // 当前时间已经超过了目标时间
      remainingTime = (currentTime as any as number) - (testTime as any as number);
    } else {
      // 当前时间还未到达目标时间
      remainingTime = (testTime as any as number) - (currentTime as any as number);
    }
    //const remainingTime = Math.abs((testTime as any as number) - (currentTime as any as number));
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    // const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    // return totalSeconds;
    // return HH:MM:SS version
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },
  
  startCountdown() {
    const updateCountdown = () => {
      this.setData({
        countdownText: this.getRemainingTime()
      });
  
      setTimeout(updateCountdown, 1000);
    }
    updateCountdown();
  },

  onDateChange(e: any ) {
    this.setData({
      targetDate: e.detail.value
      
    });
    console.log(this.data.targetDate);
  },
  
  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  takePhoto() {
    wx.chooseImage({
      count: 1,
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        console.log('照片路径：', tempFilePaths);
  
        wx.getImageInfo({
          src: tempFilePaths[0],
          success: (res) => {
            const imgWidth = res.width;
            const imgHeight = res.height;
  
            this.setData({
              canvasWidth: imgWidth,
              canvasHeight: imgHeight
            });
  
            const ctx = wx.createCanvasContext('myCanvas', this);
  
            // 将拍摄到的照片绘制到 canvas 上
            ctx.drawImage(tempFilePaths[0], 0, 0, imgWidth, imgHeight);
  
            // 在 canvas 上绘制倒计时文本
            ctx.setFillStyle('orangered');
            ctx.setFontSize(80);
            const textWidth = ctx.measureText(this.data.countdownText).width;
            const x = (imgWidth - textWidth) / 2;
            const y = imgHeight / 2;
            ctx.fillText(this.data.countdownText, x, y);
  
            // 延迟绘制以确保 canvas 宽度和高度已更新
            setTimeout(() => {
              // 将修改后的 canvas 保存为图片
              ctx.draw(false, () => {
                wx.canvasToTempFilePath({
                  canvasId: 'myCanvas',
                  success: (res) => {
                    console.log('新图片路径：', res.tempFilePath);
                    wx.saveImageToPhotosAlbum({
                      filePath: res.tempFilePath,
                      success() {
                        wx.showToast({
                          title: '宇宙为你闪烁！',
                          icon: 'success',
                          duration: 2000
                        });
                      },
                      fail() {
                        wx.showToast({
                          title: '保存失败',
                          icon: 'none',
                          duration: 2000
                        });
                      }
                    });
                  },
                  fail: (err) => {
                    console.error('canvasToTempFilePath 失败: ', err);
                  }
                });
              });
            }, 100); // 延迟 100 毫秒
          },
        });
      },
    });
  },
  
  getUserInfo(e: any) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
