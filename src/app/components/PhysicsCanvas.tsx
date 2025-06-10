'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Draggable from 'react-draggable';
import * as world from '@/app/simulation/world';
import { ELEMENT_TYPE } from '@/app/simulation/world';

const MENU_STORAGE_KEY = 'sandSimMenuState';

const PhysicsCanvas = () => {
    // --- State Management ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Initialize menuState to null to prevent SSR/hydration issues
    const [menuState, setMenuState] = useState<{
        position: { x: number; y: number };
        buttonSize: number;
    } | null>(null);
    
    const [selectedElement, setSelectedElement] = useState<world.ElementType>(ELEMENT_TYPE.SAND);
    const [brushSize, setBrushSize] = useState(20);
    const [speed, setSpeed] = useState(1);
    const [wallsOn, setWallsOn] = useState(true);

    // Refs for real-time values in animation loop
    const selectedElementRef = useRef(selectedElement);
    useEffect(() => { selectedElementRef.current = selectedElement; }, [selectedElement]);
    const brushSizeRef = useRef(brushSize);
    useEffect(() => { brushSizeRef.current = brushSize; }, [brushSize]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isMouseDownRef = useRef(false);
    const mousePositionRef = useRef<{ x: number; y: number } | null>(null);
    const lastDrawnPositionRef = useRef<{ x: number; y: number } | null>(null);

    // --- Load & Save ---
    useEffect(() => {
        // Load menu state from local storage or set default
        const savedMenuState = localStorage.getItem(MENU_STORAGE_KEY);
        if (savedMenuState) {
            try {
                const parsed = JSON.parse(savedMenuState);
                if (parsed.position && parsed.buttonSize) {
                    setMenuState(parsed);
                } else {
                     setMenuState({
                        position: { x: window.innerWidth - 100, y: 40 },
                        buttonSize: 50,
                    });
                }
            } catch (e) {
                console.error("Failed to parse menu state:", e);
                 setMenuState({
                    position: { x: window.innerWidth - 100, y: 40 },
                    buttonSize: 50,
                });
            }
        } else {
             setMenuState({
                position: { x: window.innerWidth - 100, y: 40 },
                buttonSize: 50,
            });
        }
        
        // Initialize world and canvas
        const canvas = canvasRef.current;
        if (!canvas) return;
        world.init(window.innerWidth, window.innerHeight);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, []);

    useEffect(() => {
        // Autosave menu state
        const saveInterval = setInterval(() => {
            localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menuState));
            world.saveWorld();
        }, 1000);
        return () => clearInterval(saveInterval);
    }, [menuState]);

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
    
    // --- Main Simulation Loop ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const grid = world.getGrid();
        const cellSize = world.getCellSize();
        let animationFrameId: number;

        const drawGrid = () => {
            if (!grid) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let y = 0; y < grid.length; y++) {
                for (let x = 0; x < grid[y].length; x++) {
                    const element = grid[y][x];
                    if (element !== ELEMENT_TYPE.EMPTY) {
                        ctx.fillStyle = world.ELEMENT_COLORS[element];
                        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    }
                }
            }
        };

        const simulationLoop = () => {
            // Handle drawing from user input
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
            // Update and draw world
            for (let i = 0; i < speed; i++) {
                world.update();
            }
            drawGrid();
            animationFrameId = requestAnimationFrame(simulationLoop);
        };
        simulationLoop();

        return () => cancelAnimationFrame(animationFrameId);
    }, [speed, drawLine]);
    
    // --- Event Listeners ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const getMousePos = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const cellSize = world.getCellSize();
            return {
                x: Math.floor((e.clientX - rect.left) / cellSize),
                y: Math.floor((e.clientY - rect.top) / cellSize),
            };
        };
        const handleMouseDown = (e: MouseEvent) => {
            // Prevent drawing when interacting with UI
            if ((e.target as HTMLElement).closest('.floating-menu-container')) return;
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

        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseout', (e) => {
             if (e.relatedTarget === null) handleMouseUp();
        });
        canvas.addEventListener('mousemove', handleMouseMove);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        world.setWalls(wallsOn);
    }, [wallsOn]);

    // --- Menu Rendering ---
    if (!menuState) {
        return <canvas ref={canvasRef} style={{ display: 'block' }} />; // Render just canvas while loading state
    }

    const menuWidth = 350;
    const menuHeight = 400;
    const menuGap = 10;
    const { position, buttonSize } = menuState;
    const goesRight = position.x < window.innerWidth / 2;
    const goesUp = position.y > window.innerHeight / 2;

    const menuStyle: React.CSSProperties = {
        position: 'absolute',
        width: `${menuWidth}px`,
        maxHeight: `${menuHeight}px`,
        top: goesUp ? `auto` : `${position.y + buttonSize + menuGap}px`,
        bottom: goesUp ? `${window.innerHeight - position.y + menuGap}px` : `auto`,
        left: goesRight ? `${position.x}px` : 'auto',
        right: goesRight ? 'auto' : `${window.innerWidth - position.x - buttonSize}px`,
        backgroundColor: 'rgba(30, 30, 30, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        color: 'white',
        padding: '15px',
        display: isMenuOpen ? 'flex' : 'none',
        flexDirection: 'column',
        gap: '20px',
        zIndex: 1000,
        overflowY: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transformOrigin: `${goesRight ? 'top left' : 'top right'} ${goesUp ? 'bottom' : 'top'}`,
        transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
        transform: isMenuOpen ? 'scale(1)' : 'scale(0.95)',
        opacity: isMenuOpen ? 1 : 0,
    };
    
    const getButtonClass = (el: world.ElementType) => {
        return selectedElement === el ? 'selected-element-glow' : '';
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />

            <div className="floating-menu-container">
                <Draggable
                    position={menuState.position}
                    onStop={(_, data) => setMenuState(prev => prev ? { ...prev, position: { x: data.x, y: data.y } } : prev)}
                    handle=".floating-menu-button"
                >
                    <div style={{ position: 'absolute', zIndex: 1001, cursor: 'pointer' }}>
                         <div
                            className="floating-menu-button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            style={{
                                width: `${buttonSize}px`,
                                height: `${buttonSize}px`,
                                borderRadius: '50%',
                                backgroundColor: '#282c34',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                transition: 'background-color 0.2s ease',
                            }}
                        >
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
                    </div>
                </Draggable>

                <div style={menuStyle}>
                     {/* Element Groups */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <h3 className="title is-6 has-text-white">Powder</h3>
                            <div className="buttons">
                                <button className={`button is-small ${getButtonClass(ELEMENT_TYPE.SAND)}`} onClick={() => setSelectedElement(ELEMENT_TYPE.SAND)}>Sand</button>
                                <button className={`button is-small ${getButtonClass(ELEMENT_TYPE.HOT_ASH)}`} onClick={() => setSelectedElement(ELEMENT_TYPE.HOT_ASH)}>Ash</button>
                                <button className={`button is-small ${getButtonClass(ELEMENT_TYPE.STONE_ASH)}`} onClick={() => setSelectedElement(ELEMENT_TYPE.STONE_ASH)}>Stone Ash</button>
                            </div>
                        </div>
                        <div>
                            <h3 className="title is-6 has-text-white">Liquid</h3>
                            <div className="buttons">
                                <button className={`button is-small ${getButtonClass(ELEMENT_TYPE.WATER)}`} onClick={() => setSelectedElement(ELEMENT_TYPE.WATER)}>Water</button>
                                <button className={`button is-small ${getButtonClass(ELEMENT_TYPE.LAVA)}`} onClick={() => setSelectedElement(ELEMENT_TYPE.LAVA)}>Lava</button>
                                <button className={`button is-small ${getButtonClass(ELEMENT_TYPE.ACID)}`} onClick={() => setSelectedElement(ELEMENT_TYPE.ACID)}>Acid</button>
                            </div>
                        </div>
                        <div>
                            <h3 className="title is-6 has-text-white">Solid</h3>
                            <div className="buttons">
                                <button className={`button is-small ${getButtonClass(ELEMENT_TYPE.WALL)}`} onClick={() => setSelectedElement(ELEMENT_TYPE.WALL)}>Wall</button>
                                <button className={`button is-small ${getButtonClass(ELEMENT_TYPE.PLANT)}`} onClick={() => setSelectedElement(ELEMENT_TYPE.PLANT)}>Plant</button>
                            </div>
                        </div>
                        <div>
                            <h3 className="title is-6 has-text-white">Gas</h3>
                            <div className="buttons">
                                <button className={`button is-small ${getButtonClass(ELEMENT_TYPE.FIRE)}`} onClick={() => setSelectedElement(ELEMENT_TYPE.FIRE)}>Fire</button>
                                <button className={`button is-small ${getButtonClass(ELEMENT_TYPE.SMOKE)}`} onClick={() => setSelectedElement(ELEMENT_TYPE.SMOKE)}>Smoke</button>
                            </div>
                        </div>
                    </div>

                    {/* Sliders */}
                    <div>
                         <div className="field">
                            <label className="label is-small has-text-white">Brush Size</label>
                            <input className="slider is-fullwidth" type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} />
                        </div>
                         <div className="field">
                            <label className="label is-small has-text-white">Menu Size</label>
                             <input className="slider is-fullwidth" type="range" min="30" max="80" value={menuState.buttonSize} onChange={(e) => setMenuState(prev => prev ? {...prev, buttonSize: parseInt(e.target.value)} : prev)} />
                        </div>
                         <div className="field">
                            <label className="label is-small has-text-white">Sim Speed</label>
                            <input className="slider is-fullwidth" type="range" min="0" max="5" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="field is-grouped">
                        <div className="control is-expanded">
                             <button className={`button is-danger is-outlined is-fullwidth is-small ${getButtonClass(ELEMENT_TYPE.EMPTY)}`} onClick={() => setSelectedElement(ELEMENT_TYPE.EMPTY)}>Eraser</button>
                        </div>
                        <div className="control is-expanded">
                            <button className={`button is-fullwidth is-small ${wallsOn ? 'is-link' : 'is-light'}`} onClick={() => setWallsOn(!wallsOn)}>Walls</button>
                        </div>
                        <div className="control is-expanded">
                             <button className="button is-warning is-fullwidth is-small" onClick={() => world.clear()}>Reset</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhysicsCanvas; 