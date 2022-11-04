import { Color, Vector } from "p5"
import { Grid } from "./grid"
import { Input } from "./input"
import { Shape, Shapes } from "./shape"
import { $, cellSize, gridOffset, gridX, gridY } from "./sketch"
import { Player } from "./players/player"
import { SinglePlayer } from "./players/single_player"
import { MultiPlayer } from "./players/multi_player"

export class Game {
    grid: Grid
    input: Input
    player: Player
    blocks: (Block | null)[][]
    currentShape: Shape
    nextShape: Shape

    isMultiPlayer: boolean = false
    turn: boolean = false
    started: boolean = false
    fallSpeed: number = FALL_SPEEDS[0]
    checkingGrid: boolean = false
    gameOver: boolean = false
    linesCleared: number = 0
    level: number = 1
    comboCount = 0

    popupTexts: string[] = []


    constructor(isMultiPlayer: boolean) {
        this.grid = new Grid()
        this.input = new Input(this)
        this.player = isMultiPlayer ? new MultiPlayer(this) : new SinglePlayer(this)
        this.isMultiPlayer = isMultiPlayer
        this.blocks = new Array(gridY).fill(null).map(_ => new Array(gridX).fill(null))

        this.currentShape = Shapes.Random(this.grid)
        this.nextShape = Shapes.Random(this.grid)

        this.player.init()
    }

    init() {
        this.grid.clear()
        this.blocks = new Array(gridY).fill(null).map(_ => new Array(gridX).fill(null))
        this.fallSpeed = FALL_SPEEDS[0]
        this.turn = false
        this.checkingGrid = false
        this.started = false
        this.gameOver = false
        this.level = 1
        this.linesCleared = 0
        this.comboCount = 0
        this.popupTexts = []

        this.grid.clear()
    }

    start() {
        this.started = true
    }

    stop() {
        console.log("current grid:")
        this.grid.print()

        this.turn = false
        this.gameOver = true
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

    updateScore(value: number) {
        if (!this.turn) return

        this.player.updateScore(value)
    }

    updateNumLines(value: number) {
        if (!this.turn) return

        this.player.updateNumLines(value)
    }

    setLevel() {
        this.level = 1 + Math.floor(this.linesCleared / 10)
        this.fallSpeed = FALL_SPEEDS[this.level - 1] ?? 1
    }

    checkLines() {
        let numLines = 0
        for (let y = 0; y < this.grid.matrix.length; y++) {
            if (this.grid.isLine(y)) {
                numLines++

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

        if (numLines === 0) {
            this.comboCount = 0
            return
        }

        let scoreIncrease = SCORE_INCREASE[numLines] * this.level
        const scoreText = SCORE_TEXTS[numLines]

        this.popupTexts = []
        this.popupTexts.push(`${scoreText} + ${scoreIncrease}`)

        if (this.comboCount > 0 && !this.isMultiPlayer) {
            const comboIncrease = 50 * this.comboCount * this.level
            this.popupTexts.push(`${this.comboCount} x Combo + ${comboIncrease}`)
            scoreIncrease += comboIncrease
        }

        this.comboCount++
        this.updateScore(scoreIncrease)
        this.updateNumLines(numLines)

        setTimeout(() => {
            this.popupTexts = []
        }, 1500);
    }

    update() {
        if (!this.turn) return
        if (!this.currentShape.canDrop()) return
        if ($.frameCount % this.fallSpeed !== 0) return

        this.player.drop()
    }

    draw() {
        if (this.gameOver) {
            this.drawGameOverScreen()
            return
        }

        if (!this.started && this.isMultiPlayer) {
            this.drawRoomScreen()
            return
        }

        if (this.turn) {
            this.update()
        }

        this.drawGrid()
        this.drawShape(this.currentShape)
        this.drawNextShape()
        this.drawScores()
        this.drawPopups()

        if (!this.turn) {
            $.push()

            $.textStyle($.BOLD)
            $.textSize(35)

            const width = $.textWidth("SPECTATING")
            $.text("SPECTATING", cellSize * 5 + gridOffset - width / 2, cellSize * 9)

            $.pop()
        }
    }

    drawGrid() {
        $.background(220)
        $.strokeWeight(.1)

        for (let i = 0; i <= gridX; i++) {
            $.line(i * cellSize + gridOffset, 0, i * cellSize + gridOffset, gridY * cellSize)
        }

        for (let i = 0; i <= gridY; i++) {
            $.line(0 + gridOffset, i * cellSize, gridX * cellSize + gridOffset, i * cellSize)
        }

        for (let y = 0; y < gridY; y++) {
            for (let x = 0; x < gridX; x++) {
                let block = this.blocks[y][x]
                if (block === null) {
                    continue
                }

                this.drawBlock(block)
            }
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
        $.fill("black")
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

    drawScores() {
        $.push()

        $.fill("black")
        $.textSize(20)

        $.text("LEVEL:", 0, cellSize)
        $.text(this.level, 0, cellSize * 2)

        $.text("LINES:", 0, cellSize * 3)
        $.text(this.linesCleared, 0, cellSize * 4)

        $.text("SCORE:", 0, cellSize * 5)

        if (this.isMultiPlayer) {
            let i = 0
            for (const user of this.player.users) {
                $.text(`${user.userName}:`, 0, cellSize * (6 + i * 2))
                $.text(`${user.score}`, 0, cellSize * (7 + i * 2))
                i++
            }
        } else {
            $.text(`${this.player.users[0].score}`, 0, cellSize * 6)
        }

        $.pop()
    }

    drawPopups() {
        $.push()

        $.textStyle($.BOLD)
        $.textSize(25)

        for (let i = 0; i < this.popupTexts.length; i++) {
            const text = this.popupTexts[i]
            const width = $.textWidth(text)
            $.text(text, cellSize * 5 + gridOffset - width / 2, cellSize * (i + 10))
        }

        $.pop()
    }

    drawBlock(block: Block) {
        $.fill(block.color)
        $.rect(block.pos.x * cellSize + gridOffset, block.pos.y * cellSize, cellSize)
    }

    drawGameOverScreen() {
        $.push()

        $.textStyle($.BOLD)
        $.textSize(35)

        const width = $.textWidth("GAME OVER")
        $.text("GAME OVER", cellSize * 5 + gridOffset - width / 2, cellSize * 9)

        $.pop()
    }

    drawRoomScreen() {
        $.background(255)

        $.push()
        $.fill("black")
        $.textStyle($.BOLD)
        $.textSize(28)
        $.text("Players:", cellSize * 2, cellSize * 2)

        $.textStyle($.NORMAL)
        $.textSize(24)

        for (let i = 0; i < this.player.users.length; i++) {
            const user = this.player.users[i]
            $.text(`${user.userName} ${user.score || ""}`, cellSize * 2, cellSize * (i + 3))
        }

        $.pop()
    }

    /**
     * This function gets called right after the current shape dropped or rotated.
     * It checks for cleared lines, updates the blocks matrix and calls setNextShape
     */
    checkGrid() {
        if (this.currentShape.canDrop()) return

        // Lock delay
        if (this.turn && !this.checkingGrid) {
            this.checkingGrid = true
            setTimeout(() => {
                this.finishTurn()
            }, 500)
        }
    }

    finishTurn() {
        if (!this.turn) return

        if (this.currentShape.canDrop()) {
            this.checkingGrid = false
        } else {
            this.player.setNextShape($.floor($.random(7)))
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
        } else {
            this.player.endTurn()
            this.checkingGrid = false
            this.input.enable()
        }
    }
}

class Block {
    constructor(
        public pos: Vector,
        public color: Color,
    ) { }
}

const SCORE_INCREASE = [100, 300, 500, 800]
const SCORE_TEXTS = ["Single", "Double", "Tripe", "Tetris"]
const FALL_SPEEDS = [60, 48, 37, 28, 21, 15, 11, 8, 6, 4, 3, 2, 1]