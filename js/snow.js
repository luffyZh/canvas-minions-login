(function (window, document, undefined) {
  // 存储所有的雪花
  const snows = [];

  // 下落的加速度
  const G = 0.015;

  const fps = 60;

  // 速度上限，避免速度过快
  const SPEED_LIMIT_X = 1;
  const SPEED_LIMIT_Y = 1;

  const W = window.innerWidth;
  const H = window.innerHeight;

  let tickCount = 150;
  let ticker = 0;
  let lastTime = Date.now();
  let deltaTime = 0;

  let canvas = null;
  let ctx = null;

  let snowImage = null;

  function Snow(x, y, radius) {
    this.x = x;
    this.y = y;
    this.sx = 0;
    this.sy = 0;
    this.deg = 0;
    this.radius = radius;
    this.ax = Math.random() < 0.5 ? 0.005 : -0.005;
  }

  Snow.prototype.update = function () {
    const deltaDeg = Math.random() * 0.6 + 0.2;

    this.sx += this.ax;
    if (this.sx >= SPEED_LIMIT_X || this.sx <= -SPEED_LIMIT_X) {
      this.ax *= -1;
    }

    if (this.sy < SPEED_LIMIT_Y) {
      this.sy += G;
    }

    this.deg += deltaDeg;
    this.x += this.sx;
    this.y += this.sy;
  }

  Snow.prototype.draw = function () {
    const radius = this.radius;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.deg * Math.PI / 180);
    ctx.drawImage(snowImage, -radius, -radius, radius * 2 , radius * 2);
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
        setTimeout(callback, 1000 / fps);
      }
  })();
  /**
   * 主循环函数
   */
  function loop() {

    ctx.clearRect(0, 0, W, H);

    const now = Date.now();
    deltaTime = now - lastTime;
    lastTime = now;
    ticker += deltaTime;

    if (ticker > tickCount) {
      snows.push(
        new Snow(Math.random() * W, 0, Math.random() * 10 + 5)
      );
      ticker %= tickCount;
    }

    const length = snows.length;
    snows.map(function (s, i) {
      
      // 在这里做雪花停止的效果
      if (s.y <= (H/2 + 10) && s.y >= (H/2 - 10)) {
        s.draw();
      } else {
        s.update();
        s.draw();
      }
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
      tickCount = 350;
    }
    // 设置雪花图片路径
    snowImage = new Image();
    snowImage.src = 'snow.png';
    // 不断绘制雪花
    loop();
  }
  // 初始化雪景
  init();
})(window, document);