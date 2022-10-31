import { Color, Vector } from "p5"
import { Grid } from "./grid"
import { Input } from "./input"
import { Shape, Shapes } from "./shape"
import { $, cellSize, gridOffset, gridX, gridY } from "./sketch"
import { Client } from "./client"

export class Game {
    grid: Grid
    input: Input
    client: Client
    blocks: (Block | null)[][]
    currentShape: Shape
    nextShape: Shape

    turn: boolean = false
    started: boolean = false
    score: number = 0
    fallSpeed: number = 40
    checkingGrid: boolean = false

    constructor() {
        this.grid = new Grid()
        this.input = new Input(this)
        this.client = new Client(this)
        this.blocks = new Array(gridY).fill(null).map(_ => new Array(gridX).fill(null))

        this.currentShape = Shapes.Random(this.grid)
        this.nextShape = Shapes.Random(this.grid)

        this.client.init()
    }

    init() {
        this.grid.clear()
        this.blocks = new Array(gridY).fill(null).map(_ => new Array(gridX).fill(null))
        this.score = 0
        this.fallSpeed = 40
        this.turn = false
        this.checkingGrid = false
        this.started = false

        this.grid.clear()
    }

    start() {
        this.started = true
    }

    stop() {
        console.log("current grid:")
        this.grid.print()

        this.turn = false
        this.input.clearIntervals()
        this.input.disable()
        this.draw()

        alert("Game Over")
    }

    pause() {
        if ($.frameRate() === 0) {
            $.frameRate(60)
        } else {
            $.frameRate(0)
        }
    }

    updateScore() {
        if (!this.turn) return

        this.client.updateScore()
    }

    updateFallSpeed(maxScore: number) {
        if (maxScore > 4000) {
            this.fallSpeed = 6
        } else if (maxScore > 3000) {
            this.fallSpeed = 10
        } else if (maxScore > 2500) {
            this.fallSpeed = 12
        } else if (maxScore > 2000) {
            this.fallSpeed = 15
        } else if (maxScore > 1500) {
            this.fallSpeed = 18
        } else if (maxScore > 1000) {
            this.fallSpeed = 20
        } else if (maxScore > 600) {
            this.fallSpeed = 25
        } else if (maxScore > 300) {
            this.fallSpeed = 30
        }
    }

    checkLines() {
        for (let y = 0; y < this.grid.matrix.length; y++) {
            if (this.grid.isLine(y)) {
                this.updateScore()

                // Move each row above this one down
                for (let i = y - 1; i >= 0; i--) {
                    for (let x = 0; x < gridX; x++) {
                        if (this.blocks[i][x] !== null) {
                            this.blocks[i][x]!.pos.y += 1
                        }

                        this.blocks[i + 1][x] = this.blocks[i][x]
                        this.blocks[i][x] = null

                        this.grid.matrix[i + 1][x] = this.grid.matrix[i][x]
                        this.grid.matrix[i][x] = false
                    }
                }
            }
        }
    }

    update() {
        if ($.frameCount % this.fallSpeed === 0 && this.currentShape.canDrop()) {
            if (!this.input.rotating && this.turn) {
                this.client.drop()
            }
        }
    }

    draw() {
        if (!this.started) {
            $.background(255)

            $.push()
            $.fill("black")
            $.textStyle($.BOLD)
            $.textSize(28)
            $.text("Players:", cellSize * 2, cellSize * 2)

            $.textStyle($.NORMAL)
            $.textSize(24)

            for (let i = 0; i < this.client.users.length; i++) {
                const user = this.client.users[i]
                $.text(`${user.userName} ${user.score || ""}`, cellSize * 2, cellSize * (i + 3))
            }

            $.pop()
            return
        }

        if (this.turn) {
            this.update()
        }

        $.background(220)
        $.strokeWeight(.1)

        for (let i = 0; i <= gridX; i++) {
            $.line(i * cellSize + gridOffset, 0, i * cellSize + gridOffset, gridY * cellSize)
        }

        for (let i = 0; i <= gridY; i++) {
            $.line(0 + gridOffset, i * cellSize, gridX * cellSize + gridOffset, i * cellSize)
        }

        this.drawShape(this.currentShape)
        this.drawNextShape()

        for (let y = 0; y < gridY; y++) {
            for (let x = 0; x < gridX; x++) {
                let block = this.blocks[y][x]
                if (block === null) {
                    continue
                }

                this.drawBlock(block)
            }
        }

        $.fill("black")
        $.textSize(20)
        $.text("SCORE:", 0, cellSize)

        let i = 0
        for (const user of this.client.users) {
            $.text(`${user.userName}:`, 0, cellSize * (2 + i * 2))
            $.text(`${user.score}`, 0, cellSize * (3 + i * 2))
            i++
        }

        if (!this.turn) {
            $.push()

            $.textStyle($.BOLD)
            $.textSize(35)

            const width = $.textWidth("SPECTATING")
            $.text("SPECTATING", cellSize * 5 + gridOffset - width / 2, cellSize * 9)

            $.pop()
        }
    }

    drawShape(shape: Shape) {
        $.push()
        $.fill(shape.color)
        $.translate(cellSize * shape.position.x + gridOffset, cellSize * shape.position.y + 1 / this.fallSpeed)

        for (const block of shape.blocks) {
            $.rect(block.x * cellSize, block.y * cellSize, cellSize)
        }

        $.pop()
    }

    drawNextShape() {
        $.push()
        $.translate(cellSize * gridX + gridOffset * 1.5, 0)
        $.textAlign($.CENTER)
        $.textSize(20)
        $.text("NEXT", 0, cellSize)
        $.pop()

        $.push()
        const offset = this.nextShape.width() * 2
        $.translate(cellSize * gridX + gridOffset * ((offset + 1) / offset), cellSize * 1.5)
        $.fill(this.nextShape.color)

        for (const block of this.nextShape.blocks) {
            $.rect(block.x * cellSize * 0.7, block.y * cellSize * 0.7, cellSize * 0.7)
        }

        $.pop()
    }

    drawBlock(block: Block) {
        $.fill(block.color)
        $.rect(block.pos.x * cellSize + gridOffset, block.pos.y * cellSize, cellSize)
    }

    /**
     * This function gets called right after the current shape dropped or rotated.
     * It checks for cleared lines, updates the blocks matrix and calls setNextShape
     */
    checkGrid() {
        if (this.currentShape.canDrop()) return

        // Short timeout to give the player the chance to maneuver the block
        // when it's touching the ground
        if (this.turn && !this.checkingGrid) {
            this.checkingGrid = true
            setTimeout(() => {
                this.finishTurn()
            }, 600)
        }
    }

    finishTurn() {
        if (!this.turn) return

        if (this.currentShape.canDrop()) {
            this.checkingGrid = false
        } else {
            this.client.setNextShape($.floor($.random(7)))
        }
    }

    setNextShape(id: number) {
        this.input.clearIntervals()
        this.input.disable()

        for (const block of this.currentShape.blocks) {
            let blockPos = this.currentShape.blockPos(block)
            this.blocks[blockPos.y][blockPos.x] = new Block(blockPos, this.currentShape.color)
        }

        this.checkLines()

        this.currentShape = this.nextShape
        this.nextShape = Shapes.GetShape(id, this.grid)

        if (!this.currentShape.canDrop() && this.started) {
            this.stop()
        }

        this.client.setNextTurn()
        this.checkingGrid = false
        this.input.enable()
    }
}

class Block {
    constructor(
        public pos: Vector,
        public color: Color,
    ) { }
}