const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageNames = ['bird', 'cactus', 'dino'];

// グローバルな game オブジェクト
const game = {
    counter: 0,
    backGrounds:[],
    bgm1: new Audio('bgm/fieldSong.mp3'),
    bgm2: new Audio('bgm/jump.mp3'),
    enemys: [],
    image: {},
    score: 0,
    state: 'loading',
    timer: null,
    enemyCountdown : 0,
    enemySpeed : -10,
    difficulty :'normal' 
};
game.bgm1.loop = true;

// 複数画像読み込み
let imageLoadCounter = 0;
for (const imageName of imageNames) {
    const imagePath = `image/${imageName}.png`;
    game.image[imageName] = new Image();
    game.image[imageName].src = imagePath;
    game.image[imageName].onload = () => {
        imageLoadCounter += 1;
        if (imageLoadCounter === imageNames.length) {
            console.log('画像のロードが完了しました。');
            init();
        }
    }
}

function init() {
    game.counter    = 0;
    game.enemys     = [];
    game.enemyCountdown = 0;
    game.score      = 0;
    game.state = 'init';
    game.enemySpeed = -10;
    if (!game.difficulty) {
        // 難易度が選ばれてないなら何もしない（ボタン表示中）
        return;
    }

    //画面クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //恐竜の表示
    createDino();
    drawDino();
    //背景の描画
    createBackGround();
    drawBackGround();
    //文章の表示
    ctx.fillStyle = 'black';
    ctx.font = 'bold 60px Poppins';
    ctx.fillText(`Please Select Difficulty `,60,70);
    ctx.fillText(`Press Space key`,60,150);
    ctx.fillText(`to start.`,150,230);   
}

function start(){
    game.state = 'gaming';
    game.bgm1.play();
    game.timer = setInterval(ticker,30);
}

function ticker() {
    let baseSpeed = 10;
    let speedIncreaseRate = 200;

    switch (game.difficulty){
      case 'easy' : 
          speedIncreaseRate = 300; //ゆっくり速くなる
          break;
      case 'normal':
          speedIncreaseRate = 200;
          break;
      case 'hard':
          speedIncreaseRate = 100; 
          break;
    }
//敵の速度をスコアに応じてあげていく
game.enemySpeed = baseSpeed + Math.floor(game.score / speedIncreaseRate);

    // 画面クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //背景の作成
    if (game.counter % 10 === 0) {
        createBackGround();
      }

    // 敵キャラクタの生成
    createEnemys();
    
    // キャクターの移動
    moveDino(); // 恐竜の移動
    moveEnemys(); // 敵キャラクターの移動
    moveBackGround();

    //描画
    drawDino();// 恐竜の描画
    drawEnemys(); // 敵キャラクターの描画
    drawScore(); // スコアの描画
    drawBackGround();

    // あたり判定
    hitCheck();

    // カウンターの更新
    game.score += 1;
    game.counter = (game.counter + 1) % 1000000;
    game.enemyCountdown -= 1;
}

function createDino() {
    game.dino = {
        x: game.image.dino.width / 2,
        y: canvas.height - game.image.dino.height / 2,
        moveY: 0,
        width: game.image.dino.width,
        height: game.image.dino.height,
        image: game.image.dino
    }
}

function createCactus(createX) {
    game.enemys.push({
        x: createX,
        y: canvas.height - game.image.cactus.height / 2,
        width: game.image.cactus.width,
        height: game.image.cactus.height,
        moveX: -game.enemySpeed,
        image: game.image.cactus
    });
}

function createBird() {
    const birdY = Math.random() * (300 - game.image.bird.height) + 150;
    game.enemys.push({
        x: canvas.width + game.image.bird.width / 2,
        y: birdY,
        width: game.image.bird.width,
        height: game.image.bird.height,
        moveX: -game.enemySpeed * 1.5,
        image: game.image.bird
    });
}

function createEnemys(){
    if(game.enemyCountdown === 0){
        game.enemyCountdown = 60 - Math.floor(game.score / 100);
        if(game.enemyCountdown <= 30) game.enemyCountdown = 30;
        switch(Math.floor(Math.random()*3)){
            case 0:
                createCactus(canvas.width + game.image.cactus.width /2);
                break;
            case 1:
                createCactus(canvas.width + game.image.cactus.width / 2);
                createCactus(canvas.width + game.image.cactus.width * 3/2);
                break;
            case 2:
                createBird();
                break;
        }
    }
}

function createBackGround() {
    game.backGrounds = [];
    for (let x = 0; x <= canvas.width; x += 200) {
      game.backGrounds.push({
        x: x,
        y: canvas.height,
        width: 200,
        moveX: -20,
      });
    }
  }
 
  function moveBackGround() {
    for (const backGround of game.backGrounds) {
        backGround.x += backGround.moveX;
    }
  }

function moveDino() {
    game.dino.y += game.dino.moveY;
    if (game.dino.y >= canvas.height - game.dino.height / 2) {
        game.dino.y = canvas.height - game.dino.height / 2;
        game.dino.moveY = 0;
    } else {
        game.dino.moveY += 3;
    }
}

function moveEnemys() {
    for (const enemy of game.enemys) {
        enemy.x += enemy.moveX;
    }
    // 画面の外に出たキャラクターを配列から削除
    game.enemys = game.enemys.filter(enemy => enemy.x > -enemy.width);
}

function drawDino() {
    ctx.drawImage(game.image.dino, game.dino.x - game.dino.width / 2, game.dino.y - game.dino.height / 2);
}

function drawEnemys() {
    for (const enemy of game.enemys) {
        ctx.drawImage(enemy.image, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2);
    }
}

function drawBackGround() {
    ctx.fillStyle = 'sienna';
    for (const backGround of game.backGrounds) {
      ctx.fillRect(backGround.x, backGround.y - 5, backGround.width, 5);
      ctx.fillRect(backGround.x + 20, backGround.y - 10, backGround.width - 40, 5);
      ctx.fillRect(backGround.x + 50, backGround.y - 15, backGround.width - 100, 5);
    }
  }

function drawScore() {
    ctx.font = '24px serif';
    ctx.fillStyle = 'black';
    ctx.fillText(`score: ${game.score}`, 0, 30);
    ctx.fillText(`difficulty: ${game.difficulty}`, 0, 60);
}

function hitCheck() {
    for (const enemy of game.enemys) {
        if (
            Math.abs(game.dino.x - enemy.x) < game.dino.width * 0.8 / 2 + enemy.width * 0.9 / 2 &&
            Math.abs(game.dino.y - enemy.y) < game.dino.height * 0.5 / 2 + enemy.height * 0.9 / 2
        ) {
            game.state = 'gameover';
            game.bgm1.pause();
            ctx.fillStyle = 'black';
            ctx.font = 'bold 100px serif';
            ctx.fillText(`Game Over!`, 150, 200);
            clearInterval(game.timer);
        }
    }
}

document.onkeydown = function(e) {
    if(e.code === 'Space' && game.state === 'init'){
        start();
    }
    if(e.key === ' ' && game.dino.moveY === 0) {
        game.dino.moveY = -41;
        game.bgm2.play();
    }
    if(e.key === 'Enter' && game.state === 'gameover') {
        init();
    }
};

function setDifficulty(level) {
    game.difficulty = level;
    document.getElementById('difficultyButtons').style.display = 'none'; // ボタン非表示
    init(); // ゲーム初期化
}