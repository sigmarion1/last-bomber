// game.js

const socket = io();

// Phaser game configuration
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
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
  const midX = this.scale.width / 2;
  const midY = this.scale.height / 2;

  //   this.add.image(400, 300, "bomb1");

  // Join a game room
  //   const roomCode = prompt("Enter Room Code:");
  socket.emit("joinRoom", 11);

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
  bomb = this.add.image(0, 0, "bomb1");
  bomb.setOrigin(0.5);
  bomb.setPosition(midX, midY * 0.5);
  //   bomb.setOrigin(0.5);
  bomb.scale = 5;
  //   bomb.visible = false;

  // Handle bomb flash
  socket.on("bombFlash", () => {
    if (isActivePlayer) {
      bomb.visible = true;
      this.tweens.add({
        targets: bomb,
        alpha: { from: 1, to: 0 },
        duration: 100,
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

  // Chatting List at the Bottom
  //   const chatText = this.add.text(
  //     midX,
  //     midY * 1.5,
  //     "Chat messages here... \n abc: dd \n cc: ㅋㅋㅋ 하ㄴ글",
  //     {
  //       font: "50px Arial",
  //       color: "#000",
  //       backgroundColor: "#f0f0f0",
  //       padding: { x: 10, y: 10 },
  //     }
  //   );
  //   chatText.setOrigin(0.5, 0);

  this.scale.on("resize", resize, this);
}

function update() {
  // Update game elements if necessary
}

function startBombSequence() {
  // Additional logic if needed when bomb sequence starts
}

function resize(gameSize) {
  const width = gameSize.width;
  const height = gameSize.height;

  this.cameras.resize(width, height);

  // Update positions
  this.children.getAll().forEach((child) => {
    if (child.texture && child.texture.key === "bomb1") {
      child.setPosition(width / 2, height / 2);
    }
    if (child.texture && child.texture.key === "logo") {
      child.setPosition(width / 2, 50); // Adjust Y position as needed
    }
    if (child.style && child.style.font) {
      // Text object for chat
      child.setPosition(width / 2, height / 2 + 300); // Adjust Y position as needed
    }
  });
}
