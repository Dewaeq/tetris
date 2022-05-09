import { io } from "socket.io-client";
import { Shape, SHAPES } from "./shape.js";
import { game } from "./sketch.js";


// const socket = io("http://192.168.0.190:3030");
const socket = io(" https://3265-2a02-1812-1435-f00-fc39-41cd-5364-3a2b.ngrok.io");
export let allUsers = {};

const userName = prompt("Username:");
let roomCode = null;

while (roomCode === null) {
    const promptInput = parseInt(prompt('4-digit room code:'));
    if (promptInput > 0 && promptInput < 10000) {
        roomCode = promptInput;
    }
}

socket.emit("joinRoom", { code: roomCode, userName: userName });

export const drop = () => {
    socket.emit("update", {
        type: "DROP",
    });
};

export const rotate = () => {
    socket.emit("update", {
        type: "ROTATE",
    });
}

export const move = (left) => {
    socket.emit("update", {
        type: "MOVE",
        left: left,
    });
}

export const setNextShape = (id) => {
    socket.emit("update", {
        type: "NEXT_SHAPE",
        shapeId: id,
    });
}

export const updateScore = () => {
    socket.emit("update", {
        type: "SCORE",
        scorerId: socket.id,
    });
}

socket.on("joined", (code) => {
    console.log("succesfully joined room", code);
});

socket.on("start", (data) => {
    allUsers = {};
    for (const user of data.allUsers) {
        allUsers[user.id] = user;
    }

    const ourTurn = data.starterId === socket.id;
    game.init();

    game.currentShape = new Shape(SHAPES.ALL[data.currentShapeId], game.grid);
    game.nextShape = new Shape(SHAPES.ALL[data.nextShapeId], game.grid);

    game.turn = ourTurn;
    game.start();
});

socket.on("update", (update) => {
    switch (update.type) {
        case "NEXT_SHAPE":
            game.currentShape = game.nextShape;
            game.nextShape = new Shape(SHAPES.ALL[update.shapeId], game.grid);
            game.turn = !game.turn;

            if (!game.currentShape.canDrop() && game.started) {
                p5.frameRate(0);
                alert("Game Over");

                game.stop();
            }
            break;
        case "DROP":
            game.currentShape.drop();
            game.checkGrid();
            break;
        case "ROTATE":
            game.currentShape.rotate();
            break;
        case "MOVE":
            game.currentShape.move(update.left);
            break;
        case "SCORE":
            allUsers[update.scorerId].score += 100;

            let maxScore = 0;
            for (const key in allUsers) {
                maxScore = Math.max(maxScore, allUsers[key].score);
            }

            // const maxScore = Math.max(allUsers.map(u => u.score));
            game.updateFallSpeed(maxScore);

            break;
        default:
            break;
    }
});

socket.on("leave", () => {
    alert("Other player left :(");
    window.location.reload();
});