import { io } from "socket.io-client";
import { Shape, SHAPES } from "./shape.js";
import { game } from "./sketch.js";


const socket = io("http://192.168.0.190:3030");
// const socket = io("https://9982-2a02-1812-1435-f00-751a-fbb-9f12-c2ff.ngrok.io");
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
    game.currentShape.drop();
    game.checkGrid();

    socket.emit("update", {
        type: "DROP",
    });
};

export const rotate = () => {
    game.currentShape.rotate();

    socket.emit("update", {
        type: "ROTATE",
    });
}

export const move = (left) => {
    game.currentShape.move(left);

    socket.emit("update", {
        type: "MOVE",
        left: left,
    });
}

export const setNextShape = (id) => {
    game.setNextShape(id);
    game.turn = !game.turn;

    socket.emit("update", {
        type: "NEXT_SHAPE",
        shapeId: id,
    });
}

export const updateScore = () => {
    allUsers[socket.id].score += 100;
    let maxScore = 0;
    for (const key in allUsers) {
        maxScore = Math.max(maxScore, allUsers[key].score);
    }

    game.updateFallSpeed(maxScore);

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
    console.log(update.type);
    switch (update.type) {
        case "NEXT_SHAPE":
            game.setNextShape(update.shapeId);
            game.turn = !game.turn;
            console.log("starting turn");
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