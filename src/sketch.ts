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
        $.select("#buttons")?.hide()
        const singleBtn = $.createButton("Single player").parent("#gamemode")
        const multiBtn = $.createButton("Multiplayer").parent("#gamemode")

        singleBtn.mousePressed(() => loadGame(false))
        multiBtn.mousePressed(() => loadGame(true))
    }
}

const loadGame = (isMultiPlayer: boolean) => {
    $.removeElements()
    $.select("#buttons")?.show()
    $.select("a")?.hide()

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

    game = new Game(isMultiPlayer)

    $.draw = () => game.draw()

    $.keyPressed = (event: any) => {
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(event.code) > -1) {
            event.preventDefault()
        }
        game.input.keyPressed()
    }

    $.keyReleased = () => game.input.clearIntervals()
}

init()

declare global {
    interface Window {
        initialized: boolean
    }
}