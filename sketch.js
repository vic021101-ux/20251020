// 定義顏色調色盤 (包含 9 種顏色)
const COLORS = [
  '#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8',
  '#48cae4', '#90e0ef', '#ade8f4', '#caf0f8'
];

// 用來儲存所有圓形物件的陣列
let circles = [];
// 用來儲存所有活躍的爆炸粒子群組
let explosions = [];

// 圓形的數量
const NUM_CIRCLES = 50; 

// 宣告音效變數
let popSound;

// 宣告得分變數
let score = 0;

// ====================================================================
// preload() 函式：在程式啟動前載入音效和圖片等資源
// ====================================================================
function preload() {
  // *** 請將 'pop_sound.mp3' 替換成您實際的音效檔路徑/名稱 ***
  // 確保您的音效檔在專案資料夾中
  popSound = loadSound('pop_sound.mp3'); 
}


// ====================================================================
// 爆炸粒子類別 (Particle Class)
// ====================================================================

class Particle {
  constructor(x, y, particleColor) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(1, 6)); 
    this.acc = createVector(0, 0);
    this.r = random(3, 8); 
    this.life = 255; 
    this.particleColor = particleColor;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.life -= 6; 
  }

  show() {
    noStroke();
    let c = this.particleColor;
    fill(red(c), green(c), blue(c), this.life);
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }

  isFinished() {
    return this.life < 0;
  }
}

// ====================================================================
// 爆炸群組類別 (Explosion Class)
// ====================================================================

class Explosion {
  constructor(x, y, particleColor) {
    this.particles = [];
    const numParticles = random(15, 30); 
    for (let i = 0; i < numParticles; i++) {
      this.particles.push(new Particle(x, y, particleColor));
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isFinished()) {
        this.particles.splice(i, 1);
      }
    }
  }

  show() {
    for (let particle of this.particles) {
      particle.show();
    }
  }

  isFinished() {
    return this.particles.length === 0;
  }
}


// ====================================================================
// 氣球創建與主繪圖邏輯
// ====================================================================

function setup() {
  // 建立 p5.js 預設的互動處理，讓聲音可以播放
  userStartAudio(); 
  
  createCanvas(windowWidth, windowHeight);
  background('#00b4d8'); 
  noStroke();
  rectMode(CORNER); 

  for (let i = 0; i < NUM_CIRCLES; i++) {
    circles.push(createCircle());
  }
}

// 產生單一氣球/圓形物件的函式
function createCircle() {
  let colorHex = random(COLORS);
  let colorObj = color(colorHex);
  let diameter = random(50, 200);
  let alpha = random(50, 200); 
  colorObj.setAlpha(alpha);
  
  let x = random(width);
  let y = random(height, height + height); 

  let speed = random(0.5, 3.0); 

  return {
    x: x,
    y: y,
    diameter: diameter,
    color: colorObj,
    speed: speed,
    exploded: false 
  };
}

function draw() {
  // 重繪背景，略帶透明度 (保留拖影效果)
  background(0, 180, 216, 50); 

  // --- 1. 處理氣球 (圓形) 的移動和繪製 ---
  for (let i = circles.length - 1; i >= 0; i--) {
    let circleObj = circles[i];

    if (!circleObj.exploded) {
      circleObj.y -= circleObj.speed;

      fill(circleObj.color); 
      circle(circleObj.x, circleObj.y, circleObj.diameter);
      
      drawInnerSquare(circleObj);
    }
    
    // 氣球飄到頂端或已爆炸，需要重置
    if (circleObj.y + circleObj.diameter / 2 < 0 || circleObj.exploded) {
      circles[i] = createCircle();
      circles[i].x = circleObj.x; 
      circles[i].y = height + circles[i].diameter / 2;
    }
  }
  
  // --- 2. 處理爆炸粒子效果 ---
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].update();
    explosions[i].show();
    
    if (explosions[i].isFinished()) {
      explosions.splice(i, 1);
    }
  }
  
  // --- 3. 繪製左上角和右上角文字 ---
  drawCornerTexts();
}

// 繪製圓內小方形的函式 (與之前保持一致)
function drawInnerSquare(circleObj) {
  const rectSize = circleObj.diameter / 6; 
  const radius = circleObj.diameter / 2;
  const offsetRadius = radius * 0.7; 

  const angle = PI / 4; 
  
  const squareCenterX = circleObj.x + offsetRadius * cos(angle);
  const squareCenterY = circleObj.y - offsetRadius * sin(angle); 

  const squareX_topLeft = squareCenterX - rectSize / 2;
  const squareY_topLeft = squareCenterY - rectSize / 2; 

  fill(255, 180); 
  rect(squareX_topLeft, squareY_topLeft, rectSize, rectSize);
}

// 繪製左上角和右上角文字的函式
function drawCornerTexts() {
    // 左上角文字設定
    fill('#7400b8'); // 顏色 7400b8
    textSize(32);    // 大小 32px
    textAlign(LEFT, TOP);
    text("414730480", 10, 10); // 座標 (10, 10) 位於左上角

    // 右上角分數設定
    fill(255); // 白色
    textSize(32);
    textAlign(RIGHT, TOP);
    text("Score: " + score, width - 10, 10); // 座標 (width - 10, 10) 位於右上角
}


// ====================================================================
// 滑鼠點擊事件：用於觸發氣球爆破和計分
// ====================================================================
function mousePressed() {
    // 檢查是否有氣球被點擊
    for (let i = circles.length - 1; i >= 0; i--) {
        let circleObj = circles[i];

        if (!circleObj.exploded) {
            // 計算滑鼠位置到圓心的距離
            let d = dist(mouseX, mouseY, circleObj.x, circleObj.y);
            
            // 如果滑鼠在圓形內部
            if (d < circleObj.diameter / 2) {
                // 觸發爆破
                circleObj.exploded = true; 
                
                // *** 分數 +1 ***
                score++;
                
                // 播放音效
                if (popSound) {
                    popSound.play();
                }
                
                // 創建爆炸群組
                explosions.push(new Explosion(circleObj.x, circleObj.y, circleObj.color));
                
                // 處理完畢，跳出迴圈
                return; 
            }
        }
    }
}


// 當視窗大小改變時，重新調整畫布大小並重繪內容
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  background('#00b4d8');
  
  circles = [];
  explosions = []; 
  for (let i = 0; i < NUM_CIRCLES; i++) {
    circles.push(createCircle());
  }
}