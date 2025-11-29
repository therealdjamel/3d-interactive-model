// Three.js Cyberpunk Scene
let scene, camera, renderer, controls;
let model, mixer;
let isAnimating = true;
let wireframe = false;
let colorScheme = 0;

// Color schemes
const colorSchemes = [
    { primary: 0x00f3ff, secondary: 0xff00ff, accent: 0xffeb00 }, // Cyberpunk Blue/Pink
    { primary: 0xff00ff, secondary: 0x00ff88, accent: 0x00f3ff }, // Neon Pink/Green
    { primary: 0xffeb00, secondary: 0x00f3ff, accent: 0xff00ff }, // Yellow/Blue
    { primary: 0x00ff88, secondary: 0xffeb00, accent: 0xff00ff }  // Green/Yellow
];

async function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05060a);
    scene.fog = new THREE.Fog(0x05060a, 10, 50);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('canvas'),
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add lights
    setupLights();

    // Add environment
    createEnvironment();

    // Load or create model
    await loadOrCreateModel();

    // Setup controls
    setupControls();

    // Setup event listeners
    setupEventListeners();

    // Hide loading screen
    hideLoading();

    // Start animation loop
    animate();
}

function setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(colorSchemes[0].primary, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Point lights for cyberpunk effect
    const pointLight1 = new THREE.PointLight(colorSchemes[0].secondary, 0.8, 50);
    pointLight1.position.set(-10, 5, -5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(colorSchemes[0].accent, 0.6, 50);
    pointLight2.position.set(10, -5, 5);
    scene.add(pointLight2);

    // Hemisphere light for ambient color
    const hemisphereLight = new THREE.HemisphereLight(0x001122, 0x220011, 0.3);
    scene.add(hemisphereLight);
}

function createEnvironment() {
    // Create a grid floor
    const gridHelper = new THREE.GridHelper(50, 50, colorSchemes[0].primary, colorSchemes[0].primary);
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Add some floating cubes for atmosphere
    for (let i = 0; i < 20; i++) {
        const size = Math.random() * 0.5 + 0.1;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshPhongMaterial({
            color: Math.random() > 0.5 ? colorSchemes[0].secondary : colorSchemes[0].accent,
            emissive: Math.random() > 0.7 ? colorSchemes[0].primary : 0x000000,
            emissiveIntensity: 0.2
        });

        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 30
        );
        cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        scene.add(cube);
    }
}

async function loadOrCreateModel() {
    // Try to load external model first
    try {
        await loadExternalModel();
    } catch (error) {
        console.log("External model not found, creating procedural model...");
        createProceduralModel();
    }
}

async function loadExternalModel() {
    // This is where you would load your actual 3D model
    // For now, we'll create a timeout to simulate loading
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate model not found
            reject(new Error("Model not found"));
        }, 1000);
    });
}

function createProceduralModel() {
    // Create a complex procedural model as fallback
    model = new THREE.Group();

    // Main structure - Futuristic building/abstract shape
    const mainGeometry = new THREE.CylinderGeometry(2, 3, 6, 8, 1);
    const mainMaterial = new THREE.MeshPhongMaterial({
        color: colorSchemes[0].primary,
        emissive: colorSchemes[0].primary,
        emissiveIntensity: 0.1,
        shininess: 100
    });
    const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
    mainMesh.castShadow = true;
    model.add(mainMesh);

    // Middle section
    const middleGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const middleMaterial = new THREE.MeshPhongMaterial({
        color: colorSchemes[0].secondary,
        emissive: colorSchemes[0].secondary,
        emissiveIntensity: 0.2
    });
    const middleMesh = new THREE.Mesh(middleGeometry, middleMaterial);
    middleMesh.position.y = 4;
    middleMesh.castShadow = true;
    model.add(middleMesh);

    // Top structure
    const topGeometry = new THREE.ConeGeometry(1, 3, 8);
    const topMaterial = new THREE.MeshPhongMaterial({
        color: colorSchemes[0].accent,
        emissive: colorSchemes[0].accent,
        emissiveIntensity: 0.3
    });
    const topMesh = new THREE.Mesh(topGeometry, topMaterial);
    topMesh.position.y = 7;
    topMesh.castShadow = true;
    model.add(topMesh);

    // Floating rings/orbits
    for (let i = 0; i < 3; i++) {
        const ringGeometry = new THREE.TorusGeometry(3 + i * 1.5, 0.1, 8, 32);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: colorSchemes[0].primary,
            emissive: colorSchemes[0].primary,
            emissiveIntensity: 0.5
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = i * 2;
        model.add(ring);
    }

    // Floating particles
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 20;
        positions[i3 + 1] = (Math.random() - 0.5) * 20;
        positions[i3 + 2] = (Math.random() - 0.5) * 20;

        const color = new THREE.Color();
        color.setHSL(Math.random(), 1, 0.7);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    model.add(particleSystem);

    scene.add(model);
}

function setupControls() {
    // OrbitControls for camera movement
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI;
}

function setupEventListeners() {
    // Reset view
    document.getElementById('resetBtn').addEventListener('click', () => {
        controls.reset();
        camera.position.set(0, 5, 15);
    });

    // Toggle wireframe
    document.getElementById('wireframeBtn').addEventListener('click', () => {
        wireframe = !wireframe;
        scene.traverse((child) => {
            if (child.isMesh) {
                child.material.wireframe = wireframe;
            }
        });
    });

    // Toggle animation
    document.getElementById('animationBtn').addEventListener('click', () => {
        isAnimating = !isAnimating;
    });

    // Change color scheme
    document.getElementById('colorBtn').addEventListener('click', () => {
        colorScheme = (colorScheme + 1) % colorSchemes.length;
        updateColors();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function updateColors() {
    const colors = colorSchemes[colorScheme];
    
    // Update lights
    scene.traverse((child) => {
        if (child.isLight && child.type !== 'AmbientLight') {
            child.color.set(colors.primary);
        }
    });

    // Update materials
    scene.traverse((child) => {
        if (child.isMesh) {
            if (child.material.emissive) {
                // Randomize colors for visual interest
                const colorOptions = [colors.primary, colors.secondary, colors.accent];
                const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
                child.material.color.set(randomColor);
                child.material.emissive.set(randomColor);
            }
        }
    });
}

function hideLoading() {
    const loading = document.getElementById('loading');
    const progress = document.getElementById('loading-progress');
    
    // Animate progress bar
    let progressValue = 0;
    const interval = setInterval(() => {
        progressValue += 2;
        progress.style.width = `${progressValue}%`;
        
        if (progressValue >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loading.style.opacity = '0';
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 500);
            }, 300);
        }
    }, 30);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (isAnimating && model) {
        // Rotate main model
        model.rotation.y += 0.005;
        
        // Animate floating rings
        model.children.forEach((child, index) => {
            if (child.geometry && child.geometry.type === 'TorusGeometry') {
                child.rotation.z += 0.01 * (index + 1);
            }
        });
        
        // Animate particles
        const particles = model.children.find(child => child.isPoints);
        if (particles) {
            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += (Math.random() - 0.5) * 0.02;
                positions[i + 1] += (Math.random() - 0.5) * 0.02;
                positions[i + 2] += (Math.random() - 0.5) * 0.02;
            }
            particles.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// Initialize the scene
init();