// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    countdownText: '00:00:00',
    targetDate: '2023-11-20 23:59:59' // 设置目标日期，例如：new Date('2023-12-31 23:59:59')
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
    const testTime = new Date(this.data.targetDate);
    const remainingTime = Math.abs((testTime as any as number) - (currentTime as any as number));
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
  
            const ctx = wx.createCanvasContext('myCanvas', this);
  
            // 将拍摄到的照片绘制到 canvas 上
            ctx.drawImage(tempFilePaths[0], 0, 0, imgWidth, imgHeight);
  
            // 在 canvas 上绘制倒计时文本
            ctx.setFillStyle('white');
            ctx.setFontSize(20);
            const textWidth = ctx.measureText(this.data.countdownText).width;
            const x = (imgWidth - textWidth) / 2;
            const y = imgHeight / 2;
            ctx.fillText(this.data.countdownText, x, y);
  
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
                        title: '保存成功',
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
          },
        });
      },
    });
  },
  
  // takePhoto() {
  //   wx.chooseImage({
  //     count: 1,
  //     sourceType: ['camera'],
  //     success: (res) => {
  //       const tempFilePaths = res.tempFilePaths;
  //       // 您可以在这里处理照片，例如添加水印或其他操作
  //       console.log('照片路径：', tempFilePaths);
  
  //       const ctx = wx.createCanvasContext('myCanvas', this);
  
  //       // 将拍摄到的照片绘制到 canvas 上
  //       ctx.drawImage(tempFilePaths[0], 0, 0, 300, 200);
  //       // 在 canvas 上绘制倒计时文本
  //       ctx.setFillStyle('white');
  //       ctx.setFontSize(20);
  //       console.log(this.data.countdownText)
  //       // this.data.countdownText = "0402 test content"
  //       ctx.fillText(this.data.countdownText.toString(), 10, 30);
  
  //       // 将修改后的 canvas 保存为图片
  //       ctx.draw(false, () => {
  //         wx.canvasToTempFilePath({
  //           canvasId: 'myCanvas',
  //           success: (res) => {
  //             // 此处可以处理新生成的图片，例如保存到相册或发送给朋友
  //             console.log('新图片路径：', res.tempFilePath);
  //             // 保存到系统相册
  //             wx.saveImageToPhotosAlbum({
  //               filePath: res.tempFilePath,
  //               success() {
  //                 wx.showToast({
  //                   title: '保存成功',
  //                   icon: 'success',
  //                   duration: 2000
  //                 });
  //               },
  //               fail() {
  //                 wx.showToast({
  //                   title: '保存失败',
  //                   icon: 'none',
  //                   duration: 2000
  //                 });
  //               }
  //             });
  //           },
  //           fail: (err) => {
  //             console.error('canvasToTempFilePath 失败: ', err);
  //           }
  //         });
  //       });
  //     },
  //   });
  // },
  
  getUserInfo(e: any) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
