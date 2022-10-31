import { Vector } from "p5"
import { Shape } from "./shape"
import { gridX, gridY } from "./sketch"

export class Grid {
    public matrix: boolean[][]

    constructor() {
        this.matrix = new Array(gridY).fill(null).map(_ => new Array(gridX).fill(false))
    }

    clear(): void {
        this.matrix = new Array(gridY).fill(null).map(_ => new Array(gridX).fill(false))
    }

    isLine(y: number): boolean {
        for (let x = 0; x < this.matrix[y].length; x++) {
            if (!this.matrix[y][x]) {
                return false
            }
        }

        return true
    }

    contains(pos: Vector): boolean {
        if (!this.inBounds(pos)) {
            return false
        }
        return this.matrix[pos.y][pos.x]
    }

    inBounds(pos: Vector): boolean {
        return (pos.y >= 0 && pos.y < gridY && pos.x >= 0 && pos.x < gridX)
    }

    addShape(shape: Shape): void {
        for (const block of shape.blocks) {
            const blockPos = shape.blockPos(block)
            this.set(blockPos)
        }
    }

    removeShape(shape: Shape): void {
        for (const block of shape.blocks) {
            const blockPos = shape.blockPos(block)
            this.unSet(blockPos)
        }
    }

    set(pos: Vector): void {
        this.matrix[pos.y][pos.x] = true

    }

    unSet(pos: Vector): void {
        this.matrix[pos.y][pos.x] = false
    }

    print(): void {
        for (let y = 0; y < this.matrix.length; y++) {
            let str = ""
            for (let x = 0; x < this.matrix[y].length; x++) {
                if (this.matrix[y][x]) {
                    str += " X "
                } else {
                    str += " . "
                }
            }
            console.log(str)
        }
    }
}