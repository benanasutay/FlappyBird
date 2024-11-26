const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bird = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    radius: canvas.height / 30,
    velocity: 0,
    gravity: 0.6,
    jump: -10
};

const pipes = [];
const pipeWidth = canvas.width / 10;
const pipeGap = canvas.height / 3; // Borular arasındaki boşluk

let score = 0;
let bestScore = 0;
let gameOver = false;
let gameStarted = false;

// Yeni global değişkenler
let timeOfDay = 0; // 0: Gündüz, 1: Gün batımı, 2: Gece
let backgroundGradient;

// Arka plan renklerini tanımlayalım
const backgroundColors = [
    { start: '#87CEEB', end: '#E0F6FF' }, // Gündüz
    { start: '#FF7F50', end: '#FFB6C1' }, // Gün batımı
    { start: '#191970', end: '#000080' }  // Gece
];

// Oyun başlangıcında arka planı ayarlayalım
function initBackground() {
    backgroundGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    updateBackground();
}

// Arka planı güncelleme fonksiyonu
function updateBackground() {
    backgroundGradient = ctx.createLinearGradient(0, 0, 0, canvas.height); // Her seferinde yeniden oluştur
    backgroundGradient.addColorStop(0, backgroundColors[timeOfDay].start);
    backgroundGradient.addColorStop(1, backgroundColors[timeOfDay].end);
}

// Zamanı ilerletme fonksiyonu
function advanceTimeOfDay() {
    timeOfDay = (timeOfDay + 1) % 3;
    updateBackground();
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);

    // Gölge
    ctx.beginPath();
    ctx.ellipse(5, 5, bird.radius * 1.2, bird.radius * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Gövde
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.radius, bird.radius * 0.8, 0, 0, Math.PI * 2);
    let gradient = ctx.createRadialGradient(0, -bird.radius * 0.3, 0, 0, 0, bird.radius);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(1, '#FFA500');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Kanatlar
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(-bird.radius * 0.5, 0);
    ctx.quadraticCurveTo(-bird.radius * 1.2, -bird.radius * 0.5, -bird.radius * 0.8, -bird.radius * 0.8);
    ctx.quadraticCurveTo(-bird.radius * 0.5, -bird.radius * 0.5, -bird.radius * 0.5, 0);
    ctx.fill();

    // Göz
    ctx.beginPath();
    ctx.arc(bird.radius * 0.4, -bird.radius * 0.2, bird.radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bird.radius * 0.5, -bird.radius * 0.2, bird.radius * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();

    // Gaga
    ctx.beginPath();
    ctx.moveTo(bird.radius * 0.8, 0);
    ctx.lineTo(bird.radius * 1.2, -bird.radius * 0.1);
    ctx.lineTo(bird.radius * 1.2, bird.radius * 0.1);
    ctx.closePath();
    ctx.fillStyle = '#FF6347';
    ctx.fill();

    ctx.restore();
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Borunun ana gövdesi
        const pipeX = pipe.x;
        const pipeYTop = pipe.top;
        const pipeYBottom = pipe.bottom;
        
        // 3D boru çizimi için renk geçişleri
        const pipeMainColor = '#4CAF50'; // Borunun ana rengi
        const pipeShadowColor = '#388E3C'; // Borunun gölge rengi
        const pipeLightColor = '#66BB6A'; // Borunun ışık aldığı kenar

        // Üst boru - gölge efekti için
        ctx.fillStyle = pipeMainColor;
        ctx.fillRect(pipeX, 0, pipeWidth, pipeYTop); // Ana gövde
        ctx.fillStyle = pipeShadowColor;
        ctx.fillRect(pipeX + pipeWidth * 0.8, 0, pipeWidth * 0.2, pipeYTop); // Gölge
        ctx.fillStyle = pipeLightColor;
        ctx.fillRect(pipeX, 0, pipeWidth * 0.2, pipeYTop); // Işık

        // Alt boru - gölge efekti için
        ctx.fillStyle = pipeMainColor;
        ctx.fillRect(pipeX, pipeYBottom, pipeWidth, canvas.height - pipeYBottom); // Ana gövde
        ctx.fillStyle = pipeShadowColor;
        ctx.fillRect(pipeX + pipeWidth * 0.8, pipeYBottom, pipeWidth * 0.2, canvas.height - pipeYBottom); // Gölge
        ctx.fillStyle = pipeLightColor;
        ctx.fillRect(pipeX, pipeYBottom, pipeWidth * 0.2, canvas.height - pipeYBottom); // Işık
    });
}


function drawScore() {
    document.getElementById('score').textContent = `Skor: ${score}`;
    document.getElementById('bestScore').textContent = `En İyi: ${bestScore}`;
}

function update() {
    if (gameStarted && !gameOver) {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - canvas.width / 2) {
            const pipeY = Math.random() * (canvas.height - pipeGap - 200) + 100;
            pipes.push({
                x: canvas.width,
                top: pipeY,
                bottom: pipeY + pipeGap
            });
        }

        pipes.forEach(pipe => {
            pipe.x -= 5;

            if (
                bird.x + bird.radius > pipe.x &&
                bird.x - bird.radius < pipe.x + pipeWidth &&
                (bird.y - bird.radius < pipe.top || bird.y + bird.radius > pipe.bottom)
            ) {
                gameOver = true;
            }

            if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
                score++;
                pipe.passed = true;
            }
        });

        if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
            gameOver = true;
        }

        if (pipes[0] && pipes[0].x < -pipeWidth) {
            pipes.shift();
        }

        // Her 50 puanda bir zamanı ilerlet
        if (score > 0 && score % 50 === 0) {
            advanceTimeOfDay();
        }
    }

    // Arka planı çiz
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBird();
    drawPipes();
    drawScore();

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Oyun Bitti', canvas.width / 2, canvas.height / 2 - 50);
        
        if (score > bestScore) {
            bestScore = score;
        }
        
        document.getElementById('startButton').style.display = 'block';
    }

    requestAnimationFrame(update);
}

function jump() {
    if (!gameStarted) {
        gameStarted = true;
    }
    if (!gameOver) {
        bird.velocity = bird.jump;
    }
}

function restartGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    gameOver = false;
    gameStarted = false;
    timeOfDay = 0; // Zamanı sıfırla
    updateBackground(); // Arka planı güncelle
    document.getElementById('startButton').style.display = 'none';
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

document.getElementById('startButton').addEventListener('click', restartGame);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    bird.radius = canvas.height / 30;
    bird.x = canvas.width / 4;
    bird.y = canvas.height / 2;
    updateBackground(); // Canvas boyutu değiştiğinde arka planı güncelle
});

// Oyun başlangıcında arka planı ayarla
initBackground();
update();
