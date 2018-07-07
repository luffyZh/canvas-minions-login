(function (window, document, undefined) {
  // 存储所有的雪花
  const snows = [];
  // 下落的加速度
  const G = 0.015;
  // 60是人眼所能见到流畅动画的最小阈值
  const fps = 60; 

  // 速度上限，避免速度过快
  const SPEED_LIMIT_X = 1;
  const SPEED_LIMIT_Y = 1;

  const W = window.innerWidth; // 浏览器可视窗口宽度
  const H = window.innerHeight; // 浏览器可视窗口高度
  // 控制雪花多少的变量，数值越小雪花越多，数值越大雪花越小
  let snowLevelTime = 150;
  // 时间定时器，当timer > snowLevelTime的时候
  let timer = 0; 
  let lastTime = Date.now();
  let deltaTime = 0;

  let canvas = null; // 画布实例
  let ctx = null; // 画布的context

  let snowImage = null; // 绘制目标，也就是雪花

  /**
   * 雪花对象
   * @param {x} x 
   * @param {y} y 
   * @param {半径或长宽} radius 
   */
  function Snow(x, y, radius) {
    this.x = x;
    this.y = y;
    // 如果是圆形就是半径，否则就是长宽相同的正方形
    this.radius = radius;
    // x方向的移动速度，可以向左也可以向右，范围在[-1, 1]
    this.speed_x = 0;
    // y方向的移动速度,只能向下，最快为1
    this.speed_y = 0;
    // 雪花自身旋转的角度
    this.deg = 0;
    // x方向，下落速度参数，飘落效果 > 0向左飘； < 0 向右飘 
    this.ax = Math.random() < 0.5 ? 0.005 : -0.005;
  }
  // 更新雪花位置
  Snow.prototype.update = function () {
    // 雪花自身旋转的角度增值
    const deltaDeg = Math.random() * 0.6 + 0.2;
    // 不断变化x方向的移动速度
    this.speed_x += this.ax;
    // x向左或者向右速度过大的时候改变方向
    if (this.speed_x >= SPEED_LIMIT_X || this.speed_x <= -SPEED_LIMIT_X) {
      this.ax *= -1;
    }
    // 雪花下落速度，最高是1
    if (this.speed_y < SPEED_LIMIT_Y) {
      // 雪花下落速度不断增加
      this.speed_y += G;
    }
    // 角度不断变化
    this.deg += deltaDeg;
    // x坐标不断变化
    this.x += this.speed_x;
    // y坐标不断变化
    this.y += this.speed_y;
  }
  // 绘制雪花
  Snow.prototype.draw = function () {
    // 获取半径宽高
    const radius = this.radius;
    // 保存画布的当前状态，因为下面用到了变换坐标和旋转画布
    ctx.save();
    /**
     * 下面这两句变化也挺重要的，因为旋转是按照画布远点进行的
     * 因此，如果想让雪花旋转明显，就需要将画布坐标移动到雪花的坐标点
     * 如果不加上坐标转换，那么所有雪花都在左上角也就是坐标原点旋转，x, y也不会变，没有飘落效果
     */
    // 将画布的坐标原点移动到(x, y)的位置，canvas默认是(0, 0)
    ctx.translate(this.x, this.y);
    // 将画布顺时针旋转的角度
    ctx.rotate(this.deg * Math.PI / 180);
    // 绘制雪花图像，因为画布坐标移动到了(x, y)，所以从0,0开始就是(-radius, radius)
    ctx.drawImage(snowImage, -radius, -radius, radius * 2 , radius * 2);
    // 恢复canvas旋转、translate等操作的状态，一般与save配合使用就是恢复到上一个save的状态
    // 如果不恢复上一个状态的话，话不旋转角度坐标都没变化，也就不会出现动画效果，必须恢复
    ctx.restore();
  }
  /**
   * 保证动画的兼容性，一般fps设置为60，一般浏览器的绘制时间最小间隔都是1000 / 60 ms
   */
  window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        setTimeout(callback, 1000 / fps); // 不断执行回调函数实现绘制, 16.7执行一次
      }
  })();
  /**
   * 主循环函数, 生成雪花以及绘制更新雪花位置
   */
  function loop() {
    // 擦除当前画布内容，否则原有的雪花不会消失，新绘制的雪花不断覆盖看起来会像一条雪花白色实线在下降
    ctx.clearRect(0, 0, W, H);
    // 两个雪花之间的时间差，不能生成的太快，要不然就成了鹅毛大雪了^_^
    const now = Date.now();
    // 距离上一次绘制的时间差
    deltaTime = now - lastTime;
    // 重置结束时间
    lastTime = now;
    // 时间控制器，当timer > snowLevelTime的时候，才增加雪花，否则不增加雪花
    timer += deltaTime;
    /**
     * 不加控制的话雪花会特别多， 150~300之间都合适
     */
    if (timer > snowLevelTime) {
      snows.push(
        // 绘制新雪花，x位置为随机数，y为顶部0，半径为随机数随机生成大小不一的雪花
        new Snow(Math.random() * W, 0, Math.random() * 15 + 5)
      );
      timer %= snowLevelTime;
    }

    const length = snows.length;
    snows.map(function (s, i) {
      s.update();
      s.draw();
      // 在这里做雪花停止的效果
      // if (s.y <= (H/2 + 10) && s.y >= (H/2 - 10)) {
      //   s.draw();
      // } else {
      //   s.update();
      //   s.draw();
      // }
      if (s.y >= H) {
        snows.splice(i, 1);
      }
    });
    // 避免失真，浏览器页面每次重绘之前调用
    requestAnimationFrame(loop);
  }

  // 创建画布
  function createCanvas() {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
  }

  function init() {
    // 创建画布
    createCanvas();
    // 设置宽高以及canvas的css样式
    canvas.width = W;
    canvas.height = H;
    canvas.style.cssText = 'position: fixed; top: 0; left: 0; pointer-events: none;';
    document.body.appendChild(canvas);
    // 小屏幕时延长添加雪花时间，避免屏幕上出现太多的雪花
    if (W < 768) {
      snowLevelTime = 350;
    }
    // 设置雪花图片路径
    snowImage = new Image();
    snowImage.src = 'snow.png';
    // 不断绘制雪花，内部有requestAnimationFrame，内部会自动执行不断回调最后实现动画效果
    loop();
  }
  // 初始化雪景
  init();
})(window, document);