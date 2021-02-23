const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const UP_KEY = 38;
const DOWN_KEY = 40;
const board_border = 'black';
const board_background = 'white';
const snake_col = 'lightblue';
const snake_border = 'darkblue';

let snake = [
  { x: 200, y: 200 },
  { x: 190, y: 200 },
  { x: 180, y: 200 },
  { x: 170, y: 200 },
  { x: 160, y: 200 },
];

let score = 0;
let bestScore = 0;
let traps = [];
// True if changing direction
let changing_direction = false;
// Horizontal velocity
let food_x;
let food_y;
let dx = 10;
// Vertical velocity
let dy = 0;

// Get the snakeboard_ctx element
const snakeboard = document.getElementById('snakeboard');
// Return a two dimensional drawing context
const snakeboard_ctx = snakeboard.getContext('2d');
// Start game
clear_board();
document.getElementById('start').addEventListener('click', function () {
  main();
  gen_food();
});

document.getElementById('restart').addEventListener('click', function () {
  snake = [
    { x: 200, y: 200 },
    { x: 190, y: 200 },
    { x: 180, y: 200 },
    { x: 170, y: 200 },
    { x: 160, y: 200 },
  ];
  score = 0;
  traps = [];

  document.getElementById('score').innerHTML = `Score: ${score}`;
  main();
  gen_food();
});

document
  .getElementById('up-btn')
  .addEventListener('click', () => change_direction({ keyCode: UP_KEY }));
document
  .getElementById('down-btn')
  .addEventListener('click', () => change_direction({ keyCode: DOWN_KEY }));
document
  .getElementById('left-btn')
  .addEventListener('click', () => change_direction({ keyCode: LEFT_KEY }));
document
  .getElementById('right-btn')
  .addEventListener('click', () => change_direction({ keyCode: RIGHT_KEY }));
document.addEventListener('keydown', change_direction);

// main function called repeatedly to keep the game running
function main() {
  if (has_game_ended()) {
    snakeboard_ctx.font = '50px serif';
    snakeboard_ctx.textAlign = 'center';
    snakeboard_ctx.textBaseline = 'middle';
    snakeboard_ctx.fillStyle = 'red';
    snakeboard_ctx.fillText(
      'GAME OVER',
      snakeboard.width / 2,
      snakeboard.height / 2
    );
    snakeboard_ctx.strokeText(
      'GAME OVER',
      snakeboard.width / 2,
      snakeboard.height / 2
    );
    if (score > bestScore) {
      bestScore = score;
      document.getElementById(
        'best-score'
      ).innerHTML = `Best score: ${bestScore}`;
    }
    return;
  }

  changing_direction = false;
  setTimeout(function onTick() {
    clear_board();
    drawFood();
    move_snake();
    drawSnake();
    drawTraps();
    // Repeat
    main();
  }, 100);
}

// draw a border around the snakeboard_ctx
function clear_board() {
  //  Select the colour to fill the drawing
  snakeboard_ctx.fillStyle = board_background;
  //  Select the colour for the border of the snakeboard_ctx
  snakeboard_ctx.strokestyle = board_border;
  // Draw a "filled" rectangle to cover the entire snakeboard_ctx
  snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
  // Draw a "border" around the entire snakeboard_ctx
  snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
}

// Draw the snake on the snakeboard_ctx
function drawSnake() {
  // Draw each part
  snake.forEach(drawSnakePart);
}

function drawFood() {
  snakeboard_ctx.fillStyle = 'lightgreen';
  snakeboard_ctx.strokestyle = 'darkgreen';
  snakeboard_ctx.fillRect(food_x, food_y, 10, 10);
  snakeboard_ctx.strokeRect(food_x, food_y, 10, 10);
}

function drawTraps() {
  snakeboard_ctx.fillStyle = 'red';
  snakeboard_ctx.strokestyle = 'orange';
  traps.forEach((trap) => {
    snakeboard_ctx.fillRect(trap.x, trap.y, 10, 10);
    snakeboard_ctx.strokeRect(trap.x, trap.y, 10, 10);
  });
}

// Draw one snake part
function drawSnakePart(snakePart) {
  // Set the colour of the snake part
  snakeboard_ctx.fillStyle = snake_col;
  // Set the border colour of the snake part
  snakeboard_ctx.strokestyle = snake_border;
  // Draw a "filled" rectangle to represent the snake part at the coordinates
  // the part is located
  snakeboard_ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
  // Draw a border around the snake part
  snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
}

function has_game_ended() {
  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
  }
  for (let trap of traps) {
    if (trap.x === snake[0].x && trap.y === snake[0].y) return true;
  }
  const hitLeftWall = snake[0].x < 0;
  const hitRightWall = snake[0].x > snakeboard.width - 10;
  const hitToptWall = snake[0].y < 0;
  const hitBottomWall = snake[0].y > snakeboard.height - 10;
  return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall;
}

function random_coords(min, max) {
  return Math.round((Math.random() * (max - min) + min) / 10) * 10;
}

function gen_food() {
  food_x = random_coords(0, snakeboard.width - 10);

  food_y = random_coords(0, snakeboard.height - 10);
  // if the new food location is where the snake currently is, generate a new food location
  snake.forEach(function has_snake_eaten_food(part) {
    const has_eaten = part.x == food_x && part.y == food_y;
    if (has_eaten) gen_food();
  });
}

function gen_trap() {
  trap_x = random_coords(0, snakeboard.width - 10);

  trap_y = random_coords(0, snakeboard.height - 10);
  // if the new trap location is where the snake currently is, generate a new food location
  let collision = false;
  if (trap_x === food_x && food_y === trap_y) {
    collision = true;
  }
  snake.forEach(function has_snake_eaten_trap(part) {
    const has_eaten = part.x == food_x && part.y == food_y;
    if (has_eaten) collision = true;
  });
  if (!collision) traps.push({ x: trap_x, y: trap_y });
}

function change_direction(event) {
  // Prevent the snake from reversing

  if (changing_direction) return;
  changing_direction = true;
  const keyPressed = event.keyCode;
  const goingUp = dy === -10;
  const goingDown = dy === 10;
  const goingRight = dx === 10;
  const goingLeft = dx === -10;
  if (keyPressed === LEFT_KEY && !goingRight) {
    dx = -10;
    dy = 0;
  }
  if (keyPressed === UP_KEY && !goingDown) {
    dx = 0;
    dy = -10;
  }
  if (keyPressed === RIGHT_KEY && !goingLeft) {
    dx = 10;
    dy = 0;
  }
  if (keyPressed === DOWN_KEY && !goingUp) {
    dx = 0;
    dy = 10;
  }
}

function move_snake() {
  // Create the new Snake's head
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  // Add the new head to the beginning of snake body
  snake.unshift(head);
  const has_eaten_food = snake[0].x === food_x && snake[0].y === food_y;
  if (has_eaten_food) {
    // Increase score
    score += 10;
    // Display score on screen
    document.getElementById('score').innerHTML = `Score: ${score}`;
    // Generate new food location
    gen_food();
    if (score % 50 === 0) {
      for (let i = 0; i < (score / 50) ** 2; ++i) {
        gen_trap();
      }
    }
  } else {
    // Remove the last part of snake body
    snake.pop();
  }
}
