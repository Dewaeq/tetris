import { Element } from "p5"
import { Game } from "./game"
import { $ } from "./sketch"

export class Input {
    private game: Game
    private enabled: boolean
    private rotateDelayTimer: number | undefined
    private intervals: number[]
    public rotating: boolean
    private dropBtnIsPressed: boolean
    private startBtn: Element | undefined

    constructor(game: Game) {
        this.game = game
        this.enabled = true
        this.rotateDelayTimer = undefined
        this.intervals = []
        this.rotating = false
        this.dropBtnIsPressed = false

        this.init()
    }

    init(): void {
        document.addEventListener("mouseup", () => this.clearIntervals())
        document.getElementById("btn-left")?.addEventListener("mousedown", () => this.input(InputType.Left))
        document.getElementById("btn-right")?.addEventListener("mousedown", () => this.input(InputType.Right))
        document.getElementById("btn-up")?.addEventListener("mousedown", () => this.input(InputType.Rotate))
        document.getElementById("btn-down")?.addEventListener("mousedown", () => {
            this.dropBtnIsPressed = true
            this.input(InputType.Drop)
        })
        document.getElementById("btn-down")?.addEventListener("mouseup", () => {
            this.dropBtnIsPressed = false
        })

        const pauseBtn = $.createButton("Pause")
        pauseBtn.mousePressed(() => this.input(InputType.Pause))
    }

    addStartButton() {
        this.startBtn = $.createButton("Start")
        this.startBtn.mousePressed(() => this.game.player.startGame())
    }

    removeStartButton() {
        this.startBtn?.remove()
    }

    enable() {
        this.enabled = true
    }

    disable() {
        this.enabled = false
    }

    keyPressed(): void {
        if ($.keyCode === $.UP_ARROW) {
            this.input(InputType.Rotate)
        } else if ($.keyCode === $.DOWN_ARROW) {
            this.input(InputType.Drop)
        } else if ($.keyCode === $.LEFT_ARROW) {
            this.input(InputType.Left)
        } else if ($.keyCode === $.RIGHT_ARROW) {
            this.input(InputType.Right)
        } else if ($.key === " ") {
            this.input(InputType.Pause)
        }
    }

    input(type: InputType): void {
        if (!this.enabled || !this.game.turn) return

        switch (type) {
            case InputType.Drop:
                this.startDrop()
                break
            case InputType.Rotate:
                this.startRotate()
                break
            case InputType.Left:
                this.startMove(true)
                break
            case InputType.Right:
                this.startMove(false)
                break
            case InputType.Pause:
                this.game.pause()
                break
            default:
                console.error("Invalid input type: ", type)
                break
        }
    }

    async startDrop(): Promise<void> {
        this.drop()
        this.clearIntervals()
        await sleep(200)
        this.intervals.push(setInterval(() => this.drop(), 50))
    }

    drop() {
        if (($.keyIsPressed || this.dropBtnIsPressed) && this.game.currentShape.canDrop()) {
            this.game.player.drop()
            this.game.updateScore(1)
        }
    }

    startMove(left = false) {
        this.move(left)
        this.clearIntervals()
        this.intervals.push(setInterval(() => this.move(left), 150))
    }

    move(left: boolean) {
        if (this.game.currentShape.canMove(left)) {
            this.game.player.move(left)
        }
    }

    startRotate() {
        this.rotate()
        this.clearIntervals()
        this.intervals.push(setInterval(() => this.rotate(), 200))
    }

    rotate() {
        if (this.game.currentShape.canRotate()) {
            this.game.player.rotate()

            clearTimeout(this.rotateDelayTimer)

            this.rotateDelayTimer = setTimeout(() => this.rotating = false, 300)
            this.rotating = true
        }
    }

    clearIntervals(): void {
        for (let i = 0; i < this.intervals.length; i++) {
            clearInterval(this.intervals[i])
        }

        this.intervals = []
    }
}

enum InputType {
    Drop,
    Rotate,
    Left,
    Right,
    Pause
}

const sleep = (ms: number) => new Promise(_ => setTimeout(_, ms))