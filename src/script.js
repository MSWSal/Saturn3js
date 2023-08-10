import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

//=========================================================================import textures============================================================================

import starsTexture from './img/stars.jpg';
import saturnTexture from './img/saturn.jpg';
import saturnRingTexture from './img/saturn ring.png';
import sunTexture from './img/sun.jpg';
import surface from './img/surface-norm.jpg'
import surfacediff from './img/surface-diff.jpg'
import moonTexture from './img/moon_texture.png'
import earthTexture from './img/earth.jpg'

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

//===============================model===========
const spaceshipURL = new URL('./img/spaceship.gltf', import.meta.url);

// ========================================================Enable shadows=========================================================
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(-90, 140, 140);
orbit.update();




//=======================================ambient light for the scene======================================

const ambientLight = new THREE.AmbientLight(0x3c403d);
scene.add(ambientLight);

//===========================================skybox===================================================

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture
]);

const textureLoader = new THREE.TextureLoader();

//========================================saturn creation=====================================

const saturnGeo = new THREE.SphereGeometry(16, 100, 100);
const saturnMat = new THREE.MeshStandardMaterial({
    map: textureLoader.load(saturnTexture),
    normalMap: textureLoader.load(surface),
    // bumpMap: textureLoader.load(surfacediff),

    roughness: 1
});
const saturnmesh = new THREE.Mesh(saturnGeo, saturnMat);
const saturnobj = new THREE.Object3D();
saturnobj.add(saturnmesh);



// ==============================================sun

const sunGeo = new THREE.SphereGeometry(50, 100, 100);
const sunMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load(sunTexture)
});
const sunmesh = new THREE.Mesh(sunGeo, sunMat);
const sunobj = new THREE.Object3D();
sunobj.add(sunmesh);

sunmesh.position.set(200,50,100);  //here the position is set by the mesh


//==========================earth=====================

const earthGeo = new THREE.SphereGeometry(15, 100, 100);
const earthMat = new THREE.MeshStandardMaterial({
    map: textureLoader.load(earthTexture),
    normalMap: new THREE.TextureLoader().load(surface)
});
const earthmesh = new THREE.Mesh(earthGeo, earthMat);
const earthobj = new THREE.Object3D();


earthmesh.position.set(50,50,200); 


// ---------------------------------saturn moon
const moonGeometry = new THREE.SphereGeometry(2, 100, 100);
const moonMaterial = new THREE.MeshStandardMaterial({
	map: new THREE.TextureLoader().load(moonTexture),
	normalMap: new THREE.TextureLoader().load(surface),
	// bumpMap: new THREE.TextureLoader().load(surfacediff),
	roughness: 1,
});
const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
moonMesh.position.x =30
moonMesh.position.y =5
moonMesh.position.z =5  //postion set by mesh
const moonobj = new THREE.Object3D();
moonobj.add(moonMesh);



//=======================================================saturn ring=========================

const ringGeo = new THREE.RingGeometry(
    20,
    30,
    32);
const ringMat = new THREE.MeshStandardMaterial({
    map: textureLoader.load(saturnRingTexture),
    side: THREE.DoubleSide,
    opacity: 0.2
});
const ringMesh = new THREE.Mesh(ringGeo, ringMat);
ringMesh.rotation.x = -0.4 * Math.PI;

scene.add(ringMesh);

//=======================================enable shadows on objects===========================================

saturnmesh.castShadow = true;
ringMesh.castShadow = true;
ringMesh.receiveShadow = true;
saturnmesh.receiveShadow = true;
moonMesh.castShadow = true;
moonMesh.receiveShadow = true;

scene.add(saturnmesh);
scene.add(earthmesh);
scene.add(sunobj);
scene.add(moonobj);         //============================objects added to the scene to negate self rotation

const pointLight = new THREE.PointLight(0xffffff, 2, 500);//===================enable point light================
pointLight.position.set(200, 50, 100)
pointLight.castShadow = true; //==========shadow
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
scene.add(pointLight);


// =====================================asteroid=======
function generatePosition(rnge) {
    const range = rnge;
    return new THREE.Vector3(
      Math.random() * range - range / 2,
      Math.random() * range - range / 2,
      Math.random() * range - range / 2
    );
  }
  
  // ==================Function to create the asteroid mesh
  const verticesOfCube = [
    -1,-1,0,    1,0,-1,    1, 0,-1,    -1, 0,-1,
    -1, 0, 1,    1,0, 1,    1, 0, 1,    -1, 1, 0,
];

const indicesOfFaces = [
    9,1,0,    0,3,2,
    0,4,7,    7,3,0,
    0,1,5,    5,4,0,
    1,2,6,    6,5,1,
    2,3,7,    7,6,2,
    4,5,6,    6,7,4
];
  function createAsteroid() {
    const asteroidGeometry = new THREE.PolyhedronGeometry(verticesOfCube,indicesOfFaces, 1, 2);
    const asteroidMaterial = new THREE.MeshStandardMaterial({
      // color: new THREE.Color(Math.random(), Math.random(), Math.random()), // Random color for each asteroid
      map: textureLoader.load(moonTexture)
    });
    return new THREE.Mesh(asteroidGeometry, asteroidMaterial);
  }
  
  // =======================================================Generate and add asteroids to the scene
  const numAsteroids = 300;
  const asteroidsset = [];
  for (let i = 0; i < numAsteroids; i++) {
    const asteroid = createAsteroid();
    const position = generatePosition(1000);
    asteroid.position.copy(position);
    asteroid.scale.setScalar(Math.random() * 2 + 0.5); // Randomize the size of asteroids
    sunmesh.add(asteroid);
    asteroidsset.push(asteroid);
  }

  let model;
  //==============================================spaceship model=============================
  const assetLoader = new GLTFLoader();
  assetLoader.load(spaceshipURL.href, function(gltf){

     model = gltf.scene;
    scene.add(model);
    const spaceposition = generatePosition(500);
    model.position.copy(spaceposition);

  },undefined, function(error){
    console.error(error);
  });



function animate() {

  if (model) { // Check if model is defined before using it
    model.position.z += 0.1;
    if(model.position.z>200){
      const position = generatePosition(300);
      model.position.copy(position);
    
    }
  }


  sunmesh.rotateY(0.001); //===============self rotate
  ringMesh.rotateZ(0.04)  

  earthmesh.rotateY(0.004);
  saturnmesh.rotateY(0.004);
  moonobj.rotateY(0.007);//===============object rotate around saturn

  asteroidsset.forEach(asteroid => { // for asteroid anim
      asteroid.position.x+=0.1;
      if(asteroid.position.x>1000){
        const position = generatePosition(1000);
        asteroid.position.copy(position);
        asteroid.scale.setScalar(Math.random() * 2 + 0.5); 
      sunmesh.add(asteroid);
      }
    });
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);



window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});