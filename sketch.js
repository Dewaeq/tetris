const gridX = 10;
const gridY = 20;
let gridOffset = 0;
let cellSize = 0;

let game;
let timer = null;

function setup() {
  SHAPES.Load();

  if (windowWidth > windowHeight) {
    cellSize = windowHeight * 0.75 / gridY;
    gridOffset = cellSize * 3;
  
    const canv = createCanvas(gridX * cellSize + gridOffset * 2, gridY * cellSize);
    canv.parent("#canvas");
  } else {
    cellSize = windowWidth * 0.6 / gridX;
    gridOffset = windowWidth * 0.4 / 2;
    const canv = createCanvas(windowWidth, gridY * cellSize);
    canv.parent("#canvas");
  }


  game = new Game();
  game.start();
}

function draw() {
  game.draw();
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    game.startRotate();
  } else if (keyCode === DOWN_ARROW) {
    game.startDrop();
  } else if (keyCode === LEFT_ARROW) {
    game.startMove(true);
  } else if (keyCode === RIGHT_ARROW) {
    game.startMove(false);
  } else if (key === " ") {
    game.pause();
  }
}

function keyReleased() {
  game.clearInterval();
}
