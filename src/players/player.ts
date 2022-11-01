import { Game } from "../game"

export abstract class Player {
    public users: User[] = []
    public game: Game

    constructor(game: Game) {
        this.game = game
    }

    abstract init(): void

    abstract startGame(): void

    abstract setNextShape(id: number): void

    abstract endTurn(): void

    abstract updateScore(value: number): void

    abstract updateNumLines(value: number): void

    abstract drop(): void

    abstract move(left: boolean): void

    abstract rotate(): void
}

export class User {
    constructor(
        public userName: string,
        public score: number,
        public id: string,
    ) { }
}