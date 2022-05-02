class Shape {
    constructor(type, grid) {
        this.grid = grid;
        this.blocks = [...type.blocks];
        this.color = type.color;
        this.rotationPoint = type.rotationPoint.copy();
        this.position = createVector(4, 0);
    }

    blockPos(block) {
        return p5.Vector.add(block, this.position);
    }

    canRotate(cw = true) {
        let result = true;
        this.grid.removeShape(this);

        for (const block of this.blocks) {
            let newPos = this.rotatedBlockPosition(block, cw);
            let blockPos = this.blockPos(newPos);
            if (this.grid.contains(blockPos) || !this.grid.inBounds(blockPos)) {
                result = false;
                break;
            }
        }

        this.grid.addShape(this);

        return result;
    }

    rotate(cw = true) {
        this.grid.removeShape(this);

        for (let i = 0; i < this.blocks.length; i++) {
            this.blocks[i] = this.rotatedBlockPosition(this.blocks[i], cw);
        }

        this.grid.addShape(this);
    }

    canDrop() {
        let result = true;
        let maxY = null;

        for (const block of this.blocks) {
            let blockPos = this.blockPos(block);

            if (blockPos.y > maxY) {
                maxY = blockPos.y;
                if (maxY >= gridY - 1) {
                    return false;
                }
            }
        }

        this.grid.removeShape(this);

        for (const block of this.blocks) {
            if (this.grid.contains(p5.Vector.add(this.blockPos(block), [0, 1]))) {
                result = false;
                break;
            }
        }

        this.grid.addShape(this);

        return result;
    }

    drop() {
        this.grid.removeShape(this);
        this.position.y += 1;
        this.grid.addShape(this);
    }

    canMove(left) {
        let result = true;
        let offset = left ? -1 : 1;

        this.grid.removeShape(this);
        for (const block of this.blocks) {
            let blockPos = this.blockPos(p5.Vector.add(block, [offset]));
            if (this.grid.contains(blockPos) || !this.grid.inBounds(blockPos)) {
                result = false;
                break;
            }
        }

        this.grid.addShape(this);
        return result;
    }

    move(left) {
        let offset = left ? -1 : 1;
        this.grid.removeShape(this);
        this.position.x += offset;
        this.grid.addShape(this);
    }

    rotatedBlockPosition(block, cw) {
        let result = block.copy();
        let transl = createVector(result.x - this.rotationPoint.x, result.y - this.rotationPoint.y);

        result.x = -transl.y;
        result.y = transl.x;

        if (!cw) {
            result.mult(-1);
        }

        result.x += this.rotationPoint.x;
        result.y += this.rotationPoint.y;

        return result;
    }

    width() {
        let minX = 50;
        let maxX = -50;

        for (const block of this.blocks) {
            if (block.x > maxX) {
                maxX = block.x;
            }
            if (block.x < minX) {
                minX = block.x;
            }
        }

        return abs(minX) + abs(maxX) + 1;
    }
}

class SHAPES {
    static Load() {
        this.O = {
            blocks: [createVector(0, 0), createVector(1, 0), createVector(0, 1), createVector(1, 1)],
            color: color(255, 255, 0),
            rotationPoint: createVector(0.5, 0.5),
        };
        this.I = {
            blocks: [createVector(0, 0), createVector(0, 1), createVector(0, 2), createVector(0, 3),],
            color: color(0, 255, 255),
            rotationPoint: createVector(0.5, 1.5),
        };
        this.J = {
            blocks: [createVector(1, 0), createVector(1, 1), createVector(0, 2), createVector(1, 2),],
            color: color(0, 0, 255),
            rotationPoint: createVector(1, 1),
        };
        this.L = {
            blocks: [createVector(0, 0), createVector(0, 1), createVector(0, 2), createVector(1, 2),],
            color: color(255, 170, 0),
            rotationPoint: createVector(0, 1),
        };
        this.T = {
            blocks: [createVector(1, 0), createVector(0, 1), createVector(1, 1), createVector(2, 1),],
            color: color(153, 0, 255),
            rotationPoint: createVector(1, 1),
        };
        this.S = {
            blocks: [createVector(1, 0), createVector(2, 0), createVector(0, 1), createVector(1, 1),],
            color: color(0, 255, 0),
            rotationPoint: createVector(1, 1),
        };
        this.Z = {
            blocks: [createVector(0, 0), createVector(1, 0), createVector(1, 1), createVector(2, 1),],
            color: color(255, 0, 0),
            rotationPoint: createVector(1, 1),
        };

        this.ALL = [this.O, this.I, this.J, this.L, this.S, this.Z, this.T];
    }

    static Random(grid) {
        let type = this.ALL[Math.floor(random(7))];
        return new Shape(type, grid);
    }
}
