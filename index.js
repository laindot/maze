const { Engine, Render, Runner, World, Bodies } = Matter;

const cells = 3;
const width = 600;
const height = 600;

const unitLength = height / cells;

const engine = Engine.create();
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
const walls = [
  // up
  Bodies.rectangle(width / 2, 0, width, 40, {
    isStatic: true,
  }),
  // down
  Bodies.rectangle(width / 2, height, width, 40, {
    isStatic: true,
  }),
  // left
  Bodies.rectangle(0, height / 2, 40, height, {
    isStatic: true,
  }),
  // right
  Bodies.rectangle(width, height / 2, 40, height, {
    isStatic: true,
  }),
];

World.add(world, walls);

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

const grid = Array(cells)
  .fill(null)
  .map(() => Array(cells).fill(false));

const verticals = Array(cells)
  .fill(null)
  .map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
  .fill(null)
  .map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

stepThroughCell = (row, column) => {
  // if visited the cell at [row, column], then returh
  if (grid[row][column]) {
    return;
  }

  // mark this cell as been visited
  grid[row][column] = true;

  // assemble randomly-ordered list of neighbours
  const neighbours = [
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left'],
  ];

  // for each neighbour
  for (let neighbour of neighbours) {
    const [nextRow, nextColumn, direction] = neighbour;

    // see if that neighbour is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cells ||
      nextColumn < 0 ||
      nextColumn >= cells
    ) {
      continue;
    }

    // if visited the neigbour, continue to next neighbour
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    // remove wall from horizontal or vertical array
    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }

    stepThroughCell(nextRow, nextColumn);
  }
  // visit next cell
};

stepThroughCell(startRow, startColumn);
console.log(horizontals, verticals);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLength + unitLength / 2,
      rowIndex * unitLength + unitLength,
      unitLength,
      10,
      {
        isStatic: true,
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
      columnIndex * unitLength + unitLength,
      rowIndex * unitLength + unitLength / 2,
      10,
      unitLength,
      {
        isStatic: true,
      }
    );
    World.add(world, wall);
  });
});
