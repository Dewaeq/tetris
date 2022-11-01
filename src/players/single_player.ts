import { Player, User } from "./player";

export class SinglePlayer extends Player {

    init(): void {
        this.users = [new User("name", 0, "")]
        this.game.turn = true
        this.game.start()
    }

    startGame(): void {
        throw new Error("Method not implemented.");
    }

    setNextShape(id: number): void {
        this.game.setNextShape(id)
    }

    endTurn(): void {
        // throw new Error("Method not implemented.");
    }

    updateScore(value: number): void {
        this.users[0].score += value
    }

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