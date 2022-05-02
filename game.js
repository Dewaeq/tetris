import { Grid } from "./grid.js";
import { SHAPES } from "./shape.js";
import { gridY, gridX, cellSize, gridOffset } from "./sketch.js";

export default class Game {
    constructor() {
        this.grid = new Grid();
        this.blocks = Array(gridY).fill(null).map(_ => Array(gridX).fill(null));
        this.currentShape = SHAPES.Random(this.grid);
        this.nextShape = SHAPES.Random(this.grid);

        this.timer = null;
        // Stop the shape from dropping for a moment after it got rotated
        this.rotateDelayTimer = null;
        this.rotating = false;

        this.score = 0;
        this.fallSpeed = 40;
    }

    start() {
        document.addEventListener("mouseup", () => this.clearInterval());
        document.getElementById("btn-left").addEventListener("mousedown", () => this.startMove(true));
        document.getElementById("btn-right").addEventListener("mousedown", () => this.startMove(false));
        document.getElementById("btn-up").addEventListener("mousedown", () => this.startRotate());
        document.getElementById("btn-down").addEventListener("mousedown", () => this.startDrop());

        const btn = p5.createButton("Pause");
        btn.mousePressed(() => this.pause());
    }

    pause() {
        if (p5.frameRate() === 0) {
            p5.frameRate(60);
        } else {
            p5.frameRate(0);
        }
    }

    startMove(left = false) {
        if (left)
            this.moveLeft();
        else
            this.moveRight();

        this.clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (left)
                this.moveLeft();
            else
                this.moveRight();
        }, 150);
    }

    moveLeft() {
        if (this.currentShape.canMove(true)) {
            this.currentShape.move(true);
        }
    }

    moveRight() {
        if (this.currentShape.canMove(false)) {
            this.currentShape.move(false);
        }
    }

    startDrop() {
        this.drop();
        this.clearInterval();
        this.timer = setInterval(() => {
            this.drop();
        }, 50);
    }

    drop() {
        if (this.currentShape.canDrop()) {
            this.currentShape.drop();
        }
    }

    startRotate() {
        this.rotate();
        this.clearInterval();
        this.timer = setInterval(() => {
            this.rotate();
        }, 150);
    }

    rotate() {
        if (this.currentShape.canRotate()) {
            this.currentShape.rotate();
            clearTimeout(this.rotateDelayTimer);
            this.rotateDelayTimer = setTimeout(() => this.rotating = false, 300);
            this.rotating = true;
        }
    }

    clearInterval() {
        clearInterval(this.timer);
        this.timer = null;
    }

    checkLines() {
        for (let y = 0; y < this.grid.matrix.length; y++) {
            if (this.grid.isLine(y)) {
                this.score += 100;

                if (this.score > 4000) {
                    this.fallSpeed = 6;
                } else if (this.score > 3000) {
                    this.fallSpeed = 10;
                } else if (this.score > 2500) {
                    this.fallSpeed = 12;
                } else if (this.score > 2000) {
                    this.fallSpeed = 15;
                } else if (this.score > 1500) {
                    this.fallSpeed = 18;
                } else if (this.score > 1000) {
                    this.fallSpeed = 20;
                } else if (this.score > 600) {
                    this.fallSpeed = 25;
                } else if (this.score > 300) {
                    this.fallSpeed = 30;
                }

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

    draw() {
        p5.background(220);
        p5.strokeWeight(.1);

        for (let i = 0; i <= gridX; i++) {
            p5.line(i * cellSize + gridOffset, 0, i * cellSize + gridOffset, gridY * cellSize);
        }

        for (let i = 0; i <= gridY; i++) {
            p5.line(0 + gridOffset, i * cellSize, gridX * cellSize + gridOffset, i * cellSize);
        }

        if (p5.frameCount % this.fallSpeed === 0) {
            if (this.currentShape.canDrop()) {
                if (!this.rotating) {
                    this.currentShape.drop();
                }
            } else {

                for (const block of this.currentShape.blocks) {
                    let blockPos = this.currentShape.blockPos(block);
                    this.blocks[blockPos.y][blockPos.x] = {
                        pos: blockPos, color: this.currentShape.color
                    };
                }

                this.checkLines();

                this.currentShape = this.nextShape;
                this.nextShape = SHAPES.Random(this.grid);

                if (!this.currentShape.canDrop()) {
                    p5.frameRate(0);
                    alert("Game Over");
                }
            }
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
        p5.text(`SCORE:`, 0, cellSize * 2);
        p5.text(`${this.score}`, 0, cellSize * 3);
    }

    drawNextShape() {
        p5.push();

        let offset = this.nextShape.width() * 2;

        p5.translate(cellSize * gridX + gridOffset * 1.5, 0);

        // p5.textAlign(p5.CENTER);
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
}