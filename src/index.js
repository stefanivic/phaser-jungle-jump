import "phaser";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player,
  platforms,
  cursors,
  stars,
  bombs,
  gameOver = false,
  score = 0,
  scoreText;

function preload() {
  this.load.image("sky", "assets/bg.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("star", "assets/star.png");
  this.load.image("bomb", "assets/bomb.png");
  this.load.image("character-jump", "assets/char-jump.png");
  this.load.image("character-jump-left", "assets/char-jump-left.png");
  this.load.spritesheet("character", "assets/char-idle.png", {
    frameWidth: 31,
    frameHeight: 35
  });
  this.load.spritesheet("character-left", "assets/char-run-left.png", {
    frameWidth: 33,
    frameHeight: 44
  });
  this.load.spritesheet("character-right", "assets/char-run-right.png", {
    frameWidth: 33,
    frameHeight: 44
  });
}

function create() {
  this.add.image(400, 300, "sky");

  platforms = this.physics.add.staticGroup();

  platforms.create(400, 580, "ground");
  platforms.create(800, 450, "ground");
  platforms.create(-80, 300, "ground");
  platforms.create(880, 220, "ground");

  player = this.physics.add.sprite(100, 450, "character");

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("character-left", {
      start: 0,
      end: 4
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("character-right", {
      start: 0,
      end: 4
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "idle",
    frames: this.anims.generateFrameNumbers("character", { start: 0, end: 12 }),
    frameRate: 20
  });

  this.anims.create({
    key: "jump",
    frames: [{ key: "character-jump", frame: 0 }],
    frameRate: 20,
    repeat: 1
  });

  this.anims.create({
    key: "jump-left",
    frames: [{ key: "character-jump-left", frame: 0 }],
    frameRate: 20,
    repeat: 1
  });

  this.anims.create({
    key: "mid-air",
    frames: this.anims.generateFrameNumbers("character-air", {
      start: 0,
      end: 1
    }),
    frameRate: 10,
    repeat: -1
  });

  /* Stars */
  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: {
      x: 12,
      y: 0,
      stepX: 70
    }
  });

  stars.children.iterate(function(child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  /* Score */
  scoreText = this.add.text(16, 16, "score: 0", {
    fontSize: "32px",
    fill: "#00"
  });

  /* Bombs */
  bombs = this.physics.add.group();

  cursors = this.input.keyboard.createCursorKeys();
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);

  this.physics.add.collider(player, bombs, hitBomb, null, this);
  this.physics.add.overlap(player, stars, collectStar, null, this);
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("idle", true);
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
  if (cursors.up.isDown) {
    player.anims.play("jump", true);
  }
  if (cursors.up.isDown && cursors.left.isDown) {
    player.anims.play("jump-left", true);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);

  score += 10;
  scoreText.setText("Score: " + score);

  var x =
    player.x < 400
      ? Phaser.Math.Between(400, 800)
      : Phaser.Math.Between(0, 400);

  var bomb = bombs.create(x, 16, "bomb");
  bomb.setBounce(1);
  bomb.setCollideWorldBounds(true);
  bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  bomb.allowGravity = false;

  if (score == 120) {
    this.physics.pause();
    player.anims.play("turn");
    this.text = this.add.text(
      game.config.width / 2,
      game.config.height - 100,
      "You won!",
      {
        fontSize: "60px",
        fill: "#fff",
        boundsAlignH: "center"
      }
    );
    this.text.setOrigin(0.5);
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play("turn");
  gameOver = true;
  this.text = this.add.text(
    game.config.width / 2,
    game.config.height - 100,
    "Game over!",
    {
      fontSize: "60px",
      fill: "#ff0000",
      boundsAlignH: "center"
    }
  );
  this.text.setOrigin(0.5);
}

var game = new Phaser.Game(config);
