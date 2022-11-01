import p5 from "p5"
import { Game } from "./game"

export const gridX = 10
export const gridY = 20
export let gridOffset = 0
export let cellSize = 0
export let game: Game
export let $: p5

const init = () => {
    if (window.initialized) return

    window.initialized = true
    
    $ = new p5((_) => { })

    $.setup = () => {
        if ($.windowWidth > $.windowHeight) {
            cellSize = $.windowHeight * 0.75 / gridY
            gridOffset = cellSize * 3

            const canv = $.createCanvas(gridX * cellSize + gridOffset * 2, gridY * cellSize)
            canv.parent("#canvas")
        } else {
            cellSize = $.windowWidth * 0.6 / gridX
            gridOffset = $.windowWidth * 0.4 / 2
            const canv = $.createCanvas($.windowWidth, gridY * cellSize)
            canv.parent("#canvas")
        }

        game = new Game()
        
        $.draw = () => game.draw()
    
        $.keyPressed = () => game.input.keyPressed()
    
        $.keyReleased = () => game.input.clearIntervals()
    }
}

init()

declare global {
    interface Window {
        initialized: boolean
    }
}