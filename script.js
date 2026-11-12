<script type="module">

import * as THREE from 'three';

import { OrbitControls } from
'three/addons/controls/OrbitControls.js';

import { EffectComposer } from
'three/addons/postprocessing/EffectComposer.js';

import { RenderPass } from
'three/addons/postprocessing/RenderPass.js';

import { UnrealBloomPass } from
'three/addons/postprocessing/UnrealBloomPass.js';

import { OutputPass } from
'three/addons/postprocessing/OutputPass.js';

// ======================================
// SCENE
// ======================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x020000);

const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 0, 11);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

document.getElementById("canvas-container")
.appendChild(renderer.domElement);

// ======================================
// BLOOM / NEON EFFECT
// ======================================

const composer = new EffectComposer(renderer);

composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
    new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
    ),
    1.5,
    0.5,
    0.05
);

composer.addPass(bloom);
composer.addPass(new OutputPass());

// ======================================
// CAMERA CONTROLS
// ======================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.minDistance = 3;
controls.maxDistance = 25;

// ======================================
// 9D HYPERCUBE
// ======================================

const DIMENSIONS = 9;
const VERTEX_COUNT = 2 ** DIMENSIONS;

const vertices = [];

for (let i = 0; i < VERTEX_COUNT; i++) {

    const vertex = [];

    for (let d = 0; d < DIMENSIONS; d++) {

        vertex.push(
            (i & (1 << d)) ? 1 : -1
        );

    }

    vertices.push(vertex);
}

// ======================================
// EDGES
// ======================================

const edges = [];

for (let i = 0; i < VERTEX_COUNT; i++) {

    for (let d = 0; d < DIMENSIONS; d++) {

        const j = i ^ (1 << d);

        if (j > i) {
            edges.push([i, j]);
        }

    }

}

// ======================================
// ROTATION PLANES
// ======================================

const rotationPlanes = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [1, 8],
    [0, 4],
    [2, 6],
    [3, 8],
    [5, 7]
];

let rotationTime = 0;
let speed = 0.65;
let paused = false;

// ======================================
// 9D ROTATION
// ======================================

function rotate9D(point, time) {

    const v = [...point];

    rotationPlanes.forEach((plane, index) => {

        const a = plane[0];
        const b = plane[1];

        const angle = time * (
            0.12 + index * 0.025
        ) * (index % 2 === 0 ? 1 : -1);

        const c = Math.cos(angle);
        const s = Math.sin(angle);

        const x = v[a];
        const y = v[b];

        v[a] = x * c - y * s;
        v[b] = x * s + y * c;

    });

    return v;
}

// ======================================
// STABLE 9D TO 3D PROJECTION
// ======================================

function project9Dto3D(point) {

    const scale = 0.5;
    const distance = 6;

    const v = point.map(x => x * scale);

    let factor = 1;

    // Perspective projection across six
    // higher-dimensional coordinates.

    for (let d = 3; d < 9; d++) {

        factor *= distance /
            (distance - v[d]);

    }

    return new THREE.Vector3(
        v[0] * factor,
        v[1] * factor,
        v[2] * factor
    );

}

// ======================================
// BALLS
// ======================================

const ballGeometry = new THREE.SphereGeometry(
    1, 12, 12
);

const ballMaterial = new THREE.MeshBasicMaterial({
    color: 0xff1010
});

const balls = new THREE.InstancedMesh(
    ballGeometry,
    ballMaterial,
    VERTEX_COUNT
);

scene.add(balls);

const dummy = new THREE.Object3D();

// ======================================
// RED CONNECTIONS
// ======================================

const edgePositions = new Float32Array(
    edges.length * 2 * 3
);

const edgeGeometry = new THREE.BufferGeometry();

edgeGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(edgePositions, 3)
);

const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0xff1717,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending
});

const edgeLines = new THREE.LineSegments(
    edgeGeometry,
    edgeMaterial
);

scene.add(edgeLines);

// ======================================
// BACKGROUND PARTICLES
// ======================================

const particleCount = 1200;

const particlePositions = new Float32Array(
    particleCount * 3
);

for (let i = 0; i < particleCount; i++) {

    particlePositions[i * 3] =
        (Math.random() - 0.5) * 35;

    particlePositions[i * 3 + 1] =
        (Math.random() - 0.5) * 35;

    particlePositions[i * 3 + 2] =
        (Math.random() - 0.5) * 35;

}

const particleGeometry = new THREE.BufferGeometry();

particleGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
        particlePositions, 3
    )
);

const particleMaterial = new THREE.PointsMaterial({
    color: 0xff2222,
    size: 0.035,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
});

const particles = new THREE.Points(
    particleGeometry,
    particleMaterial
);

scene.add(particles);

// ======================================
// UPDATE HYPERCUBE
// ======================================

function updateHypercube(time) {

    const size = parseFloat(
        document.getElementById("ballSize").value
    );

    // Update vertices

    for (let i = 0; i < VERTEX_COUNT; i++) {

        const rotated = rotate9D(
            vertices[i],
            time
        );

        const projected = project9Dto3D(rotated);

        const pulse = 1 + 0.2 *
            Math.sin(time * 2 + i * 0.12);

        dummy.position.copy(projected);

        dummy.scale.setScalar(size * pulse);

        dummy.updateMatrix();

        balls.setMatrixAt(i, dummy.matrix);

    }

    balls.instanceMatrix.needsUpdate = true;

    // Update edges

    let offset = 0;

    for (const edge of edges) {

        const a = project9Dto3D(
            rotate9D(vertices[edge[0]], time)
        );

        const b = project9Dto3D(
            rotate9D(vertices[edge[1]], time)
        );

        edgePositions[offset++] = a.x;
        edgePositions[offset++] = a.y;
        edgePositions[offset++] = a.z;

        edgePositions[offset++] = b.x;
        edgePositions[offset++] = b.y;
        edgePositions[offset++] = b.z;

    }

    edgeGeometry.attributes.position.needsUpdate = true;
    edgeGeometry.computeBoundingSphere();

}

// ======================================
// INTERFACE
// ======================================

document.getElementById("speed")
.addEventListener("input", e => {

    speed = parseFloat(e.target.value);

});

document.getElementById("pause")
.addEventListener("click", () => {

    paused = !paused;

    document.getElementById("pause").textContent =
        paused ? "RESUME" : "PAUSE";

});

document.getElementById("reset")
.addEventListener("click", () => {

    rotationTime = 0;

    camera.position.set(0, 0, 11);

    controls.target.set(0, 0, 0);

    controls.update();

});

document.getElementById("fullscreen")
.addEventListener("click", () => {

    if (!document.fullscreenElement) {

        document.documentElement.requestFullscreen();

    } else {

        document.exitFullscreen();

    }

});

// ======================================
// ANIMATION
// ======================================

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    if (!paused) {

        rotationTime += delta * speed;

        updateHypercube(rotationTime);

        particles.rotation.y += delta * 0.015;

    }

    bloom.strength = parseFloat(
        document.getElementById("glow").value
    );

    controls.update();

    composer.render();

}

// ======================================
// RESIZE
// ======================================

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    composer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});

// ======================================
// START
// ======================================

updateHypercube(0);
animate();
</script>
