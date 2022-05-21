import { io } from "socket.io-client";
import { Shape, SHAPES } from "./shape.js";
import { game } from "./sketch.js";


// const socket = io("https://tetris-server-dewaeq.herokuapp.com/");
const socket = io("localhost:3000");
/**@type {Object[]} */
export let allUsers = [];
let currentPlayerIndex = null;

const userName = prompt("Username:");
let roomCode = null;
let isHost = false;

while (roomCode === null) {
    const promptInput = parseInt(prompt('4-digit room code:'));
    if (promptInput > 0 && promptInput < 10000) {
        roomCode = promptInput;
    }
}

socket.emit("joinRoom", { code: roomCode, userName: userName });

export const startGame = () => {
    if (!isHost) return;

    game.input.removeStartButton();
    socket.emit("start");
}

export const drop = () => {
    socket.emit("update", {
        type: "DROP",
    });

    game.currentShape.drop();
    game.checkGrid();
};

export const rotate = () => {
    game.currentShape.rotate();
    game.checkGrid();

    socket.emit("update", {
        type: "ROTATE",
    });
}

export const move = (left) => {
    if (!game.turn) {
        console.error("move unallowed: not our turn!");
        return;
    }

    game.currentShape.move(left);
    game.checkGrid();

    socket.emit("update", {
        type: "MOVE",
        left: left,
    });
}

export const setNextShape = (id) => {
    console.assert(!game.currentShape.canDrop());
    game.setNextShape(id);

    socket.emit("update", {
        type: "NEXT_SHAPE",
        shapeId: id,
    });
}

export const setNextTurn = () => {
    game.turn = false;
    currentPlayerIndex++;

    if (currentPlayerIndex >= allUsers.length) {
        currentPlayerIndex = 0;
    }

    if (socket.id === allUsers[currentPlayerIndex].id) {
        game.turn = true;
    }
}

export const updateScore = () => {
    increaseUserScore(socket.id);

    game.updateFallSpeed(maxScore());

    socket.emit("update", {
        type: "SCORE",
        scorerId: socket.id,
    });
}

const increaseUserScore = (id) => {
    allUsers.find(u => u.id === id).score += 100;
}

const maxScore = () => {
    let maxScore = 0;
    for (const user of allUsers) {
        maxScore = Math.max(maxScore, user.score);
    }

    return maxScore;
}

socket.on("joined", (data) => {
    isHost = data.isHost;
    allUsers = data.users;

    if (isHost) {
        game.input.addStartButton();
    }

    console.log("succesfully joined room", data.code);
});

socket.on("userJoined", (user) => {
    allUsers.push(user);
});

socket.on("start", (data) => {
    allUsers = [];
    for (const user of data.allUsers) {
        allUsers.push(user);
    }

    const ourTurn = data.starterId === socket.id;
    currentPlayerIndex = allUsers.findIndex(u => u.id === data.starterId);

    game.init();

    game.currentShape = new Shape(SHAPES.ALL[data.currentShapeId], game.grid);
    game.nextShape = new Shape(SHAPES.ALL[data.nextShapeId], game.grid);

    game.turn = ourTurn;
    game.start();
});

socket.on("update", (update) => {
    switch (update.type) {
        case "NEXT_SHAPE":
            game.setNextShape(update.shapeId);
            break;
        case "DROP":
            game.currentShape.drop();
            break;
        case "ROTATE":
            game.currentShape.rotate();
            break;
        case "MOVE":
            game.currentShape.move(update.left);
            break;
        case "SCORE":
            increaseUserScore(update.scorerId);

            game.updateFallSpeed(maxScore());
            break;
        default:
            break;
    }
});

socket.on("leave", () => {
    alert("Other player left :(");
    window.location.reload();
});