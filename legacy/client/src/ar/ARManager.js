import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { showARLoading, hideARLoading, showIncompatibleOverlay, showARControls, hideARControls } from './ARUI.js';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../utils/config.js';

class ARManager {
    constructor() {
        this.container = null;
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.controller = null;
        
        this.reticle = null;
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;

        this.loadedModel = null; 
        this.placedObject = null; 
        this.sessionPhase = 'loading'; 

        // Multiplayer Sync
        this.socket = null;
        this.sessionId = null;
        this.isSyncing = false; // Prevents recursive echoing
    }

    async initAR(modelUrl, sessionId) {
        this.sessionId = sessionId;
        this.setupNetworking();
        // Compatibility test
        if ('xr' in navigator) {
            const supported = await navigator.xr.isSessionSupported('immersive-ar');
            if (!supported) {
                showIncompatibleOverlay();
                return;
            }
        } else {
            showIncompatibleOverlay();
            return;
        }

        // Show generic loading UI while downloading GLB
        const status = await showARLoading("Downloading 3D Food Model...");
        if (status === 'cancelled') return;

        // Container setup
        this.container = document.createElement('div');
        this.container.id = 'arActiveContainer';
        document.body.appendChild(this.container);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

        // Lights
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        light.position.set(0.5, 1, 0.25);
        this.scene.add(light);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(0, 2, 0);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Start fetching the specific model dynamically
        await this.loadModel(modelUrl);

        // Setup AR Button
        const btn = ARButton.createButton(this.renderer, { requiredFeatures: ['hit-test'] });
        document.body.appendChild(btn);

        // Setup Hit Test Reticle
        this.setupReticle();

        // Setup Controller
        this.controller = this.renderer.xr.getController(0);
        this.controller.addEventListener('select', this.onSelect.bind(this));
        this.scene.add(this.controller);

        // Add gesture variables for Phase 7 (Prepare for rotating/scaling)
        this.setupTouchBoilerplate();

        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Start Loop
        this.renderer.setAnimationLoop(this.render.bind(this));

        // Increment View Count in Backend
        this.incrementAnalytics(modelUrl, 'view');

        hideARLoading();
        // At this point, the user will see the browser's native "Enter AR" button created by ARButton
        
        // Clean up when leaving XR session
        this.renderer.xr.addEventListener('sessionend', () => {
            this.dispose();
        });
    }

    async incrementAnalytics(modelUrl, type) {
        try {
            // Find item by modelUrl (simplified lookup)
            // In a more robust system, we would pass the itemId directly to initAR
            await fetch(`${API_BASE_URL}/api/customer/items/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modelUrl, type })
            });
        } catch (e) {
            console.warn("Analytics tracking failed", e);
        }
    }


    async loadModel(url) {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();

            // Setup DRACO for highly compressed .glb files
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
            dracoLoader.setDecoderConfig({ type: 'wasm' });
            loader.setDRACOLoader(dracoLoader);

            loader.load(url, (gltf) => {
                this.loadedModel = gltf.scene;
                
                // Scale model to a reasonable initial physical size (e.g. 20cm across)
                // In production, we'd calculate bounding boxes, but assuming standard assets:
                this.loadedModel.scale.set(0.2, 0.2, 0.2); 
                
                // Enable shadows
                this.loadedModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Free memory
                dracoLoader.dispose();

                resolve();
            }, undefined, (e) => {
                console.error(e);
                reject(e);
            });
        });
    }

    setupNetworking() {
        if (!this.sessionId) return;
        
        // Connect to our Node Backend URL
        this.socket = io(API_BASE_URL);
        
        this.socket.on('connect', () => {
            console.log(`[Multiplayer] Connected! Joining Room: ${this.sessionId}`);
            this.socket.emit('join-ar-session', this.sessionId);
        });

        this.socket.on('sync-ar-state', (state) => {
            if (!this.placedObject) {
                // If they haven't placed their own object, place it forcibly based on incoming data
                // In a perfect system, it would share the spatial anchor, but basic WebXR requires
                // each user to place their own object relative to their anchor first.
                console.log("[Multiplayer] Peer rotated shape, but you haven't placed yours yet!");
                return;
            }

            // Temporarily ignore echoing our own updates
            this.isSyncing = true;
            
            // Apply peer's transformations
            if (state.scale) this.placedObject.scale.set(state.scale.x, state.scale.y, state.scale.z);
            if (state.rotation) this.placedObject.rotation.set(state.rotation.x, state.rotation.y, state.rotation.z);
            if (state.position) this.placedObject.position.set(state.position.x, state.position.y, state.position.z);
            
            this.isSyncing = false;
        });
    }

    broadcastState() {
        if (!this.socket || !this.sessionId || !this.placedObject || this.isSyncing) return;
        
        this.socket.emit('broadcast-ar-state', {
            sessionId: this.sessionId,
            state: {
                scale: this.placedObject.scale,
                rotation: this.placedObject.rotation,
                position: this.placedObject.position
            }
        });
    }

    setupReticle() {
        const ringGeo = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.8, transparent: true });
        this.reticle = new THREE.Mesh(ringGeo, ringMat);
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);
    }

    onSelect() {
        // If we found a surface and we haven't placed it yet
        if (this.reticle.visible && !this.placedObject) {
            this.placedObject = this.loadedModel.clone();
            this.placedObject.position.setFromMatrixPosition(this.reticle.matrix);
            
            // Random slight rotation to make it look organic
            this.placedObject.rotation.y = Math.random() * Math.PI;

            // Save initial state for the Reset feature
            this.initialPos = this.placedObject.position.clone();
            this.initialQuat = this.placedObject.quaternion.clone();
            this.initialScale = this.placedObject.scale.clone();

            this.scene.add(this.placedObject);
            this.sessionPhase = 'placed';
            
            // Show the interaction UI
            showARControls(this);
            
            // Hide the reticle permanently once placed
            this.reticle.visible = false;
        }
    }

    scaleObject(factor) {
        if (!this.placedObject) return;
        const newScale = this.placedObject.scale.x * factor;
        if(newScale > 0.05 && newScale < 1.0) {
            this.placedObject.scale.multiplyScalar(factor);
            this.broadcastState();
            // Track interaction
            this.incrementAnalytics(null, 'interaction');
        }
    }

    rotateObject(radians) {
        if (!this.placedObject) return;
        this.placedObject.rotation.y += radians;
        this.broadcastState();
        // Track interaction
        this.incrementAnalytics(null, 'interaction');
    }


    resetObject() {
        if (!this.placedObject || !this.initialPos) return;
        this.placedObject.position.copy(this.initialPos);
        this.placedObject.quaternion.copy(this.initialQuat);
        this.placedObject.scale.copy(this.initialScale);
        this.broadcastState();
    }

    takeScreenshot() {
        // Trigger a render so buffer is fresh
        this.renderer.render(this.scene, this.camera);
        
        try {
            const dataURL = this.renderer.domElement.toDataURL('image/png');
            // Create a fake anchor to trigger download
            const link = document.createElement('a');
            link.download = `AR_Screenshot_${Date.now()}.png`;
            link.href = dataURL;
            link.click();
            link.remove();
            
            // Note: Mobile WebXR natively restricts JS from capturing the physical camera feed.
            // The screenshot will capture the dynamic 3D asset on a transparent/black background.
            // For full real-world capture, users natively press their OS screen-capture buttons.
        } catch (e) {
            console.error("Screenshot failed:", e);
        }
    }

    setupTouchBoilerplate() {
        // Handled via standard DOM Overlay buttons implemented in Phase 7 ARUI.js
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render(timestamp, frame) {
        if (frame) {
            const referenceSpace = this.renderer.xr.getReferenceSpace();
            const session = this.renderer.xr.getSession();

            if (this.hitTestSourceRequested === false) {
                session.requestReferenceSpace('viewer').then((referenceSpace) => {
                    session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                        this.hitTestSource = source;
                    });
                });
                session.addEventListener('end', () => {
                    this.hitTestSourceRequested = false;
                    this.hitTestSource = null;
                });
                this.hitTestSourceRequested = true;
            }

            if (this.hitTestSource) {
                const hitTestResults = frame.getHitTestResults(this.hitTestSource);
                if (hitTestResults.length > 0 && !this.placedObject) {
                    const hit = hitTestResults[0];
                    this.reticle.visible = true;
                    this.reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
                    this.reticle.material.color.setHex(0x00ff00); // Surface found
                } else {
                    this.reticle.visible = false;
                }
            }
        }
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        // Stop Loop
        this.renderer.setAnimationLoop(null);

        // Memory Garbage Collection (Critical for Mobile)
        if (this.scene) {
            this.scene.traverse((obj) => {
                if (obj.isMesh) {
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) {
                        if (Array.isArray(obj.material)) {
                            obj.material.forEach(m => {
                                if (m.map) m.map.dispose();
                                m.dispose();
                            });
                        } else {
                            if (obj.material.map) obj.material.map.dispose();
                            obj.material.dispose();
                        }
                    }
                }
            });
            while (this.scene.children.length > 0) { 
                this.scene.remove(this.scene.children[0]); 
            }
        }

        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
        }

        if (this.socket) {
            this.socket.disconnect();
        }

        // Clean up DOM
        if (this.container) {
            this.container.remove();
        }
        const arBtn = document.getElementById('ARButton');
        if (arBtn) arBtn.remove();
        
        hideARLoading();
        hideARControls();
    }
}

export const launchAR = (modelUrl, sessionId) => {
    const manager = new ARManager();
    manager.initAR(modelUrl, sessionId);
};
