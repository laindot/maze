const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 16;
const cellsVertical = 11;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
  },
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const bounds = [
  // up
  Bodies.rectangle(width / 2, 0, width, 2, {
    isStatic: true,
  }),
  // down
  Bodies.rectangle(width / 2, height, width, 2, {
    isStatic: true,
  }),
  // left
  Bodies.rectangle(0, height / 2, 2, height, {
    isStatic: true,
  }),
  // right
  Bodies.rectangle(width, height / 2, 2, height, {
    isStatic: true,
  }),
];

World.add(world, bounds);

// maze generation

shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

stepThroughCell = (row, column) => {
  // if visited the cell at [row, column], then returh
  if (grid[row][column]) {
    return;
  }

  // mark this cell as been visited
  grid[row][column] = true;

  // assemble randomly-ordered list of neighbours
  const neighbours = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left'],
  ]);

  // for each neighbour
  for (let neighbour of neighbours) {
    const [nextRow, nextColumn, direction] = neighbour;

    // see if that neighbour is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue;
    }

    // if visited the neigbour, continue to next neighbour
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    switch (direction) {
      case 'left':
        verticals[row][column - 1] = true;
        break;
      case 'right':
        verticals[row][column] = true;
        break;
      case 'up':
        horizontals[row - 1][column] = true;
        break;
      case 'down':
        horizontals[row][column] = true;
        break;
    }

    stepThroughCell(nextRow, nextColumn);
  }
  // visit next cell
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      5,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'red',
        },
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'red',
        },
      }
    );
    World.add(world, wall);
  });
});

// goal

const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.6,
  unitLengthY * 0.6,
  {
    label: 'goal',
    isStatic: true,
    render: {
      fillStyle: '#42f545',
    },
  }
);
World.add(world, goal);

// ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: 'ball',
  render: {
    fillStyle: 'purple',
  },
});
World.add(world, ball);

// ball movement

document.addEventListener('keydown', (e) => {
  const { x, y } = ball.velocity;

  switch (e.keyCode) {
    case 87:
      Body.setVelocity(ball, { x, y: y - 5 });
      break;
    case 68:
      Body.setVelocity(ball, { x: x + 5, y });
      break;
    case 83:
      Body.setVelocity(ball, { x, y: y + 5 });
      break;
    case 65:
      Body.setVelocity(ball, { x: x - 5, y });
      break;
  }
});

// win condition

Events.on(engine, 'collisionStart', (e) => {
  e.pairs.forEach((collision) => {
    const labels = ['ball', 'goal'];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector('.winner').classList.remove('hidden');
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === 'wall') {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
