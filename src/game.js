import * as client from "./client.js";
import { Grid } from "./grid.js";
import { Input } from "./input.js";
import { Shape, SHAPES } from "./shape.js";
import { gridY, gridX, cellSize, gridOffset } from "./sketch.js";

export default class Game {
    constructor() {
        this.grid = new Grid();
        this.input = new Input(this);
        this.currentShape = SHAPES.Random(this.grid);
        this.nextShape = SHAPES.Random(this.grid);
        this.init();
    }

    init() {
        this.grid.clear();
        this.blocks = Array(gridY).fill(null).map(_ => Array(gridX).fill(null));
        this.currentShape = null;
        this.nextShape = null;

        this.score = 0;
        this.fallSpeed = 40;
        this.turn = false;
        this.started = false;

        this.grid.clear();
        window.game = this;
    }

    start() {
        this.started = true;
    }

    stop() {
        this.started = false;

        console.log("current grid:");
        this.grid.print();

        p5.frameRate(0);
        alert("Game Over");
    }

    pause() {
        if (p5.frameRate() === 0) {
            p5.frameRate(60);
        } else {
            p5.frameRate(0);
        }
    }

    updateScore() {
        if (!this.turn) return;

        client.updateScore(this.score + 100);

    }

    updateFallSpeed(maxScore) {
        if (maxScore > 4000) {
            this.fallSpeed = 6;
        } else if (maxScore > 3000) {
            this.fallSpeed = 10;
        } else if (maxScore > 2500) {
            this.fallSpeed = 12;
        } else if (maxScore > 2000) {
            this.fallSpeed = 15;
        } else if (maxScore > 1500) {
            this.fallSpeed = 18;
        } else if (maxScore > 1000) {
            this.fallSpeed = 20;
        } else if (maxScore > 600) {
            this.fallSpeed = 25;
        } else if (maxScore > 300) {
            this.fallSpeed = 30;
        }
    }

    checkLines() {
        for (let y = 0; y < this.grid.matrix.length; y++) {
            if (this.grid.isLine(y)) {
                this.updateScore();

                // Move each row above this one down
                for (let i = y - 1; i >= 0; i--) {
                    for (let x = 0; x < gridX; x++) {
                        if (this.blocks[i][x] !== null) {
                            this.blocks[i][x].pos.y += 1;
                        }

                        this.blocks[i + 1][x] = this.blocks[i][x];
                        this.blocks[i][x] = null;

                        this.grid.matrix[i + 1][x] = this.grid.matrix[i][x];
                        this.grid.matrix[i][x] = false;
                    }
                }
            }
        }
    }

    update() {
        if (p5.frameCount % this.fallSpeed === 0) {
            if (this.currentShape.canDrop()) {
                if (!this.input.rotating && this.turn) {
                    client.drop();
                    // this.currentShape.drop();
                }
            } else {
                // this.checkGrid();
            }
        }
    }

    /**
     * This function gets called right after the current shape dropped.
     * It checks for cleared lines, updates the blocks matrix and calls
     * setNextShape on client
     * @returns {void}
     */
    checkGrid() {
        if (this.currentShape.canDrop()) return;

        this.input.clearInterval();

        // if (this.turn) {
        // setTimeout(() => {
            this.finishTurn();
        // }, 200);
        /* setTimeout(() => {
            client.setNextShape(p5.floor(p5.random(7)));
        }, 2000); */
        // }
    }

    finishTurn() {
        // if (!this.turn) return;

        console.log("adding blocks");

        for (const block of this.currentShape.blocks) {
            let blockPos = this.currentShape.blockPos(block);
            this.blocks[blockPos.y][blockPos.x] = {
                pos: blockPos,
                color: this.currentShape.color,
            };
        }

        this.checkLines();

        if (this.turn) {
            console.log("ending turn");
            client.setNextShape(p5.floor(p5.random(7)));
        }
    }

    setNextShape(nextShapeId) {
        this.currentShape = this.nextShape;
        this.nextShape = new Shape(SHAPES.ALL[nextShapeId], this.grid);

        if (!this.currentShape.canDrop() && this.started) {
            this.stop();
        }
    }

    draw() {
        if (!this.started) return;

        if (this.turn) {
            this.update();
        }

        p5.background(220);
        p5.strokeWeight(.1);

        for (let i = 0; i <= gridX; i++) {
            p5.line(i * cellSize + gridOffset, 0, i * cellSize + gridOffset, gridY * cellSize);
        }

        for (let i = 0; i <= gridY; i++) {
            p5.line(0 + gridOffset, i * cellSize, gridX * cellSize + gridOffset, i * cellSize);
        }

        this.drawShape(this.currentShape);
        this.drawNextShape();

        for (let y = 0; y < gridY; y++) {
            for (let x = 0; x < gridX; x++) {
                let block = this.blocks[y][x];
                if (block === null) {
                    continue;
                }

                this.drawBlock(block);
            }
        }

        p5.fill("black");
        p5.textSize(20);
        p5.text(`FPS: ${p5.floor(p5.frameRate())}`, 0, cellSize);

        let i = 0;
        for (const key in client.allUsers) {
            const user = client.allUsers[key];
            p5.text(`${user.userName}:`, 0, cellSize * (2 + i * 2));
            p5.text(`${user.score}`, 0, cellSize * (3 + i * 2));
            i++;
        }
    }

    drawNextShape() {
        p5.push();

        let offset = this.nextShape.width() * 2;

        p5.translate(cellSize * gridX + gridOffset * 1.5, 0);

        p5.textAlign(p5.CENTER);
        p5.textSize(20);
        p5.text("NEXT", 0, cellSize);

        p5.pop();

        p5.push();

        p5.translate(cellSize * gridX + gridOffset * ((offset + 1) / offset), cellSize * 0.5);

        p5.translate(0, cellSize);
        p5.fill(this.nextShape.color);

        for (const block of this.nextShape.blocks) {
            p5.rect(block.x * cellSize * 0.7, block.y * cellSize * 0.7, cellSize * 0.7);
        }

        p5.pop();
    }

    drawShape(shape) {
        p5.push();
        p5.fill(shape.color);
        p5.translate(cellSize * shape.position.x + gridOffset, cellSize * shape.position.y + 1 / this.fallSpeed);

        for (const block of shape.blocks) {
            p5.rect(block.x * cellSize, block.y * cellSize, cellSize);
        }

        // fill(255);
        // circle((shape.rotationPoint.x + 0.5) * cellSize, (shape.rotationPoint.y + 0.5) * cellSize, cellSize / 3);
        p5.pop();
    }

    drawBlock(block) {
        p5.fill(block.color);
        p5.rect(block.pos.x * cellSize + gridOffset, block.pos.y * cellSize, cellSize);
    }

    printBlocks() {
        for (let y = 0; y < this.blocks.length; y++) {
            let str = "";
            for (let x = 0; x < this.blocks[y].length; x++) {
                if (this.blocks[y][x]) {
                    str += " X ";
                } else {
                    str += " . ";
                }
            }
            console.log(str);
        }
    }
}