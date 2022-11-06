import { Vector, Color } from "p5"
import { Grid } from "./grid"
import { $, gridY } from "./sketch"

export class Shape {
    public position: Vector = $.createVector(4, 0)

    constructor(
        public id: number,
        public blocks: Vector[],
        public color: Color,
        private rotationPoint: Vector,
        public grid?: Grid,
    ) { }

    blockPos(block: Vector): Vector {
        return Vector.add(block, this.position)
    }

    canDrop() {
        let result = true
        let maxY = Number.NEGATIVE_INFINITY

        for (const block of this.blocks) {
            const blockPos = this.blockPos(block)

            if (blockPos.y > maxY) {
                maxY = blockPos.y
                if (maxY >= gridY - 1) {
                    return false
                }
            }
        }

        this.grid?.removeShape(this)

        for (const block of this.blocks) {
            const blockPos = this.blockPos(block)
            if (this.grid?.contains($.createVector(blockPos.x, blockPos.y + 1))) {
                result = false
                break
            }
        }

        this.grid?.addShape(this)

        return result
    }

    drop(): void {
        this.grid?.removeShape(this)
        this.position.y += 1
        this.grid?.addShape(this)
    }

    canRotate(cw = true): boolean {
        let result = true
        this.grid?.removeShape(this)

        for (const block of this.blocks) {
            const newPos = this.rotatedBlockPosition(block, cw)
            const blockPos = this.blockPos(newPos)
            if (this.grid?.contains(blockPos) || !this.grid?.inBounds(blockPos)) {
                result = false
                break
            }
        }

        this.grid?.addShape(this)

        return result
    }

    rotate(cw = true): void {
        this.grid?.removeShape(this)

        for (let i = 0; i < this.blocks.length; i++) {
            this.blocks[i] = this.rotatedBlockPosition(this.blocks[i], cw)
        }

        this.grid?.addShape(this)
    }

    canMove(left: boolean): boolean {
        let result = true
        const offset = left ? -1 : 1

        this.grid?.removeShape(this)
        for (const block of this.blocks) {
            const blockPos = this.blockPos($.createVector(block.x + offset, block.y))
            if (this.grid?.contains(blockPos) || !this.grid?.inBounds(blockPos)) {
                result = false
                break
            }
        }

        this.grid?.addShape(this)
        return result
    }

    move(left: boolean): void {
        const offset = left ? -1 : 1
        this.grid?.removeShape(this)
        this.position.x += offset
        this.grid?.addShape(this)
    }

    rotatedBlockPosition(block: Vector, cw: boolean): Vector {
        let result = block.copy()
        const transl = $.createVector(result.x - this.rotationPoint.x, result.y - this.rotationPoint.y)

        result.x = -transl.y
        result.y = transl.x

        if (!cw) result.mult(-1)

        result.x += this.rotationPoint.x
        result.y += this.rotationPoint.y

        return result
    }

    width(): number {
        let minX = 50
        let maxX = -50

        for (const block of this.blocks) {
            if (block.x > maxX) {
                maxX = block.x
            }
            if (block.x < minX) {
                minX = block.x
            }
        }

        return $.abs(minX) + $.abs(maxX) + 1
    }
}

export class Shapes {
    static O = () => new Shape(
        0,
        [$.createVector(0, 0), $.createVector(1, 0), $.createVector(0, 1), $.createVector(1, 1)],
        $.color(255, 255, 0),
        $.createVector(0.5, 0.5),
    )
    static I = () => new Shape(
        1,
        [$.createVector(0, 0), $.createVector(0, 1), $.createVector(0, 2), $.createVector(0, 3),],
        $.color(0, 255, 255),
        $.createVector(0.5, 1.5),
    )
    static J = () => new Shape(
        2,
        [$.createVector(1, 0), $.createVector(1, 1), $.createVector(0, 2), $.createVector(1, 2),],
        $.color(0, 0, 255),
        $.createVector(1, 1),
    )
    static L = () => new Shape(
        3,
        [$.createVector(0, 0), $.createVector(0, 1), $.createVector(0, 2), $.createVector(1, 2),],
        $.color(255, 170, 0),
        $.createVector(0, 1),
    )
    static T = () => new Shape(
        4,
        [$.createVector(1, 0), $.createVector(0, 1), $.createVector(1, 1), $.createVector(2, 1),],
        $.color(153, 0, 255),
        $.createVector(1, 1),
    )
    static S = () => new Shape(
        5,
        [$.createVector(1, 0), $.createVector(2, 0), $.createVector(0, 1), $.createVector(1, 1),],
        $.color(0, 255, 0),
        $.createVector(1, 1),
    )
    static Z = () => new Shape(
        6,
        [$.createVector(0, 0), $.createVector(1, 0), $.createVector(1, 1), $.createVector(2, 1),],
        $.color(255, 0, 0),
        $.createVector(1, 1),
    )

    static All: ((() => Shape))[] = [this.O, this.I, this.J, this.L, this.S, this.Z, this.T]

    static GetShape(id: number, grid: Grid): Shape {
        const shape = this.All[id]()
        shape.grid = grid
        
        return shape
    }

    static GetBag(): number[] {
        return $.shuffle([0, 1, 2, 3, 4, 5, 6])
    }
}
