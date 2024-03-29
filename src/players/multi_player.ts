import { io, Socket } from "socket.io-client"
import { Shapes } from "../shape"
import { Player } from "./player"

export class MultiPlayer extends Player {
    private socket: Socket = io("https://tetris-server.onrender.com/")
    private userName: string = ""
    private roomCode: number = 0
    private isHost: boolean = false
    private currentPlayer: number = -1

    init(): void {
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
        this.socket.on("userJoined", (data) => this.onUserJoined(data))
        this.socket.on("start", (data) => this.onStart(data))
        this.socket.on("update", (data) => this.onUpdate(data))
        this.socket.on("leave", (_) => this.onLeave())
        this.socket.on("disconnect", (reason) => this.onDisConnect(reason));
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
        if (!ourTurn) {
            this.game.input.disable()
        }
        this.currentPlayer = this.users.findIndex(u => u.id === data.starterId)

        this.game.init()

        this.game.bag = data.bag
        this.game.nextBag = data.nextBag
        this.game.setShapes()

        this.game.turn = ourTurn
        this.game.start()
    }

    private onUpdate(update: any) {
        switch (update.type) {
            case "NEXT_SHAPE":
                this.game.setNextShape(update.nextBag)
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
                this.increaseUserScore(update.scorerId, update.value)
                // this.game.updateFallSpeed(this.maxScore())
                break
            case "LINES":
                this.game.linesCleared += update.value
                this.game.setLevel()
                break
            default:
                break
        }
    }

    private onLeave() {
        alert("Other player left :(")
        window.location.reload()
    }

    private onDisConnect(reason: Socket.DisconnectReason) {
        alert("Error: Lost connection\nDetails: " + reason)
        window.location.reload()
    }

    private update(type: string, data?: Object) {
        this.socket.emit("update", { type: type, ...data })
    }

    override startGame(): void {
        if (!this.isHost) return

        this.game.input.removeStartButton()
        this.socket.emit("start")
    }

    override setNextShape(): void {
        const nextBag = this.game.bagIndex === 6 ? Shapes.GetBag() : undefined;

        this.update("NEXT_SHAPE", { nextBag: nextBag })
        this.game.setNextShape(nextBag)
    }

    override endTurn(): void {
        this.game.turn = false
        this.currentPlayer++

        if (this.currentPlayer >= this.users.length) {
            this.currentPlayer = 0
        }

        if (this.socket.id === this.users[this.currentPlayer].id) {
            this.game.turn = true
            this.game.input.enable()
        } else {
            this.game.input.disable()
        }
    }

    override updateScore(value: number): void {
        this.update("SCORE", { scorerId: this.socket.id, value: value })

        this.increaseUserScore(this.socket.id, value)
    }

    override updateNumLines(value: number): void {
        this.update("LINES", { value: value })
        super.updateNumLines(value)
    }

    private increaseUserScore(id: string, value: number) {
        this.users.find(u => u.id === id)!.score += value
    }

    override drop(): void {
        this.update("DROP")
        super.drop()
    }

    override move(left: boolean): void {
        this.update("MOVE", { left: left })
        super.move(left)
    }

    override rotate(): void {
        this.update("ROTATE")
        super.rotate()
    }
}