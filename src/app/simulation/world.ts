export const ELEMENT_TYPE = {
  EMPTY: 0,
  WALL: 1,
  SAND: 2,
  WATER: 3,
  PLANT: 4,
  FIRE: 5,
  LAVA: 6,
  ACID: 7,
  SMOKE: 8,
  STONE: 9,
  STONE_ASH: 10,
  ASH: 11,
  HOT_ASH: 12,
} as const;

export type ElementType = typeof ELEMENT_TYPE[keyof typeof ELEMENT_TYPE];

export const ELEMENT_COLORS: Record<ElementType, string> = {
    [ELEMENT_TYPE.EMPTY]: '#000000',
    [ELEMENT_TYPE.WALL]: '#505050',
    [ELEMENT_TYPE.SAND]: '#f0d9a5',
    [ELEMENT_TYPE.WATER]: '#3498db',
    [ELEMENT_TYPE.PLANT]: '#2ecc71',
    [ELEMENT_TYPE.FIRE]: '#e74c3c',
    [ELEMENT_TYPE.LAVA]: '#d35400',
    [ELEMENT_TYPE.ACID]: '#9b59b6',
    [ELEMENT_TYPE.SMOKE]: '#888888',
    [ELEMENT_TYPE.STONE]: '#808080',
    [ELEMENT_TYPE.STONE_ASH]: '#6b6b6b',
    [ELEMENT_TYPE.ASH]: '#2b2b2b',
    [ELEMENT_TYPE.HOT_ASH]: '#db4f27',
};

export const DENSITIES: Record<ElementType, number> = {
    [ELEMENT_TYPE.EMPTY]: 0,
    [ELEMENT_TYPE.SMOKE]: 1,
    [ELEMENT_TYPE.FIRE]: 1,
    [ELEMENT_TYPE.WATER]: 10,
    [ELEMENT_TYPE.ACID]: 11,
    [ELEMENT_TYPE.ASH]: 12,
    [ELEMENT_TYPE.HOT_ASH]: 12,
    [ELEMENT_TYPE.SAND]: 15,
    [ELEMENT_TYPE.PLANT]: 20,
    [ELEMENT_TYPE.STONE_ASH]: 25,
    [ELEMENT_TYPE.LAVA]: 22,
    [ELEMENT_TYPE.STONE]: 30,
    [ELEMENT_TYPE.WALL]: Infinity,
};

const LOCAL_STORAGE_KEY = 'sandSimulationGrid';
const CELL_SIZE = 5;
let width: number, height: number;
let grid: ElementType[][];
let areWallsOn = true;

export const setWalls = (enabled: boolean) => {
    areWallsOn = enabled;
    const wallType = enabled ? ELEMENT_TYPE.WALL : ELEMENT_TYPE.EMPTY;

    if (!grid) return;

    for (let y = 0; y < height; y++) {
        if (grid[y]) {
            grid[y][0] = wallType;
            grid[y][width - 1] = wallType;
        }
    }
    for (let x = 0; x < width; x++) {
        if (grid[0]) grid[0][x] = wallType;
        if (grid[height - 1]) grid[height - 1][x] = wallType;
    }
};

export const saveWorld = () => {
    if (grid) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(grid));
    }
};

export const clear = () => {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            grid[y][x] = ELEMENT_TYPE.EMPTY;
        }
    }
    if (areWallsOn) {
        setWalls(true);
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
};

export const init = (canvasWidth: number, canvasHeight: number, walls: boolean) => {
    areWallsOn = walls;
    const newWidth = Math.floor(canvasWidth / CELL_SIZE);
    const newHeight = Math.floor(canvasHeight / CELL_SIZE);

    // If grid exists and dimensions are the same, do nothing.
    if (grid && width === newWidth && height === newHeight) {
        return;
    }

    const oldGrid = grid;
    const oldWidth = width;
    const oldHeight = height;

    // Create the new grid, always starting empty
    width = newWidth;
    height = newHeight;
    grid = Array(height).fill(0).map(() => Array(width).fill(ELEMENT_TYPE.EMPTY));
    
    // Determine what to fill the new grid with
    let sourceGrid: ElementType[][] | null = oldGrid;

    // If this is the very first load (oldGrid is null), try localStorage
    if (!sourceGrid) {
        const savedGrid = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedGrid) {
            try {
                sourceGrid = JSON.parse(savedGrid);
            } catch (e) {
                console.error("Failed to parse saved grid", e);
                sourceGrid = null; // Ensure we don't proceed with bad data
            }
        }
    }

    // If we have a grid to copy from (either old in-memory or from storage)
    if (sourceGrid) {
        const sourceHeight = sourceGrid.length;
        const sourceWidth = sourceGrid[0]?.length || 0;

        const startX = Math.floor((newWidth - sourceWidth) / 2);
        const startY = Math.floor((newHeight - sourceHeight) / 2);

        for (let y = 0; y < sourceHeight; y++) {
            for (let x = 0; x < sourceWidth; x++) {
                const newY = y + startY;
                const newX = x + startX;

                if (newY >= 0 && newY < newHeight && newX >= 0 && newX < newWidth) {
                    // Ensure the copied element is valid
                    if (sourceGrid[y]?.[x] !== undefined) {
                         grid[newY][newX] = sourceGrid[y][x];
                    }
                }
            }
        }
    }

    setWalls(areWallsOn);
};

export const getGrid = () => grid;
export const getWidth = () => width;
export const getHeight = () => height;
export const getCellSize = () => CELL_SIZE;

export const setElement = (x: number, y: number, elementType: ElementType, brushSize: number) => {
    const radius = Math.floor(brushSize / CELL_SIZE / 2);
    for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
            if (i*i + j*j <= radius*radius) {
                const newX = x + i;
                const newY = y + j;
                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    if (grid[newY][newX] === ELEMENT_TYPE.EMPTY || elementType === ELEMENT_TYPE.EMPTY) {
                        grid[newY][newX] = elementType;
                    }
                }
            }
        }
    }
};

const move = (x1: number, y1: number, x2: number, y2: number) => {
    const temp = grid[y1][x1];
    grid[y1][x1] = grid[y2][x2];
    grid[y2][x2] = temp;
}

const isWithinBounds = (x: number, y: number) => {
    return y >= 0 && y < height && x >= 0 && x < width;
}

const isEmpty = (x: number, y: number) => {
    return isWithinBounds(x, y) && grid[y][x] === ELEMENT_TYPE.EMPTY;
}

const is = (x: number, y: number, elementType: ElementType) => {
    return isWithinBounds(x, y) && grid[y][x] === elementType;
}

const set = (x: number, y: number, elementType: ElementType) => {
    if (isWithinBounds(x, y)) {
        grid[y][x] = elementType;
    }
}

export const update = () => {
    const updatedPositions = new Set<string>();

    const updateElement = (x: number, y: number) => {
        const pos = `${x},${y}`;
        if (updatedPositions.has(pos)) {
            return; // Already updated in this frame
        }

        const element = grid[y][x];

        // --- Out of Bounds Check ---
        if (!areWallsOn) {
            if ((y <= 0 && (element === ELEMENT_TYPE.FIRE || element === ELEMENT_TYPE.SMOKE)) ||
                (y >= height - 1 && DENSITIES[element] > DENSITIES[ELEMENT_TYPE.EMPTY]) ||
                ((x <= 0 || x >= width - 1) && DENSITIES[element] > DENSITIES[ELEMENT_TYPE.EMPTY])
            ) {
                set(x, y, ELEMENT_TYPE.EMPTY);
                return;
            }
        }

        // --- Movement Phase ---
        // A particle will attempt to move, and if it does, its turn ends.
        // Interactions only happen if a particle cannot move.

        // Gas Movement (Up)
        if (element === ELEMENT_TYPE.FIRE || element === ELEMENT_TYPE.SMOKE) {
            // Gases are less likely to move, making them dissipate more naturally
            if (Math.random() > 0.4) {
                const dir = Math.random() < 0.5 ? -1 : 1;
                // Up
                if (isEmpty(x, y - 1)) { move(x, y, x, y - 1); updatedPositions.add(`${x},${y-1}`); return; }
                // Diagonal Up
                if (isEmpty(x + dir, y - 1)) { move(x, y, x + dir, y - 1); updatedPositions.add(`${x+dir},${y-1}`); return; }
                // Sideways
                if (isEmpty(x + dir, y)) { move(x, y, x + dir, y); updatedPositions.add(`${x+dir},${y}`); return; }
            }
        }
        // Falling Particle Movement (Powders & Liquids)
        else if (DENSITIES[element] > DENSITIES[ELEMENT_TYPE.EMPTY] && DENSITIES[element] < DENSITIES[ELEMENT_TYPE.WALL] && element !== ELEMENT_TYPE.PLANT) {
            const density = DENSITIES[element];

            // Lava is viscous and moves slower
            if (element === ELEMENT_TYPE.LAVA && Math.random() < 0.5) {
                return; // Skip movement this frame to simulate slower flow
            }

            // Down - Check below the particle
            const below = grid[y + 1]?.[x];
            if (below !== undefined && density > DENSITIES[below]) {
                // Before swapping up, check if the particle below has stable ground.
                // This prevents light particles from rising through falling streams.
                if (DENSITIES[element] < DENSITIES[below]) {
                    const belowNext = grid[y + 2]?.[x];
                    if (belowNext !== undefined && DENSITIES[below] > DENSITIES[belowNext]) {
                        // The particle below is also falling, so don't swap up.
                        return;
                    }
                }
                move(x, y, x, y + 1); 
                updatedPositions.add(`${x},${y+1}`); 
                return;
            }

            // Diagonal Down
            const dir = Math.random() < 0.5 ? -1 : 1;
            const diag1 = grid[y + 1]?.[x + dir];
            if (diag1 !== undefined && density > DENSITIES[diag1]) {
                move(x, y, x + dir, y + 1); updatedPositions.add(`${x+dir},${y+1}`); return;
            }
            const diag2 = grid[y + 1]?.[x - dir];
            if (diag2 !== undefined && density > DENSITIES[diag2]) {
                move(x, y, x - dir, y + 1); updatedPositions.add(`${x-dir},${y+1}`); return;
            }

            // Sideways (Liquids Only)
            if (element === ELEMENT_TYPE.WATER || element === ELEMENT_TYPE.ACID || element === ELEMENT_TYPE.LAVA) {
                if (isEmpty(x + dir, y)) { move(x, y, x + dir, y); updatedPositions.add(`${x+dir},${y}`); return; }
                if (isEmpty(x - dir, y)) { move(x, y, x - dir, y); updatedPositions.add(`${x-dir},${y}`); return; }
            }
        }

        // --- Interaction Phase ---
        // This code only runs if the particle did not move in the movement phase.
        switch(element) {
            case ELEMENT_TYPE.LAVA:
                // Check for water interaction first, as it's a specific transformation
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        if (is(x + i, y + j, ELEMENT_TYPE.WATER)) {
                            set(x, y, ELEMENT_TYPE.STONE_ASH); // Lava becomes stone ash
                            set(x + i, y + j, ELEMENT_TYPE.SMOKE); // Water becomes smoke
                            return; // End turn
                        }
                    }
                }
                // Fallthrough to general acid/lava interaction if no water is found
            case ELEMENT_TYPE.ACID:
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const neighbor = grid[y + j]?.[x + i];
                        if (neighbor === undefined || neighbor === ELEMENT_TYPE.WALL || neighbor === element) continue;
                        
                        if (is(x + i, y + j, ELEMENT_TYPE.LAVA) && element === ELEMENT_TYPE.ACID) {
                            set(x + i, y + j, ELEMENT_TYPE.SMOKE); set(x, y, ELEMENT_TYPE.SMOKE);
                        } else if (neighbor !== ELEMENT_TYPE.EMPTY) {
                            set(x + i, y + j, ELEMENT_TYPE.FIRE);
                            if (element === ELEMENT_TYPE.ACID && Math.random() < 0.2) {
                                set(x, y, ELEMENT_TYPE.EMPTY);
                            }
                        }
                    }
                }
                break;
            case ELEMENT_TYPE.FIRE:
                // Fire spreads to neighbors
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const neighbor = grid[y + j]?.[x + i];
                        if (neighbor === undefined) continue;

                        // Spread to plants, creating more fire
                        if (neighbor === ELEMENT_TYPE.PLANT) {
                            if (Math.random() < 0.3) { // Reduced chance to spread
                                set(x + i, y + j, ELEMENT_TYPE.FIRE); // The plant becomes fire
                                
                                // The original fire has a small chance to be consumed into ash
                                if (Math.random() < 0.1) {
                                    set(x, y, ELEMENT_TYPE.ASH);
                                    return; // End turn for this particle
                                }
                            }
                        }
                        // Evaporate water
                        if (neighbor === ELEMENT_TYPE.WATER) {
                            if (Math.random() < 0.5) { 
                                set(x + i, y + j, ELEMENT_TYPE.SMOKE);
                            }
                        }
                    }
                }

                // If fire didn't get consumed, it has a chance to burn out
                if (Math.random() < 0.05) { // A bit shorter lifespan
                    if (Math.random() < 0.3) { // 30% chance to become smoke
                        set(x, y, ELEMENT_TYPE.SMOKE);
                    } else { // 70% chance to become empty
                        set(x, y, ELEMENT_TYPE.EMPTY);
                    }
                }
                break;
            case ELEMENT_TYPE.HOT_ASH:
                if (Math.random() < 0.05) { set(x, y, ELEMENT_TYPE.ASH); break; }
                 for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const neighbor = grid[y + j]?.[x + i];
                        if (neighbor === undefined) continue;

                        if (neighbor === ELEMENT_TYPE.WATER) {
                            set(x, y, ELEMENT_TYPE.ASH);
                            set(x + i, y + j, ELEMENT_TYPE.SMOKE);
                        } 
                        // Ignite other flammable things (but not ash)
                        else if (
                            neighbor !== ELEMENT_TYPE.ASH &&
                            neighbor !== ELEMENT_TYPE.HOT_ASH &&
                            DENSITIES[neighbor] > 0 && 
                            DENSITIES[neighbor] < DENSITIES[ELEMENT_TYPE.LAVA]
                        ) {
                             if(Math.random() < 0.05) {
                                set(x + i, y + j, ELEMENT_TYPE.FIRE);
                                set(x, y, ELEMENT_TYPE.ASH);
                             }
                        }
                        // Ignite other ash (very low chance)
                        else if (neighbor === ELEMENT_TYPE.ASH || neighbor === ELEMENT_TYPE.HOT_ASH) {
                            if (Math.random() < 0.001) {
                                set(x + i, y + j, ELEMENT_TYPE.FIRE);
                                set(x, y, ELEMENT_TYPE.ASH);
                            }
                        }
                    }
                }
                break;
            case ELEMENT_TYPE.STONE_ASH:
                // Chance to melt if touching lava
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        if (is(x + i, y + j, ELEMENT_TYPE.LAVA) && Math.random() < 0.002) {
                            set(x, y, ELEMENT_TYPE.LAVA);
                            return;
                        }
                    }
                }
                // Harden into stone if stable
                const isStable = (DENSITIES[grid[y+1]?.[x]] >= DENSITIES[ELEMENT_TYPE.STONE_ASH]);
                if (isStable && Math.random() < 0.005) {
                    set(x, y, ELEMENT_TYPE.STONE);
                }
                break;
            case ELEMENT_TYPE.STONE:
                // Chance to melt if touching lava (very small chance)
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        if (is(x + i, y + j, ELEMENT_TYPE.LAVA) && Math.random() < 0.0005) {
                            set(x, y, ELEMENT_TYPE.LAVA);
                            return;
                        }
                    }
                }
                break;
            case ELEMENT_TYPE.PLANT:
                // Plants are mostly static but can be consumed by fire
                if (Math.random() < 0.01) {
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            if (is(x + i, y + j, ELEMENT_TYPE.WATER)) {
                               // Try to grow into an empty space nearby
                               const growX = x - i;
                               const growY = y - j;
                               if (isEmpty(growX, growY)) {
                                   set(growX, growY, ELEMENT_TYPE.PLANT);
                               }
                            }
                        }
                    }
                }
                break;
            case ELEMENT_TYPE.SMOKE:
                // If smoke is stuck, it has a chance to disappear.
                if (Math.random() < 0.01) {
                    set(x, y, ELEMENT_TYPE.EMPTY);
                }
                break;
        }

        updatedPositions.add(pos);
    }

    // Iterate through the grid and update elements
    for (let y = height - 1; y >= 0; y--) {
        const scanDirection = Math.random() < 0.5 ? 1 : -1;
        if (scanDirection === 1) {
            for (let x = 0; x < width; x++) {
                updateElement(x, y);
            }
        } else {
            for (let x = width - 1; x >= 0; x--) {
                updateElement(x, y);
            }
        }
    }

    // Process solids (non-moving but interactive elements)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
             if (grid[y][x] === ELEMENT_TYPE.PLANT) {
                 updateElement(x, y);
            }
        }
    }

    // Iterate top-to-bottom for rising particles
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
             if (grid[y][x] === ELEMENT_TYPE.SMOKE || grid[y][x] === ELEMENT_TYPE.FIRE) {
                 updateElement(x, y);
            }
        }
    }
}; 