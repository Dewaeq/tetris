import Game from "./game.js";
import { SHAPES } from "./shape.js";

export const gridX = 10;
export const gridY = 20;
export let gridOffset = 0;
export let cellSize = 0;

let game;

console.log("fuck");

new p5((p5) => {

  window.p5 = p5;

  p5.setup = function () {
    SHAPES.Load();

    if (p5.windowWidth > p5.windowHeight) {
      cellSize = p5.windowHeight * 0.75 / gridY;
      gridOffset = cellSize * 3;

      const canv = p5.createCanvas(gridX * cellSize + gridOffset * 2, gridY * cellSize);
      canv.parent("#canvas");
    } else {
      cellSize = p5.windowWidth * 0.6 / gridX;
      gridOffset = p5.windowWidth * 0.4 / 2;
      const canv = p5.createCanvas(p5.windowWidth, gridY * cellSize);
      canv.parent("#canvas");
    }

    game = new Game();
    game.start();
  }

  p5.draw = function () {
    game.draw();
  }

  p5.keyPressed = function () {
    if (p5.keyCode === p5.UP_ARROW) {
      game.startRotate();
    } else if (p5.keyCode === p5.DOWN_ARROW) {
      game.startDrop();
    } else if (p5.keyCode === p5.LEFT_ARROW) {
      game.startMove(true);
    } else if (p5.keyCode === p5.RIGHT_ARROW) {
      game.startMove(false);
    } else if (p5.key === " ") {
      game.pause();
    }
  }

  p5.keyReleased = function () {
    game.clearInterval();
  }
});


