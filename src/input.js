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

        this.enabled = true;
        this.intervals = [];
        this.rotateDelayTimer = null;
        this.rotating = false;
        this.dropButtonIsPressed = false;

        this.init();
    }

    init() {
        document.addEventListener("mouseup", () => this.clearIntervals());
        document.getElementById("btn-left").addEventListener("mousedown", () => this.input(MOVE_LEFT_INPUT));
        document.getElementById("btn-right").addEventListener("mousedown", () => this.input(MOVE_RIGHT_INPUT));
        document.getElementById("btn-up").addEventListener("mousedown", () => this.input(ROTATE_INPUT));
        document.getElementById("btn-down").addEventListener("mousedown", () => {
            this.dropButtonIsPressed = true;
            this.input(DROP_INPUT);
        });
        document.getElementById("btn-down").addEventListener("mouseup", () => {
            this.dropButtonIsPressed = false;
        });

        const btn = p5.createButton("Pause");
        btn.mousePressed(() => this.input(PAUSE_INPUT));
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
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
        if (!this.game.turn || !this.enabled) {
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

        this.clearIntervals();
        this.intervals.push(setInterval(() => this.move(left), 150));
    }

    async startDrop() {
        this.drop();
        this.clearIntervals();

        await sleep(100);

        this.intervals.push(setInterval(() => this.drop(), 50));
    }

    startRotate() {
        this.rotate();
        this.clearIntervals();
        this.intervals.push(setInterval(() => this.rotate(), 200));
    }

    rotate() {
        if (this.game.currentShape.canRotate()) {
            client.rotate();

            clearTimeout(this.rotateDelayTimer);
            this.rotateDelayTimer = setTimeout(() => this.rotating = false, 300);
            this.rotating = true;
        }
    }

    move(left) {
        if (this.game.currentShape.canMove(left)) {
            client.move(left);
        }
    }

    drop() {
        if ((p5.keyIsPressed || this.dropButtonIsPressed) && this.game.currentShape.canDrop()) {
            client.drop();
        }
    }

    clearIntervals() {
        for (let i = 0; i < this.intervals.length; i++) {
            clearInterval(this.intervals[i]);
        }

        this.intervals = [];
    }
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));