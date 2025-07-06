import './helpers';
import '../css/style.css';
import '../css/dat-gui.css';
import $ = require('jquery');
import 'jquery-mousewheel';
import _ = require('underscore');
import Visualizer = require('./visualizer/visualizer');
import * as DAT from 'dat-gui';
import World = require('./model/world');
import settings = require('./settings');

$(() => {
  console.log('🚀 Road Traffic Simulator starting...');
  
  // Wait for DOM to be fully ready
  setTimeout(() => {
    const canvas = $('<canvas />', { id: 'canvas' });
    $(document.body).append(canvas);
    
    // Verify canvas was created properly and ensure it fills the viewport
    const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    
    if (canvasElement) {
      // Force a more robust canvas size calculation
      const windowWidth = window.innerWidth || $(window).width() || 800;
      const windowHeight = window.innerHeight || $(window).height() || 600;
      
      console.log('🎪 Setting initial canvas size:', windowWidth, 'x', windowHeight);
      
      // Set canvas internal dimensions
      canvasElement.width = windowWidth;
      canvasElement.height = windowHeight;
      
      // Set CSS dimensions to match exactly
      canvasElement.style.width = windowWidth + 'px';
      canvasElement.style.height = windowHeight + 'px';
      canvasElement.style.display = 'block';
      canvasElement.style.position = 'absolute';
      canvasElement.style.top = '0';
      canvasElement.style.left = '0';
      
      const ctx = canvasElement.getContext('2d');
      
      // Test immediate drawing to verify coordinates
      if (ctx) {
        ctx.fillStyle = '#FF00FF'; // Magenta
        ctx.fillRect(0, 0, 200, 200);
        console.log('🎪 Immediate magenta square drawn at 0,0');
        
        // Test drawing at calculated center
        ctx.fillStyle = '#00FF00'; // Green  
        ctx.fillRect(windowWidth/2 - 50, windowHeight/2 - 50, 100, 100);
        console.log('🎪 Green square drawn at center:', windowWidth/2, windowHeight/2);
      }
    }
    
    // Initialize the traffic simulator with more robust timing
    setTimeout(() => {
      const world = new World();
      world.load();
      if (world.intersections.length === 0) {
        world.generateMap();
        world.carsNumber = 100;
      }
      
      (window as any).visualizer = new Visualizer(world);
      const visualizer = (window as any).visualizer;
      
      // Force a more aggressive canvas size synchronization
      const forceCanvasSync = () => {
        const windowWidth = window.innerWidth || $(window).width() || 800;
        const windowHeight = window.innerHeight || $(window).height() || 600;
        
        console.log('🔧 Forcing canvas sync to:', windowWidth, 'x', windowHeight);
        
        // IMPORTANT: Unbind tools before canvas changes to preserve event handlers
        visualizer.toolIntersectionBuilder.unbind();
        visualizer.toolRoadbuilder.unbind();
        visualizer.toolMover.unbind();
        visualizer.toolIntersectionMover.unbind();
        visualizer.toolHighlighter.unbind();
        
        // Set canvas internal dimensions
        canvasElement.width = windowWidth;
        canvasElement.height = windowHeight;
        
        // Set CSS dimensions to match exactly
        canvasElement.style.width = windowWidth + 'px';
        canvasElement.style.height = windowHeight + 'px';
        
        // Rebind tools after canvas changes
        visualizer.toolIntersectionBuilder.bind();
        visualizer.toolRoadbuilder.bind();
        visualizer.toolMover.bind();
        visualizer.toolIntersectionMover.bind();
        visualizer.toolHighlighter.bind();
        
        // Verify the dimensions match
        const rect = canvasElement.getBoundingClientRect();
        console.log('🔧 After sync - Canvas:', canvasElement.width, 'x', canvasElement.height);
        console.log('🔧 After sync - CSS:', canvasElement.style.width, 'x', canvasElement.style.height);
        console.log('🔧 After sync - BoundingRect:', rect.width, 'x', rect.height);
        
        visualizer.updateCanvasSize();
      };
      
      // Force canvas size update after all initialization is complete
      forceCanvasSync();
      
      // Force a window resize event to synchronize coordinate systems
      setTimeout(() => {
        console.log('🎪 Forcing window resize event to sync coordinates');
        window.dispatchEvent(new Event('resize'));
        forceCanvasSync(); // Sync again after resize
      }, 50);
      
      // Force tools to be rebound after everything is set up
      setTimeout(() => {
        visualizer.ensureToolsAreBound();
        console.log('🎪 Final tool binding completed');
        
        // Force another canvas size update to ensure coordinates are synchronized
        visualizer.updateCanvasSize();
        
        // Check tool binding status
        console.log('🎪 Final tool binding check:', {
          intersectionBuilder: visualizer.toolIntersectionBuilder.isBound,
          roadBuilder: visualizer.toolRoadbuilder.isBound,
          mover: visualizer.toolMover.isBound,
          intersectionMover: visualizer.toolIntersectionMover.isBound,
          highlighter: visualizer.toolHighlighter.isBound
        });
      }, 100);
      
      visualizer.start();
      console.log('🚀 Application ready');
      console.log('🎮 Controls: Shift+Click (intersections), Shift+Drag (roads), Wheel (zoom), Drag (pan)');
      
      // Keep essential test functions but simplify logging
      (window as any).testIntersection = () => {
        const mockEvent = {
          shiftKey: true,
          clientX: 300,
          clientY: 300,
          pageX: 300,
          pageY: 300,
          stopImmediatePropagation: () => {}
        };
        visualizer.toolIntersectionBuilder.mousedown(mockEvent);
        visualizer.toolIntersectionBuilder.mouseup(mockEvent);
        console.log('Test intersection created');
      };
      
      (window as any).logToolStates = () => {
        console.log('Tool states:', {
          intersectionBuilder: visualizer.toolIntersectionBuilder.isBound,
          roadBuilder: visualizer.toolRoadbuilder.isBound,
          mover: visualizer.toolMover.isBound,
          intersectionMover: visualizer.toolIntersectionMover.isBound,
          highlighter: visualizer.toolHighlighter.isBound
        });
      };
      
      // Add a manual canvas sync function you can call from console
      (window as any).fixCanvas = () => {
        console.log('🔧 Manual canvas fix triggered');
        forceCanvasSync();
        visualizer.ensureToolsAreBound();
        console.log('🔧 Canvas fix complete');
      };
      
      // Add a manual fix function to trigger coordinate synchronization
      (window as any).fixCoordinates = () => {
        console.log('🔧 Manual coordinate fix triggered');
        visualizer.updateCanvasSize();
        window.dispatchEvent(new Event('resize'));
        setTimeout(() => {
          visualizer.ensureToolsAreBound();
          console.log('🔧 Coordinate fix completed');
        }, 100);
      };

      // ...existing code...
      const gui = new DAT.GUI();
      
      // Add all controls directly to the main GUI panel (no folders)
      // World controls
      gui.add(world, 'save');
      gui.add(world, 'load');
      gui.add(world, 'clear');
      gui.add(world, 'generateMap');
      gui.add(world, 'carsNumber').min(0).max(200).step(1).listen();
      gui.add(world, 'instantSpeed').step(0.00001).listen();
      
      // Visualizer controls
      gui.add(visualizer, 'running').listen();
      gui.add(visualizer, 'debug').listen();
      gui.add(visualizer.zoomer, 'scale', 0.1, 2).listen();
      gui.add(visualizer, 'timeFactor', 0.1, 10).listen();
      
      // Settings controls
      gui.add(settings, 'lightsFlipInterval', 0, 400, 0.01).listen();
    }, 50); // Small delay to ensure DOM is ready
    
  }, 10); // Small delay for DOM readiness
});
