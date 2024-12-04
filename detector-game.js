// 游戏主逻辑
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 图片资源（稍后替换为Wix媒体库链接）
const detectorImg = new Image();
const coinImg = new Image();
const canImg = new Image();

detectorImg.src = 'detector.png';
coinImg.src = 'coin.png';
canImg.src = 'can.png';

// 游戏常量
const GROUND_Y = 250;
const GRAVITY = 1.0;
const JUMP_FORCE = -16;
const INITIAL_SPEED = 7;
const SPEED_INCREASE = 0.002;
const MIN_GAP = 150;
const MAX_EXTRA_GAP = 100;

// 游戏状态变量
let score = 0;
let lives = 3;
let gameOver = false;
let currentSpeed = INITIAL_SPEED;

// 探测器对象
const detector = {
    x: 50,
    y: GROUND_Y,
    width: 50,
    height: 80,
    velocityY: 0,
    isJumping: false,
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y - this.height);
        ctx.drawImage(detectorImg, 0, 0, this.width, this.height);
        ctx.restore();
    },
    jump() {
        if (!this.isJumping) {
            this.velocityY = JUMP_FORCE;
            this.isJumping = true;
        }
    },
    update() {
        this.velocityY += GRAVITY;
        this.y += this.velocityY;
        
        if (this.y > GROUND_Y) {
            this.y = GROUND_Y;
            this.velocityY = 0;
            this.isJumping = false;
        }
    }
};

// 物品类
class Item {
    constructor() {
        this.type = Math.random() < 0.5 ? 'coin' : 'can';
        this.width = 40;
        this.height = 40;
        
        let minX = canvas.width;
        if (items.length > 0) {
            const lastItem = items[items.length - 1];
            minX = Math.max(canvas.width, lastItem.x + MIN_GAP);
        }
        
        this.x = minX + Math.random() * MAX_EXTRA_GAP;
        
        if (Math.random() < 0.5) {
            this.y = GROUND_Y - this.height - 5;
        } else {
            this.y = GROUND_Y - 120;
        }
    }
    
    draw() {
        ctx.save();
        if (this.type === 'coin') {
            ctx.drawImage(coinImg, this.x, this.y, this.width, this.height);
        } else {
            ctx.drawImage(canImg, this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }
    
    update() {
        this.x -= currentSpeed;
    }
}

let items = [];
let spawnTimer = 0;
let minSpawnTime = 100;
let currentSpawnTime = minSpawnTime;

function resetSpawnTimer() {
    currentSpawnTime = minSpawnTime * (0.5 + Math.random());
    spawnTimer = 0;
}

function checkCollision(detector, item) {
    const collisionMargin = 10;
    return !(detector.x + detector.width - collisionMargin < item.x || 
            detector.x + collisionMargin > item.x + item.width ||
            detector.y - detector.height + collisionMargin > item.y ||
            detector.y - collisionMargin < item.y - item.height);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    
    if (!gameOver) {
        detector.update();
        currentSpeed += SPEED_INCREASE;
        
        spawnTimer++;
        if (spawnTimer >= currentSpawnTime) {
            items.push(new Item());
            resetSpawnTimer();
        }
        
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            item.update();
            item.draw();
            
            if (checkCollision(detector, item)) {
                if (item.type === 'coin') {
                    score++;
                } else {
                    lives--;
                    if (lives <= 0) {
                        gameOver = true;
                    }
                }
                items.splice(i, 1);
                continue;
            }
            
            if (item.x + item.width < 0) {
                items.splice(i, 1);
            }
        }
    }
    
    detector.draw();
    
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
        
        ctx.font = '24px Arial';
        ctx.fillText('Press Space to restart', canvas.width/2, canvas.height/2 + 50);
    }
    
    requestAnimationFrame(gameLoop);
}

// 图片加载完成后启动游戏
Promise.all([
    new Promise(resolve => detectorImg.onload = resolve),
    new Promise(resolve => coinImg.onload = resolve),
    new Promise(resolve => canImg.onload = resolve)
]).then(() => {
    gameLoop();
});

// 键盘事件
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        if (gameOver) {
            gameOver = false;
            score = 0;
            lives = 3;
            currentSpeed = INITIAL_SPEED;
            items = [];
            detector.y = GROUND_Y;
            detector.velocityY = 0;
            detector.isJumping = false;
        } else {
            detector.jump();
        }
    }
});
