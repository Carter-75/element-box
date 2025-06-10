'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as world from '@/app/simulation/world';
import { ELEMENT_TYPE } from '@/app/simulation/world';

// --- Storage Keys ---
const UI_STATE_KEY = 'sandSimUiState_v3';
const SIM_CONTROLS_KEY = 'sandSimControlsState_v3';

// Final, rebuilt component on a stable foundation.
const PhysicsCanvas = () => {
    // --- Core State ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isStateLoaded, setIsStateLoaded] = useState(false);
    
    // --- Simulation & Menu State ---
    const [menuState, setMenuState] = useState({
        position: { x: window.innerWidth - 100, y: 50 },
        buttonSize: 60,
    });
    const [selectedElement, setSelectedElement] = useState<world.ElementType>(ELEMENT_TYPE.SAND);
    const [brushSize, setBrushSize] = useState(20);
    const [speed, setSpeed] = useState(1);
    const [wallsOn, setWallsOn] = useState(true);

    // --- Refs for Performance & Direct Access ---
    const draggableRef = useRef<HTMLDivElement>(null);
    const menuPanelRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isMouseDownRef = useRef(false);
    const mousePositionRef = useRef<{ x: number; y: number } | null>(null);
    const lastDrawnPositionRef = useRef<{ x: number; y: number } | null>(null);
    const selectedElementRef = useRef(selectedElement);
    const brushSizeRef = useRef(brushSize);
    const dragStartRef = useRef({ x: 0, y: 0, initialTop: 0, initialLeft: 0 });
    const wallsOnRef = useRef(wallsOn);

    // --- Load All State From Local Storage On Mount ---
    useEffect(() => {
        // Load UI State
        const savedUiState = localStorage.getItem(UI_STATE_KEY);
        if (savedUiState) {
            try {
                const parsed = JSON.parse(savedUiState);
                setMenuState({
                    position: parsed.position || { x: window.innerWidth - 100, y: 50 },
                    buttonSize: parsed.buttonSize || 60,
                });
                setIsMenuOpen(parsed.isMenuOpen || false);
            } catch (e) { console.error("Failed to load UI state:", e); }
        }

        // Load Sim Controls State
        const savedSimControls = localStorage.getItem(SIM_CONTROLS_KEY);
        if (savedSimControls) {
            try {
                const parsed = JSON.parse(savedSimControls);
                setSelectedElement(parsed.selectedElement ?? ELEMENT_TYPE.SAND);
                setWallsOn(parsed.wallsOn ?? true);
                setBrushSize(parsed.brushSize || 20);
                setSpeed(parsed.speed ?? 1);
            } catch (e) { console.error("Failed to load sim controls state:", e); }
        }

        setIsStateLoaded(true); // Signal that loading is complete
    }, []);

    // --- Update Refs and Save State to Local Storage ---
    useEffect(() => { selectedElementRef.current = selectedElement; }, [selectedElement]);
    useEffect(() => { brushSizeRef.current = brushSize; }, [brushSize]);
    useEffect(() => {
        world.setWalls(wallsOn);
        wallsOnRef.current = wallsOn;
    }, [wallsOn]);

    // Save UI state
    useEffect(() => {
        if (!isStateLoaded) return; // Prevent saving on initial render
        const uiState = {
            position: menuState.position,
            buttonSize: menuState.buttonSize,
            isMenuOpen: isMenuOpen,
        };
        localStorage.setItem(UI_STATE_KEY, JSON.stringify(uiState));
    }, [isStateLoaded, menuState, isMenuOpen]);

    // Save sim controls
    useEffect(() => {
        if (!isStateLoaded) return; // Prevent saving on initial render
        const simControls = {
            selectedElement,
            wallsOn,
            brushSize,
            speed,
        };
        localStorage.setItem(SIM_CONTROLS_KEY, JSON.stringify(simControls));
    }, [isStateLoaded, selectedElement, wallsOn, brushSize, speed]);

    // Save world grid periodically
    useEffect(() => {
        const saveInterval = setInterval(() => {
            world.saveWorld();
        }, 1000);
        return () => clearInterval(saveInterval);
    }, []);

    // --- Unified Setup & Resize Effect ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const setupCanvas = () => {
            world.init(window.innerWidth, window.innerHeight, wallsOnRef.current);
            
            const worldWidthPx = world.getWidth() * world.getCellSize();
            const worldHeightPx = world.getHeight() * world.getCellSize();

            canvas.width = worldWidthPx;
            canvas.height = worldHeightPx;
            canvas.style.width = `${worldWidthPx}px`;
            canvas.style.height = `${worldHeightPx}px`;
            
            setMenuState(prev => ({
                ...prev,
                position: {
                    x: Math.min(prev.position.x, window.innerWidth - prev.buttonSize - 10),
                    y: Math.min(prev.position.y, window.innerHeight - prev.buttonSize - 10),
                }
            }));
        };
        
        setupCanvas(); // Initial setup

        window.addEventListener('resize', setupCanvas);
        return () => window.removeEventListener('resize', setupCanvas);
    }, []); // This now re-initializes the world if walls are toggled.

    // --- Drawing Logic ---
    const drawLine = useCallback((x0: number, y0: number, x1: number, y1: number) => {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            world.setElement(x0, y0, selectedElementRef.current, brushSizeRef.current);
            if (x0 === x1 && y0 === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
    }, []);

    // --- Main Simulation & Render Loop ---
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        let animationFrameId: number;
        
        const renderLoop = () => {
            const grid = world.getGrid();
            if (!grid) {
                animationFrameId = requestAnimationFrame(renderLoop);
                return;
            }

            for (let i = 0; i < speed; i++) {
                world.update();
            }

            if (isMouseDownRef.current && mousePositionRef.current) {
                const currentPos = mousePositionRef.current;
                const lastPos = lastDrawnPositionRef.current;
                if (lastPos && (lastPos.x !== currentPos.x || lastPos.y !== currentPos.y)) {
                    drawLine(lastPos.x, lastPos.y, currentPos.x, currentPos.y);
                } else {
                    world.setElement(currentPos.x, currentPos.y, selectedElementRef.current, brushSizeRef.current);
                }
                lastDrawnPositionRef.current = currentPos;
            }

            const cellSize = world.getCellSize();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let y = 0; y < grid.length; y++) {
                for (let x = 0; x < grid[y].length; x++) {
                    const element = grid[y][x];
                    if (element !== ELEMENT_TYPE.EMPTY) {
                        let color = world.ELEMENT_COLORS[element];

                        if (element === ELEMENT_TYPE.FIRE) {
                            color = Math.random() < 0.5 ? '#ff5000' : '#ff0000'; // Orange or Red
                        }
                        
                        if (color) {
                            ctx.fillStyle = color;
                            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                        }
                    }
                }
            }
            animationFrameId = requestAnimationFrame(renderLoop);
        };
        renderLoop();

        return () => cancelAnimationFrame(animationFrameId);
    }, [speed, drawLine]);
    
    // --- Mouse Listeners for Drawing ---
    useEffect(() => {
        const getMousePos = (e: MouseEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return { x: 0, y: 0 };
            const rect = canvas.getBoundingClientRect();
            const cellSize = world.getCellSize();
            return {
                x: Math.floor((e.clientX - rect.left) / cellSize),
                y: Math.floor((e.clientY - rect.top) / cellSize),
            };
        };

        const handleMouseDown = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest('.physics-menu-container')) return;
            isMouseDownRef.current = true;
            mousePositionRef.current = getMousePos(e);
        };
        const handleMouseUp = () => {
            isMouseDownRef.current = false;
            lastDrawnPositionRef.current = null;
        };
        const handleMouseMove = (e: MouseEvent) => {
            if(isMouseDownRef.current) {
                mousePositionRef.current = getMousePos(e);
            }
        };

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // --- Custom Drag Logic ---
    const handleDragStart = (e: React.MouseEvent) => {
        const draggableElem = draggableRef.current;
        if (!draggableElem) return;
        
        e.preventDefault();
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            initialLeft: draggableElem.offsetLeft,
            initialTop: draggableElem.offsetTop,
        };
        setIsDragging(true);
    };

    const updateMenuPanelPosition = useCallback((newPos: { x: number; y: number }) => {
        const menuPanel = menuPanelRef.current;
        if (!menuPanel) return;

        const buttonSize = menuState.buttonSize;
        const isMenuBelow = newPos.y < (window.innerHeight / 2);
        menuPanel.style.top = isMenuBelow ? `${buttonSize + 10}px` : 'auto';
        menuPanel.style.bottom = isMenuBelow ? 'auto' : `${buttonSize + 10}px`;

        const menuWidth = 350;
        const screenPadding = 10;
        const buttonRightEdgeX = newPos.x + buttonSize;

        if (buttonRightEdgeX - menuWidth < screenPadding) {
            menuPanel.style.left = '0px';
            menuPanel.style.right = 'auto';
        } else {
            menuPanel.style.right = '0px';
            menuPanel.style.left = 'auto';
        }
    }, [menuState.buttonSize]);

    useEffect(() => {
        if (isMenuOpen) {
            updateMenuPanelPosition(menuState.position);
        }
    }, [isMenuOpen, menuState.position, updateMenuPanelPosition]);

    useEffect(() => {
        const handleDragMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const { x: startX, y: startY, initialLeft, initialTop } = dragStartRef.current;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const newLeft = initialLeft + dx;
            const newTop = initialTop + dy;

            const draggableElem = draggableRef.current;
            if (!draggableElem) return;

            draggableElem.style.left = `${newLeft}px`;
            draggableElem.style.top = `${newTop}px`;

            updateMenuPanelPosition({ x: newLeft, y: newTop });
        };

        const handleDragEnd = (e: MouseEvent) => {
            if (!isDragging) return;
            setIsDragging(false);

            const draggableElem = draggableRef.current;
            if (!draggableElem) return;
            
            setMenuState(prev => ({
                ...prev,
                position: { x: draggableElem.offsetLeft, y: draggableElem.offsetTop },
            }));

            const { x: startX, y: startY } = dragStartRef.current;
            if (Math.abs(e.clientX - startX) < 5 && Math.abs(e.clientY - startY) < 5) {
                setIsMenuOpen(prev => !prev);
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging, menuState.buttonSize, updateMenuPanelPosition]);

    // --- Reset Function ---
    const handleReset = () => {
        // Clear local storage
        localStorage.removeItem(UI_STATE_KEY);
        localStorage.removeItem(SIM_CONTROLS_KEY);

        // Clear world and reload page for a clean slate
        world.clear();
        window.location.reload();
    };

    // --- Styling ---
    const menuPanelStyle: React.CSSProperties = {
        position: 'absolute',
        width: '350px',
        backgroundColor: 'rgba(30, 30, 30, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        color: 'white',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        zIndex: 1000,
        border: '1px solid rgba(255, 255, 255, 0.1)',
    };

    // --- Render ---
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ background: '#222' }} />
            
            <div 
                ref={draggableRef} 
                className="physics-menu-container"
                style={{
                    position: 'absolute',
                    zIndex: 1001,
                    width: menuState.buttonSize,
                    height: menuState.buttonSize,
                    top: menuState.position.y,
                    left: menuState.position.x,
                    cursor: isDragging ? 'grabbing' : 'grab',
                }}
            >
                {/* The Draggable Button */}
                <div
                    className="menu-drag-handle"
                    onMouseDown={handleDragStart}
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        backgroundColor: '#282c34',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    }}
                >
                    {/* Hamburger/Close Icon */}
                    <div style={{ width: '50%', height: '50%', position: 'relative' }}>
                        <span style={{
                            display: 'block', position: 'absolute', height: '2px', width: '100%',
                            background: 'white', borderRadius: '2px', top: '35%',
                            transition: 'transform 0.3s ease-in-out',
                            transform: isMenuOpen ? 'translateY(4px) rotate(45deg)' : 'none'
                        }} />
                            <span style={{
                            display: 'block', position: 'absolute', height: '2px', width: '100%',
                            background: 'white', borderRadius: '2px', top: '65%',
                            transition: 'transform 0.3s ease-in-out',
                            transform: isMenuOpen ? 'translateY(-4px) rotate(-45deg)' : 'none'
                        }} />
                    </div>
                </div>

                {/* The Menu Panel */}
                {isMenuOpen && (
                    <div ref={menuPanelRef} style={menuPanelStyle}>
                        {/* Element Selection */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <h3 className="title is-6 has-text-white">Powder</h3>
                                <div className="buttons">
                                    <button className={`button is-small ${selectedElement === ELEMENT_TYPE.SAND ? 'is-link' : ''}`} onClick={() => setSelectedElement(ELEMENT_TYPE.SAND)}>Sand</button>
                                    <button className={`button is-small ${selectedElement === ELEMENT_TYPE.HOT_ASH ? 'is-link' : ''}`} onClick={() => setSelectedElement(ELEMENT_TYPE.HOT_ASH)}>Ash</button>
                                    <button className={`button is-small ${selectedElement === ELEMENT_TYPE.STONE_ASH ? 'is-link' : ''}`} onClick={() => setSelectedElement(ELEMENT_TYPE.STONE_ASH)}>Stone Ash</button>
                                </div>
                            </div>
                            <div>
                                <h3 className="title is-6 has-text-white">Liquid</h3>
                                <div className="buttons">
                                    <button className={`button is-small ${selectedElement === ELEMENT_TYPE.WATER ? 'is-link' : ''}`} onClick={() => setSelectedElement(ELEMENT_TYPE.WATER)}>Water</button>
                                    <button className={`button is-small ${selectedElement === ELEMENT_TYPE.LAVA ? 'is-link' : ''}`} onClick={() => setSelectedElement(ELEMENT_TYPE.LAVA)}>Lava</button>
                                    <button className={`button is-small ${selectedElement === ELEMENT_TYPE.ACID ? 'is-link' : ''}`} onClick={() => setSelectedElement(ELEMENT_TYPE.ACID)}>Acid</button>
                                </div>
                            </div>
                            <div>
                                <h3 className="title is-6 has-text-white">Solid</h3>
                                <div className="buttons">
                                    <button className={`button is-small ${selectedElement === ELEMENT_TYPE.WALL ? 'is-link' : ''}`} onClick={() => setSelectedElement(ELEMENT_TYPE.WALL)}>Wall</button>
                                    <button className={`button is-small ${selectedElement === ELEMENT_TYPE.PLANT ? 'is-link' : ''}`} onClick={() => setSelectedElement(ELEMENT_TYPE.PLANT)}>Plant</button>
                                </div>
                            </div>
                            <div>
                                <h3 className="title is-6 has-text-white">Gas</h3>
                                <div className="buttons">
                                    <button className={`button is-small ${selectedElement === ELEMENT_TYPE.FIRE ? 'is-link' : ''}`} onClick={() => setSelectedElement(ELEMENT_TYPE.FIRE)}>Fire</button>
                                    <button className={`button is-small ${selectedElement === ELEMENT_TYPE.SMOKE ? 'is-link' : ''}`} onClick={() => setSelectedElement(ELEMENT_TYPE.SMOKE)}>Smoke</button>
                                </div>
                            </div>
                        </div>
                        {/* Controls */}
                        <div>
                            <div className="field">
                                <label className="label is-small has-text-white">Brush Size: {brushSize}</label>
                                <input className="slider is-fullwidth" type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} />
                            </div>
                            <div className="field">
                                <label className="label is-small has-text-white">Menu Size: {menuState.buttonSize}</label>
                                <input className="slider is-fullwidth" type="range" min="30" max="80" value={menuState.buttonSize} onChange={(e) => setMenuState(prev => ({...prev, buttonSize: parseInt(e.target.value)}))} />
                            </div>
                            <div className="field">
                                <label className="label is-small has-text-white">Sim Speed: {speed}</label>
                                <input className="slider is-fullwidth" type="range" min="0" max="10" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} />
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="field is-grouped">
                            <div className="control is-expanded">
                                <button className={`button is-danger is-outlined is-fullwidth is-small`} onClick={() => setSelectedElement(ELEMENT_TYPE.EMPTY)}>Eraser</button>
                            </div>
                            <div className="control is-expanded">
                                <button className={`button is-fullwidth is-small ${wallsOn ? 'is-link' : 'is-light'}`} onClick={() => setWallsOn(!wallsOn)}>Walls</button>
                            </div>
                            <div className="control is-expanded">
                                <button className="button is-warning is-fullwidth is-small" onClick={handleReset}>Reset</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhysicsCanvas;
