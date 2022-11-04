import { Player, User } from "./player"

export class SinglePlayer extends Player {
    override init(): void {
        this.users = [new User("name", 0, "")]
        this.game.turn = true
        this.game.start()
    }

    override updateScore(value: number): void {
        this.users[0].score += value
    }
}