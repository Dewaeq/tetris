class Grid {
    constructor() {
        this.matrix = Array(gridY).fill(null).map(_ => Array(gridX).fill(false));
    }

    isLine(y) {
        for (let x = 0; x < this.matrix[y].length; x++) {
            if (!this.matrix[y][x]) {
                return false;
            }
        }

        return true;
    }

    inBounds(pos) {
        return (pos.y >= 0 && pos.y < gridY && pos.x >= 0 && pos.x < gridX);
    }

    contains(pos) {
        if (!this.inBounds(pos)) {
            return false;
        }
        return this.matrix[pos.y][pos.x];
    }

    set(pos) {
        this.matrix[pos.y][pos.x] = true;
    }

    unset(pos) {
        this.matrix[pos.y][pos.x] = false;
    }

    addShape(shape) {
        for (const block of shape.blocks) {
            let blockPos = shape.blockPos(block);
            this.set(blockPos);
        }
    }

    removeShape(shape) {
        for (const block of shape.blocks) {
            let blockPos = shape.blockPos(block);
            this.unset(blockPos);
        }
    }

    print() {
        for (let y = 0; y < this.matrix.length; y++) {
            let str = "";
            for (let x = 0; x < this.matrix[y].length; x++) {
                if (this.matrix[y][x]) {
                    str += " X ";
                } else {
                    str += " . ";
                }
            }
            console.log(str);
        }
    }
}