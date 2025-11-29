// Main Three.js scene setup
let scene, camera, renderer, model, controls;
let isAnimating = true;
let wireframe = false;

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05060a);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('canvas'),
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00eaff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffdb00, 0.5, 100);
    pointLight.position.set(-5, -5, 5);
    scene.add(pointLight);
    
    // Create a complex geometric model
    createModel();
    
    // Add orbit controls
    setupControls();
    
    // Add event listeners
    setupEventListeners();
    
    // Start animation loop
    animate();
}

// Create an interesting 3D model
function createModel() {
    // Clear existing model
    if (model) scene.remove(model);
    
    // Create a group to hold all parts
    model = new THREE.Group();
    
    // Main torus knot
    const geometry = new THREE.TorusKnotGeometry(1, 0.4, 128, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x00eaff,
        shininess: 100,
        specular: 0xffffff
    });
    
    const torusKnot = new THREE.Mesh(geometry, material);
    model.add(torusKnot);
    
    // Add smaller orbiting spheres
    const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const sphereMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffdb00,
        shininess: 50
    });
    
    for (let i = 0; i < 8; i++) {
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        const angle = (i / 8) * Math.PI * 2;
        sphere.position.x = Math.cos(angle) * 2;
        sphere.position.y = Math.sin(angle) * 2;
        sphere.position.z = Math.sin(angle) * 0.5;
        model.add(sphere);
    }
    
    // Add the model to the scene
    scene.add(model);
}

// Setup orbit controls
function setupControls() {
    // Simple mouse controls (you could use OrbitControls from three.js examples for more advanced controls)
    let isMouseDown = false;
    let previousMousePosition = {
        x: 0,
        y: 0
    };
    
    const canvas = document.getElementById('canvas');
    
    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    });
    
    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isMouseDown || !model) return;
        
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };
        
        model.rotation.y += deltaMove.x * 0.01;
        model.rotation.x += deltaMove.y * 0.01;
        
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    });
    
    // Zoom with scroll wheel
    canvas.addEventListener('wheel', (e) => {
        camera.position.z += e.deltaY * 0.01;
        camera.position.z = Math.max(2, Math.min(10, camera.position.z));
    });
}

// Setup UI event listeners
function setupEventListeners() {
    // Reset view button
    document.getElementById('resetBtn').addEventListener('click', () => {
        camera.position.set(0, 0, 5);
        if (model) {
            model.rotation.set(0, 0, 0);
        }
    });
    
    // Toggle wireframe button
    document.getElementById('wireframeBtn').addEventListener('click', () => {
        wireframe = !wireframe;
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.wireframe = wireframe;
            }
        });
    });
    
    // Toggle animation button
    document.getElementById('animationBtn').addEventListener('click', () => {
        isAnimating = !isAnimating;
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (model && isAnimating) {
        // Rotate the main model
        model.rotation.y += 0.005;
        
        // Animate the orbiting spheres
        model.children.forEach((child, index) => {
            if (index > 0) { // Skip the first child (torus knot)
                const time = Date.now() * 0.001;
                const angle = (index / (model.children.length - 1)) * Math.PI * 2 + time;
                child.position.x = Math.cos(angle) * 2;
                child.position.y = Math.sin(angle) * 2;
                child.position.z = Math.sin(angle + time) * 0.5;
                child.rotation.x += 0.02;
                child.rotation.y += 0.03;
            }
        });
    }
    
    renderer.render(scene, camera);
}

// Initialize the application
init();