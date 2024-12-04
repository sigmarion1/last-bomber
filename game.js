// game.js

const socket = io();

// Phaser game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

let bomb;
let isActivePlayer = true; // Flag to check if the player is still in the game

function preload() {
  // Load any assets if needed
  this.load.image("bomb1", "assets/bomb1.png");
  this.load.image("bomb2", "assets/bomb2.png");
  this.load.image("bomb3", "assets/bomb3.png");
}

function create() {
  //   this.add.image(400, 300, "bomb1");

  // Join a game room
  const roomCode = prompt("Enter Room Code:");
  socket.emit("joinRoom", roomCode);

  // Handle server confirmations
  socket.on("joinedRoom", (room) => {
    console.log(`Joined room: ${room}`);
  });

  // Listen for game start
  socket.on("gameStarted", () => {
    console.log("Game has started!");
    startBombSequence();
  });

  // Display the bomb
  //   bomb = this.add.circle(400, 300, 50, 0xff0000);
  bomb = this.add.image(400, 300, "bomb1");
  bomb.visible = false;

  // Handle bomb flash
  socket.on("bombFlash", () => {
    if (isActivePlayer) {
      bomb.visible = true;
      this.tweens.add({
        targets: bomb,
        alpha: { from: 1, to: 0 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }
  });

  // Handle bomb explode
  socket.on("bombExplode", () => {
    if (isActivePlayer) {
      isActivePlayer = false;
      bomb.fillColor = 0x000000;
      alert("Boom! You have been eliminated.");
    }
  });

  // Handle player elimination
  socket.on("playerEliminated", (playerId) => {
    console.log(`Player eliminated: ${playerId}`);
  });

  // Handle game over
  socket.on("gameOver", (winnerId) => {
    if (socket.id === winnerId) {
      alert("Congratulations! You won the game!");
    } else {
      alert(`Game over! The winner is ${winnerId}`);
    }
  });
}

function update() {
  // Update game elements if necessary
}

function startBombSequence() {
  // Additional logic if needed when bomb sequence starts
}
