import { io, Socket } from "socket.io-client"
import { Game } from "./game"
import { Shapes } from "./shape"

export class Client {
    users: User[] = []
    private game: Game
    private socket: Socket = io("https://tetris-server-dewaeq.herokuapp.com/")
    private userName: string = ""
    private roomCode: number = 0
    private isHost: boolean = false
    private currentPlayer: number = -1

    constructor(game: Game) {
        this.game = game
    }

    init() {
        while (this.userName === "") {
            const promptInput = prompt('Username:')
            if (promptInput) {
                this.userName = promptInput
            }
        }
        while (this.roomCode === 0) {
            const promptInput = parseInt(prompt('4-digit room code:')!)
            if (promptInput > 0 && promptInput < 10000) {
                this.roomCode = promptInput
            }
        }

        this.socket.emit("joinRoom", { code: this.roomCode, userName: this.userName })

        this.socket.on("joined", (data) => this.onJoin(data))
        this.socket.on("onUserJoined", (data) => this.onUserJoined(data))
        this.socket.on("start", (data) => this.onStart(data))
        this.socket.on("update", (data) => this.onUpdate(data))
        this.socket.on("leave", (_) => this.onLeave())
    }

    private onJoin(data: any) {
        this.isHost = data.isHost
        this.users = data.users

        if (this.isHost) {
            console.log("adding startbutton")
            this.game.input.addStartButton()
        }

        console.log("succesfully joined room", data.code)
    }

    private onUserJoined(user: any) {
        this.users.push(user)
    }

    private onStart(data: any) {
        this.users = []
        for (const user of data.allUsers) {
            this.users.push(user)
        }

        const ourTurn = data.starterId === this.socket.id
        this.currentPlayer = this.users.findIndex(u => u.id === data.starterId)

        this.game.init()

        this.game.currentShape = Shapes.GetShape(data.currentShapeId, this.game.grid)
        this.game.nextShape = Shapes.GetShape(data.nextShapeId, this.game.grid)

        this.game.turn = ourTurn
        this.game.start()
    }

    private onUpdate(update: any) {
        switch (update.type) {
            case "NEXT_SHAPE":
                this.game.setNextShape(update.shapeId)
                break
            case "DROP":
                this.game.currentShape.drop()
                break
            case "ROTATE":
                this.game.currentShape.rotate()
                break
            case "MOVE":
                this.game.currentShape.move(update.left)
                break
            case "SCORE":
                this.increaseUserScore(update.scorerId)
                this.game.updateFallSpeed(this.maxScore())
                break
            default:
                break
        }
    }

    private onLeave() {
        alert("Other player left :(")
        window.location.reload()
    }

    startGame() {
        if (!this.isHost) return

        this.game.input.removeStartButton()
        this.socket.emit("start")
    }

    private update(type: string, data?: Object) {
        this.socket.emit("update", { type: type, ...data })
    }

    drop() {
        this.update("DROP")
        this.game.currentShape.drop()
        this.game.checkGrid()
    }

    rotate() {
        this.update("ROTATE")
        this.game.currentShape.rotate()
        this.game.checkGrid()
    }

    move(left: boolean) {
        this.update("MOVE", { left: left })
        this.game.currentShape.move(left)
        this.game.checkGrid()
    }

    setNextShape(id: number) {
        this.update("NEXT_SHAPE", { shapeId: id })
        this.game.setNextShape(id)
    }

    setNextTurn() {
        this.game.turn = false
        this.currentPlayer++

        if (this.currentPlayer >= this.users.length) {
            this.currentPlayer = 0
        }

        if (this.socket.id === this.users[this.currentPlayer].id) {
            this.game.turn = true
        }
    }

    updateScore() {
        this.update("SCORE", { scorerId: this.socket.id })

        this.increaseUserScore(this.socket.id)
        this.game.updateFallSpeed(this.maxScore())
    }

    private increaseUserScore(id: string) {
        this.users.find(u => u.id === id)!.score += 100
    }

    private maxScore(): number {
        let maxScore = 0
        for (const user of this.users) {
            maxScore = Math.max(maxScore, user.score)
        }

        return maxScore
    }
}

class User {
    constructor(
        public userName: string,
        public score: number,
        public id: string,
    ) { }
}