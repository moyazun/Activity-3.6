import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as dat from 'lil-gui';

/**
 * Base
 */
const gui = new dat.GUI();
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

/**
 * Model
 */
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/path/to/draco/'); // Update with correct path for Draco
gltfLoader.setDRACOLoader(dracoLoader);

let model = null;
gltfLoader.load(
    './models/Duck/glTF-Binary/Duck.glb',
    (gltf) => {
        model = gltf.scene;
        console.log(model);
        model.position.y = -1.2;
        scene.add(model);
    }
);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('#ffffff', 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('#ffffff', 0.7);
directionalLight.position.set(1, 2, 3);
scene.add(directionalLight);

/**
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
);
object1.position.x = -2;

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
);

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
);
object3.position.x = 2;

scene.add(object1, object2, object3);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 3;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentIntersect = null;

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

/**
 * Click event handling
 */
window.addEventListener('click', () => {
    if (currentIntersect) {
        switch (currentIntersect.object) {
            case object1:
                console.log('click on object 1');
                break;
            case object2:
                console.log('click on object 2');
                break;
            case object3:
                console.log('click on object 3');
                break;
        }
    }
});

/**
 * Animate
 */
const clock = new THREE.Clock();
const sphereSpeeds = [0.8, 1.0, 1.2]; // Different speeds for each sphere

const tick = () => {
    controls.update();

    // Update sphere positions to bounce
    const elapsedTime = clock.getElapsedTime();
    object1.position.y = Math.sin(elapsedTime * sphereSpeeds[0]) * 1.5;
    object2.position.y = Math.sin(elapsedTime * sphereSpeeds[1]) * 1.5;
    object3.position.y = Math.sin(elapsedTime * sphereSpeeds[2]) * 1.5;

    // Raycaster
    raycaster.setFromCamera(mouse, camera);
    const objectsToTest = [object1, object2, object3];
    const intersects = raycaster.intersectObjects(objectsToTest);

    // Reset colors
    objectsToTest.forEach(object => object.material.color.set('#ff0000'));

    // Highlight intersected objects
    if (intersects.length) {
        if (!currentIntersect) {
            console.log('mouse enter');
        }
        currentIntersect = intersects[0];
        currentIntersect.object.material.color.set('#00ff00');
    } else {
        if (currentIntersect) {
            console.log('mouse leave');
        }
        currentIntersect = null;
    }

    // Interact with the model if raycasted
    if (model) {
        const modelIntersects = raycaster.intersectObject(model);
        if (modelIntersects.length) {
            model.scale.set(1.2, 1.2, 1.2);
        } else {
            model.scale.set(1, 1, 1);
        }
    }

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
