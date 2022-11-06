import { Game } from "../game"

export abstract class Player {
    public users: User[] = []
    public game: Game

    constructor(game: Game) {
        this.game = game
    }

    abstract init(): void

    abstract updateScore(value: number): void

    abstract setNextShape(): void

    startGame(): void {}

    endTurn(): void {}

    updateNumLines(value: number): void {
        this.game.linesCleared += value
        this.game.setLevel()
    }

    drop(): void {
        this.game.currentShape.drop()
        this.game.checkGrid()
    }

    move(left: boolean): void {
        this.game.currentShape.move(left)
        this.game.checkGrid()
    }

    rotate(): void {
        this.game.currentShape.rotate()
        this.game.checkGrid()
    }
}

export class User {
    constructor(
        public userName: string,
        public score: number,
        public id: string,
    ) { }
}