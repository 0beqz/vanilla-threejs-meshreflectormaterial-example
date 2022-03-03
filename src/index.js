import './style/main.css'
import * as THREE from 'three'
import MeshReflectorMaterial from './MeshReflectorMaterial'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";



const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(2, 2, -2)
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('.webgl')
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)

const controls = new OrbitControls(camera, renderer.domElement);



new RGBELoader().load("/env.hdr", tex => {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    scene.environment = scene.background = pmremGenerator.fromEquirectangular(tex).texture
});



const cube = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xff00ff }))
scene.add(cube)

const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.5, 0.1, 100, 16), new THREE.MeshStandardMaterial({ color: 0x00ff00 }));
torusKnot.position.set(2, 0.5, 2)
scene.add(torusKnot)

const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(10, 10))
plane.position.y = -0.5
plane.rotation.x = -Math.PI / 2
scene.add(plane)



plane.material = new MeshReflectorMaterial(renderer, camera, scene, plane, {
    resolution: 1024,
    blur: [512, 128],
    mixBlur: 2,
    mixStrength: 5.5,
    mixContrast: 1.2,
    mirror: 1
});

plane.material.setValues({
    roughness: 2.5,
    roughnessMap: new THREE.TextureLoader().load("/roughness.jpg"),
    normalMap: new THREE.TextureLoader().load("/normal.png"),
    normalScale: new THREE.Vector2(0.3, 0.3)
})



const loop = () => {
    cube.rotation.y += 0.01
    torusKnot.rotation.x += 0.01
    torusKnot.rotation.z += 0.01

    plane.material.update()

    controls.update();

    renderer.render(scene, camera)

    requestAnimationFrame(loop)
}

loop()