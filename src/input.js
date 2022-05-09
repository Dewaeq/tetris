import Game from "./game.js";
import * as client from "./client.js";

const DROP_INPUT = 0;
const ROTATE_INPUT = 1;
const MOVE_LEFT_INPUT = 2;
const MOVE_RIGHT_INPUT = 3;
const PAUSE_INPUT = 4;

export class Input {
    /**
     * @param {Game} game 
     */
    constructor(game) {
        /** @type {Game} */
        this.game = game;

        this.timer = null;
        this.rotateDelayTimer = null;
        this.rotating = false;

        this.init();
    }

    init() {
        document.addEventListener("mouseup", () => this.clearInterval());
        document.getElementById("btn-left").addEventListener("mousedown", () => this.input(MOVE_LEFT_INPUT));
        document.getElementById("btn-right").addEventListener("mousedown", () => this.input(MOVE_RIGHT_INPUT));
        document.getElementById("btn-up").addEventListener("mousedown", () => this.input(ROTATE_INPUT));
        document.getElementById("btn-down").addEventListener("mousedown", () => this.input(DROP_INPUT));

        const btn = p5.createButton("Pause");
        btn.mousePressed(() => this.input(PAUSE_INPUT));
    }

    keyPressed() {
        if (p5.keyCode === p5.UP_ARROW) {
            this.input(ROTATE_INPUT);
        } else if (p5.keyCode === p5.DOWN_ARROW) {
            this.input(DROP_INPUT);
        } else if (p5.keyCode === p5.LEFT_ARROW) {
            this.input(MOVE_LEFT_INPUT);
        } else if (p5.keyCode === p5.RIGHT_ARROW) {
            this.input(MOVE_RIGHT_INPUT);
        } else if (p5.key === " ") {
            this.input(PAUSE_INPUT);
        }
    }

    input(type) {
        if (!this.game.turn) {
            return;
        }

        switch (type) {
            case DROP_INPUT:
                this.startDrop();
                break;
            case ROTATE_INPUT:
                this.startRotate();
                break;
            case MOVE_LEFT_INPUT:
                this.startMove(true);
                break;
            case MOVE_RIGHT_INPUT:
                this.startMove(false);
                break;
            case PAUSE_INPUT:
                this.game.pause();
                break;
            default:
                console.error("Invalid input type: ", input);
                break;
        }
    }

    startMove(left = false) {
        this.move(left);

        this.clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.move(left);
        }, 150);
    }

    async startDrop() {
        this.drop();
        this.clearInterval();
        await sleep(100);
        this.timer = setInterval(() => {
            if (p5.keyIsPressed || p5.mouseIsPressed) {
                this.drop();
            }
        }, 50);
    }

    startRotate() {
        this.rotate();
        this.clearInterval();
        this.timer = setInterval(() => {
            this.rotate();
        }, 200);
    }

    rotate() {
        if (this.game.currentShape.canRotate()) {
            // this.game.currentShape.rotate();
            client.rotate();

            clearTimeout(this.rotateDelayTimer);
            this.rotateDelayTimer = setTimeout(() => this.rotating = false, 300);
            this.rotating = true;
        }
    }

    move(left) {
        if (this.game.currentShape.canMove(left)) {
            // this.game.currentShape.move(left);
            client.move(left);
        }
    }

    drop() {
        if (this.game.currentShape.canDrop()) {
            // this.game.currentShape.drop();
            client.drop();
        }
    }

    clearInterval() {
        clearInterval(this.timer);
        this.timer = null;
    }
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));