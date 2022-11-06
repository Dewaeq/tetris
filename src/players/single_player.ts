import { Shapes } from "../shape";
import { Player, User } from "./player"

export class SinglePlayer extends Player {
    override init(): void {
        this.users = [new User("name", 0, "")]
        this.game.turn = true
        this.game.start()
    }

    override setNextShape(): void {
        const nextBag = this.game.bagIndex === 6 ? Shapes.GetBag() : undefined;
        this.game.setNextShape(nextBag)
    }

    override updateScore(value: number): void {
        this.users[0].score += value
    }
}