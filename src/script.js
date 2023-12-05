import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertexSheder from './shaders/fireflies/vertex.glsl'
import firefliesFragmentSheder from './shaders/fireflies/fragment.glsl'
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from "./shaders/portal/fragment.glsl";
import {gsap} from 'gsap'
/**
 * Base
 */
// Debug
const debug = {}
const gui = new GUI({
    width: 200    
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader

const loadingAnimation = document.querySelector(".loading-bar")


const textureLoader = new THREE.TextureLoader()
const loadingManager = new THREE.LoadingManager(()=>{
 
    setTimeout(()=>{
   
   gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 1, value: 0 });
     loadingAnimation.classList.add("ends")
     loadingAnimation.style.transform = ''
   
}, 1000)

setTimeout(()=>{
scene.remove(overlay)
     overlayMaterial.dispose()
     overlayGeometry.dispose()
scene.add(fireflies)
 gsap.fromTo(fireflies.material.uniforms.uSize,{value:0}, {duration:2,value:100})    

 

},2500)
   
},(itemsURL, itemsToLoad, itemsTotal)=>{


    loadingAnimation.style.transform = `scaleX(${itemsToLoad/itemsTotal})`
    
},(error)=>{
    console.log(error)
})

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)


///Loading Animation

const overlayGeometry = new THREE.PlaneGeometry(2,2,1,1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    vertexShader:`
    void main()
    {
        gl_Position = vec4(position,1.0);


    }`,
    fragmentShader:`
    uniform float uAlpha;
    void main()
    {   

        gl_FragColor = vec4(0.8,0.8,0.8,uAlpha);

    }`,
    uniforms: {
        uAlpha:{value:1.0}
    }
})

const overlay = new THREE.Mesh(overlayGeometry,overlayMaterial)
scene.add(overlay)
///

//textures

const bakedTexture = textureLoader.load('baked.jpg')
bakedTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Object
 */


//Materials

//baked materials
const bakedMaterial = new THREE.MeshBasicMaterial({map: bakedTexture})
bakedTexture.flipY = false

//Debug Colors

debug.portalColorStart = "#e7a6a6";
debug.portalColorEnd = "#710e0e";

gui.addColor(debug, 'portalColorStart').onChange(()=>{
portalLightMaterial.uniforms.uColorStart.value.set(debug.portalColorStart)
}).name('outer-color')

gui.addColor(debug, "portalColorEnd").onChange(() => {
  portalLightMaterial.uniforms.uColorEnd.value.set(debug.portalColorEnd);
}).name('inner-color')


//Portal light material

const portalLightMaterial = new THREE.ShaderMaterial({
  vertexShader: portalVertexShader,
  fragmentShader: portalFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uColorStart: { value: new THREE.Color(debug.portalColorStart) },
    uColorEnd: { value: new THREE.Color(debug.portalColorEnd) },
  },
});


//Pole light material

const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });

//
//Model
gltfLoader.load('portal.glb',
(gltf) => 
{  
//      gltf.scene.traverse((child)=>{

        
//             child.material = bakedMaterial  
        
// })

const bakedMesh = gltf.scene.children.find(
  (child) => child.name === "baked"
);

   const poleLightAMesh =  gltf.scene.children.find(child => child.name === "light001")

      const poleLightBMesh = gltf.scene.children.find(
        (child) => child.name === "light003"
      );

       const portalLightMesh = gltf.scene.children.find(
         (child) => child.name === "Circle"
       );

       bakedMesh.material = bakedMaterial
       poleLightAMesh.material = poleLightMaterial
       poleLightBMesh.material = poleLightMaterial
       portalLightMesh.material = portalLightMaterial;

    

    scene.add(gltf.scene)
    
})

//Fireflies

//Geometry

const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 30

const positionArray = new Float32Array(firefliesCount*3)
const scaleArray = new Float32Array(firefliesCount);

for(let i = 0; i < firefliesCount;i++)
{
    scaleArray[i] = Math.random() * 3

    positionArray[i * 3] = (Math.random() -0.5 )* 4
    positionArray[i * 3 + 1] = Math.random() * 1 
    positionArray[i * 3 + 2] = (Math.random() - 0.5 ) * 4

}


firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray,3))
firefliesGeometry.setAttribute(
  "aScale",
  new THREE.BufferAttribute(positionArray,1)
);

//Material

const firefliesMaterial = new THREE.ShaderMaterial({
 transparent:true,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uPixelRatio: {
      value: Math.min(window.devicePixelRatio, 2),
    },
    uSize: {
        value: 0
    },
    uTime: {
        value: 0
    }
  },
  depthWrite: false,
  vertexShader: firefliesVertexSheder,
  fragmentShader: firefliesFragmentSheder,
});

gui.add(firefliesMaterial.uniforms.uSize, 'value', 0,500,1).name('firefly-size')

//Fireflies

const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
//scene.add(fireflies)




/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    //Upade shaders

    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio,2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = -4
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxDistance = 5
controls.minDistance = 2

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

debug.clearColor = "#130c01";
renderer.setClearColor(debug.clearColor)
gui.addColor(debug, 'clearColor').onChange(()=> renderer.setClearColor(debug.clearColor))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
  const elapsedTime = clock.getElapsedTime();

  //Update sheders - Time fireflies

  firefliesMaterial.uniforms.uTime.value = elapsedTime;

  //Update sheder - Time - portal

  portalLightMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
}

tick()