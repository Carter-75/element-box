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
  GAS: 13,
  OIL: 14,
  GUNPOWDER: 15,
  ICE: 16,
  VIRUS: 17,
  // New Elements
  NITROGEN: 18,
  METHANE: 19,
  BLACK_HOLE: 20,
  ANTIMATTER: 21,
  WATER_SPOUT: 22,
  FUSE: 23,
  BURNING_FUSE: 24,
  GEL: 25,
  CLONER: 26,
  DIAMOND: 27,
  LAVA_SPOUT: 28,
  FIRE_SPOUT: 29,
  SMOKE_SPOUT: 30,
  FUSE_IGNITING: 31,
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
    [ELEMENT_TYPE.GAS]: '#c2c2c2',
    [ELEMENT_TYPE.OIL]: '#3b2e26',
    [ELEMENT_TYPE.GUNPOWDER]: '#404040',
    [ELEMENT_TYPE.ICE]: '#aed6f1',
    [ELEMENT_TYPE.VIRUS]: '#7dff7d',
    // New Element Colors
    [ELEMENT_TYPE.NITROGEN]: '#77b5fe',
    [ELEMENT_TYPE.METHANE]: '#bca0d1',
    [ELEMENT_TYPE.BLACK_HOLE]: '#0d0d0d',
    [ELEMENT_TYPE.ANTIMATTER]: '#f0f0f0',
    [ELEMENT_TYPE.WATER_SPOUT]: '#5078a0',
    [ELEMENT_TYPE.LAVA_SPOUT]: '#a06850',
    [ELEMENT_TYPE.FIRE_SPOUT]: '#a05050',
    [ELEMENT_TYPE.SMOKE_SPOUT]: '#606060',
    [ELEMENT_TYPE.FUSE]: '#4a2a0c',
    [ELEMENT_TYPE.BURNING_FUSE]: '#ffaa00',
    [ELEMENT_TYPE.GEL]: '#b978c7',
    [ELEMENT_TYPE.CLONER]: '#ff00ff',
    [ELEMENT_TYPE.DIAMOND]: '#b9f2ff',
    [ELEMENT_TYPE.FUSE_IGNITING]: '#8f4f1b',
};

export const DENSITIES: Record<ElementType, number> = {
    [ELEMENT_TYPE.EMPTY]: 0,
    [ELEMENT_TYPE.METHANE]: 0.4,
    [ELEMENT_TYPE.GAS]: 0.5,
    [ELEMENT_TYPE.SMOKE]: 1,
    [ELEMENT_TYPE.FIRE]: 1,
    [ELEMENT_TYPE.OIL]: 8,
    [ELEMENT_TYPE.ICE]: 9,
    [ELEMENT_TYPE.WATER]: 10,
    [ELEMENT_TYPE.NITROGEN]: 9.5,
    [ELEMENT_TYPE.GEL]: 10.5,
    [ELEMENT_TYPE.ACID]: 11,
    [ELEMENT_TYPE.ASH]: 12,
    [ELEMENT_TYPE.HOT_ASH]: 12,
    [ELEMENT_TYPE.SAND]: 15,
    [ELEMENT_TYPE.GUNPOWDER]: 16,
    [ELEMENT_TYPE.ANTIMATTER]: 17,
    [ELEMENT_TYPE.BURNING_FUSE]: 17,
    [ELEMENT_TYPE.PLANT]: 20,
    [ELEMENT_TYPE.STONE_ASH]: 25,
    [ELEMENT_TYPE.LAVA]: 22,
    [ELEMENT_TYPE.VIRUS]: 10,
    [ELEMENT_TYPE.STONE]: 30,
    [ELEMENT_TYPE.FUSE]: Infinity,
    [ELEMENT_TYPE.FUSE_IGNITING]: Infinity,
    [ELEMENT_TYPE.DIAMOND]: Infinity,
    [ELEMENT_TYPE.BLACK_HOLE]: Infinity,
    [ELEMENT_TYPE.CLONER]: Infinity,
    [ELEMENT_TYPE.WATER_SPOUT]: Infinity,
    [ELEMENT_TYPE.LAVA_SPOUT]: Infinity,
    [ELEMENT_TYPE.FIRE_SPOUT]: Infinity,
    [ELEMENT_TYPE.SMOKE_SPOUT]: Infinity,
    [ELEMENT_TYPE.WALL]: Infinity,
};

const STATIC_SOLIDS = new Set([
    ELEMENT_TYPE.WALL, ELEMENT_TYPE.PLANT, ELEMENT_TYPE.STONE, ELEMENT_TYPE.ICE,
    ELEMENT_TYPE.FUSE, ELEMENT_TYPE.DIAMOND, ELEMENT_TYPE.BLACK_HOLE, ELEMENT_TYPE.CLONER,
    ELEMENT_TYPE.WATER_SPOUT, ELEMENT_TYPE.LAVA_SPOUT, ELEMENT_TYPE.FIRE_SPOUT,
    ELEMENT_TYPE.SMOKE_SPOUT, ELEMENT_TYPE.FUSE_IGNITING,
]);

const LAVA_IMMUNE_SOLIDS = new Set([
    ELEMENT_TYPE.WALL, ELEMENT_TYPE.DIAMOND,
    ELEMENT_TYPE.WATER_SPOUT, ELEMENT_TYPE.LAVA_SPOUT,
    ELEMENT_TYPE.FIRE_SPOUT, ELEMENT_TYPE.SMOKE_SPOUT
]);

const HEAT_SOURCES = new Set([ELEMENT_TYPE.FIRE, ELEMENT_TYPE.LAVA, ELEMENT_TYPE.HOT_ASH]);

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
    
    // Set up walls on the new, empty grid first.
    setWalls(areWallsOn);

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
                    // Ensure the copied element is valid and not a wall
                    const elementToCopy = sourceGrid[y]?.[x];
                    if (elementToCopy !== undefined && elementToCopy !== ELEMENT_TYPE.WALL) {
                         grid[newY][newX] = elementToCopy;
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
                    const canPlace =
                        STATIC_SOLIDS.has(elementType as any) ||
                        elementType === ELEMENT_TYPE.EMPTY ||
                        grid[newY][newX] === ELEMENT_TYPE.EMPTY;

                    if (canPlace) {
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

const explode = (x: number, y: number, radius: number) => {
    for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
            if (i * i + j * j <= radius * radius) {
                const targetX = x + i;
                const targetY = y + j;
                if (isWithinBounds(targetX, targetY) && grid[targetY][targetX] !== ELEMENT_TYPE.WALL) {
                     if (Math.random() > 0.5) {
                        set(targetX, targetY, ELEMENT_TYPE.FIRE);
                    } else {
                        set(targetX, targetY, ELEMENT_TYPE.SMOKE);
                    }
                }
            }
        }
    }
    set(x, y, ELEMENT_TYPE.FIRE);
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
            if ((y <= 0 && (element === ELEMENT_TYPE.FIRE || element === ELEMENT_TYPE.SMOKE || element === ELEMENT_TYPE.GAS)) ||
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
        if (element === ELEMENT_TYPE.FIRE || element === ELEMENT_TYPE.SMOKE || element === ELEMENT_TYPE.GAS || element === ELEMENT_TYPE.METHANE) {
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
        else if (DENSITIES[element] < DENSITIES[ELEMENT_TYPE.WALL]) {
             if (STATIC_SOLIDS.has(element as any)) return;

            const density = DENSITIES[element];

            // Viscous movement for Lava and Gel
            if ((element === ELEMENT_TYPE.LAVA && Math.random() < 0.5) || (element === ELEMENT_TYPE.GEL && Math.random() < 0.9)) {
                return; // Skip movement this frame to simulate slower flow
            }

            // Down - Check below the particle
            const below = grid[y + 1]?.[x];
            if (below !== undefined && density > DENSITIES[below] && !STATIC_SOLIDS.has(below as any)) {
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
            if (diag1 !== undefined && density > DENSITIES[diag1] && !STATIC_SOLIDS.has(diag1 as any)) {
                move(x, y, x + dir, y + 1); updatedPositions.add(`${x+dir},${y+1}`); return;
            }
            const diag2 = grid[y + 1]?.[x - dir];
            if (diag2 !== undefined && density > DENSITIES[diag2] && !STATIC_SOLIDS.has(diag2 as any)) {
                move(x, y, x - dir, y + 1); updatedPositions.add(`${x-dir},${y+1}`); return;
            }

            // Sideways (Liquids Only)
            if (element === ELEMENT_TYPE.WATER || element === ELEMENT_TYPE.ACID || element === ELEMENT_TYPE.LAVA || element === ELEMENT_TYPE.OIL || element === ELEMENT_TYPE.NITROGEN || element === ELEMENT_TYPE.GEL) {
                if (isEmpty(x + dir, y)) { move(x, y, x + dir, y); updatedPositions.add(`${x+dir},${y}`); return; }
                if (isEmpty(x - dir, y)) { move(x, y, x - dir, y); updatedPositions.add(`${x-dir},${y}`); return; }
            }
        }

        // --- Interaction Phase ---
        // This code only runs if the particle did not move in the movement phase.
        switch(element) {
            case ELEMENT_TYPE.LAVA:
                // Chance to cool down
                if (Math.random() < 0.001) {
                    set(x, y, ELEMENT_TYPE.STONE);
                    return;
                }
                // Burn/melt neighbors
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const neighbor = grid[y + j]?.[x + i];
                        if (neighbor !== undefined && !LAVA_IMMUNE_SOLIDS.has(neighbor as any)) {
                             if (neighbor === ELEMENT_TYPE.WATER) {
                                set(x, y, ELEMENT_TYPE.STONE_ASH);
                                set(x + i, y + j, ELEMENT_TYPE.SMOKE);
                                return;
                            } else if (neighbor !== ELEMENT_TYPE.EMPTY && neighbor !== ELEMENT_TYPE.LAVA) {
                                if (Math.random() < 0.2) {
                                    set(x + i, y + j, ELEMENT_TYPE.FIRE);
                                }
                            }
                        }
                    }
                }
                break;
            case ELEMENT_TYPE.ACID:
                 // Dissolve neighbors
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const neighbor = grid[y + j]?.[x + i];
                        if (neighbor === undefined || neighbor === ELEMENT_TYPE.WALL || neighbor === element || neighbor === ELEMENT_TYPE.DIAMOND) continue;
                        
                        if (is(x + i, y + j, ELEMENT_TYPE.LAVA) && element === ELEMENT_TYPE.ACID) {
                            set(x + i, y + j, ELEMENT_TYPE.SMOKE); set(x, y, ELEMENT_TYPE.SMOKE);
                        } else if (neighbor !== ELEMENT_TYPE.EMPTY && neighbor !== ELEMENT_TYPE.GEL) {
                            // Acid is less reactive with stone/ash
                             if (neighbor === ELEMENT_TYPE.STONE || neighbor === ELEMENT_TYPE.STONE_ASH || neighbor === ELEMENT_TYPE.ASH) {
                                if (Math.random() < 0.05) set(x + i, y + j, ELEMENT_TYPE.EMPTY);
                            } else {
                                 set(x + i, y + j, ELEMENT_TYPE.FIRE);
                            }

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

                        // Ignite flammable materials
                        if (neighbor === ELEMENT_TYPE.PLANT || neighbor === ELEMENT_TYPE.OIL || neighbor === ELEMENT_TYPE.GAS || neighbor === ELEMENT_TYPE.FUSE) {
                            if (Math.random() < 0.3) { 
                                const target = neighbor === ELEMENT_TYPE.FUSE ? ELEMENT_TYPE.BURNING_FUSE : ELEMENT_TYPE.FIRE;
                                set(x + i, y + j, target);
                                if (Math.random() < 0.1) { set(x, y, ELEMENT_TYPE.ASH); return; }
                            }
                        }
                        // Explode gunpowder
                        if (neighbor === ELEMENT_TYPE.GUNPOWDER) {
                            explode(x + i, y + j, 3);
                            return;
                        }

                        // Evaporate water or melt ice
                        if (neighbor === ELEMENT_TYPE.WATER) {
                            if (Math.random() < 0.5) { 
                                set(x + i, y + j, ELEMENT_TYPE.SMOKE);
                            }
                        }
                         if (neighbor === ELEMENT_TYPE.ICE) {
                            set(x, y, ELEMENT_TYPE.SMOKE); // Fire is extinguished
                            set(x + i, y + j, ELEMENT_TYPE.WATER);
                            return;
                        }

                        // Destroy virus
                        if (neighbor === ELEMENT_TYPE.VIRUS) {
                            set(x + i, y + j, ELEMENT_TYPE.EMPTY);
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
                        if (is(x + i, y + j, ELEMENT_TYPE.ICE)) {
                            set(x, y, ELEMENT_TYPE.ASH);
                            set(x + i, y + j, ELEMENT_TYPE.WATER);
                        }
                        if (is(x+i, y+j, ELEMENT_TYPE.GUNPOWDER)) {
                            explode(x+i,y+j, 2);
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
            case ELEMENT_TYPE.ICE:
                // Melt if touching something hot
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const neighbor = grid[y + j]?.[x + i];
                        if (neighbor === ELEMENT_TYPE.LAVA || neighbor === ELEMENT_TYPE.FIRE || neighbor === ELEMENT_TYPE.HOT_ASH) {
                            set(x, y, ELEMENT_TYPE.WATER);
                return;
            }
                    }
                }
                break;
            case ELEMENT_TYPE.GUNPOWDER:
                 for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                         const neighbor = grid[y + j]?.[x + i];
                        if (HEAT_SOURCES.has(neighbor as any) || neighbor === ELEMENT_TYPE.BURNING_FUSE) {
                            explode(x, y, 3);
                            return;
                        }
                    }
                }
                break;
            case ELEMENT_TYPE.VIRUS:
                // Spread to neighbors
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                        const neighbor = grid[y + j]?.[x + i];
                        if (neighbor === ELEMENT_TYPE.WATER || neighbor === ELEMENT_TYPE.SAND || neighbor === ELEMENT_TYPE.OIL || neighbor === ELEMENT_TYPE.GEL) {
                            if(Math.random() < 0.1) {
                                set(x + i, y + j, ELEMENT_TYPE.VIRUS);
                            }
                        }
                        if(HEAT_SOURCES.has(neighbor as any) || neighbor === ELEMENT_TYPE.ACID) {
                            set(x, y, ELEMENT_TYPE.EMPTY);
                            return;
                        }
                    }
                }
                break;
            case ELEMENT_TYPE.GAS:
                 if (Math.random() < 0.01) {
                    set(x, y, ELEMENT_TYPE.EMPTY);
                }
                break;
            case ELEMENT_TYPE.OIL:
                // Chance to catch fire if touching something hot
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const neighbor = grid[y + j]?.[x + i];
                        if (neighbor === ELEMENT_TYPE.LAVA || neighbor === ELEMENT_TYPE.FIRE || neighbor === ELEMENT_TYPE.HOT_ASH) {
                            if (Math.random() < 0.8) {
                                set(x, y, ELEMENT_TYPE.FIRE);
                                return;
                            }
                        }
                    }
                }
                break;
            case ELEMENT_TYPE.FUSE:
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const neighbor = grid[y+j]?.[x+i];
                        if (neighbor !== undefined && (HEAT_SOURCES.has(neighbor as any) || neighbor === ELEMENT_TYPE.BURNING_FUSE)) {
                            set(x, y, ELEMENT_TYPE.FUSE_IGNITING);
                            return;
                        }
                    }
                }
                break;
            case ELEMENT_TYPE.FUSE_IGNITING:
                if (Math.random() < 0.15) { // Faster chance to ignite
                    set(x, y, ELEMENT_TYPE.BURNING_FUSE);
                }
                break;
            case ELEMENT_TYPE.BURNING_FUSE:
                 // Spread to other fuses as a spark
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        if(is(x+i, y+j, ELEMENT_TYPE.FUSE)) {
                            // Turn neighbors directly to BURNING_FUSE for a fast chain reaction
                            set(x+i, y+j, ELEMENT_TYPE.BURNING_FUSE);
                        }
                    }
                }
                // Burn out immediately after spreading
                set(x, y, ELEMENT_TYPE.ASH);
                break;
            case ELEMENT_TYPE.NITROGEN:
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const neighbor = grid[y+j]?.[x+i];
                        if (neighbor === ELEMENT_TYPE.WATER) {
                            set(x+i, y+j, ELEMENT_TYPE.ICE);
                        } else if (neighbor === ELEMENT_TYPE.LAVA) {
                             set(x, y, ELEMENT_TYPE.GAS);
                             set(x+i, y+j, ELEMENT_TYPE.STONE);
                             return;
                        } else if (HEAT_SOURCES.has(neighbor as any)) {
                             set(x, y, ELEMENT_TYPE.GAS);
                             set(x+i, y+j, ELEMENT_TYPE.EMPTY);
                             return;
                        } else if (neighbor === ELEMENT_TYPE.PLANT) {
                            set(x+i, y+j, ELEMENT_TYPE.EMPTY);
                        }
                    }
                }
                if (Math.random() < 0.01) {
                    set(x,y, ELEMENT_TYPE.GAS);
                }
                break;
            case ELEMENT_TYPE.ANTIMATTER:
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const neighbor = grid[y+j]?.[x+i];
                        if (neighbor !== undefined && neighbor !== ELEMENT_TYPE.EMPTY && neighbor !== ELEMENT_TYPE.WALL && neighbor !== ELEMENT_TYPE.ANTIMATTER) {
                            set(x, y, ELEMENT_TYPE.EMPTY);
                            set(x+i, y+j, ELEMENT_TYPE.EMPTY);
                            return;
                        }
                    }
                }
                break;
            case ELEMENT_TYPE.BLACK_HOLE:
                 for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const neighbor = grid[y+j]?.[x+i];
                        if (neighbor !== undefined && neighbor !== ELEMENT_TYPE.EMPTY && neighbor !== ELEMENT_TYPE.WALL && neighbor !== ELEMENT_TYPE.DIAMOND) {
                            set(x+i, y+j, ELEMENT_TYPE.EMPTY);
                        }
                    }
                }
                break;
            case ELEMENT_TYPE.WATER_SPOUT:
                set(x, y - 1, ELEMENT_TYPE.WATER);
                break;
             case ELEMENT_TYPE.LAVA_SPOUT:
                set(x, y - 1, ELEMENT_TYPE.LAVA);
                break;
             case ELEMENT_TYPE.FIRE_SPOUT:
                set(x, y - 1, ELEMENT_TYPE.FIRE);
                break;
             case ELEMENT_TYPE.SMOKE_SPOUT:
                set(x, y - 1, ELEMENT_TYPE.SMOKE);
                break;
             case ELEMENT_TYPE.CLONER:
                 const clonableElements = [ELEMENT_TYPE.SAND, ELEMENT_TYPE.WATER, ELEMENT_TYPE.DIAMOND, ELEMENT_TYPE.OIL, ELEMENT_TYPE.GUNPOWDER];
                 let particleToClone: ElementType | null = null;
                 let emptySpot: {ex: number, ey: number} | null = null;

                 for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                         if (Math.abs(i) === Math.abs(j)) continue; // only check cardinal directions
                         const neighbor = grid[y+j]?.[x+i];
                         if(neighbor !== undefined && clonableElements.includes(neighbor as any)) {
                             particleToClone = neighbor;
                         } else if (neighbor !== undefined && neighbor === ELEMENT_TYPE.EMPTY) {
                             emptySpot = {ex: x+i, ey: y+j};
                         }
                    }
                 }
                 if(particleToClone !== null && emptySpot !== null) {
                    set(emptySpot.ex, emptySpot.ey, particleToClone);
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
             if (STATIC_SOLIDS.has(grid[y][x] as any)) {
                 updateElement(x, y);
            }
        }
    }

    // Iterate top-to-bottom for rising particles
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
             if (grid[y][x] === ELEMENT_TYPE.SMOKE || grid[y][x] === ELEMENT_TYPE.FIRE || grid[y][x] === ELEMENT_TYPE.GAS || grid[y][x] === ELEMENT_TYPE.METHANE) {
                 updateElement(x, y);
            }
        }
    }
}; 