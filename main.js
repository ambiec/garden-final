import './style.css'
import * as THREE from 'three'
import { addBackground, addBoilerPlateMeshes } from './addMeshes'
import { addLight } from './addLights'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Model from './model'
import { post } from './post'
import Stats from 'three/examples/jsm/libs/stats.module';


const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
}) //cube meshes sometimes have jagged edges w/o antialias
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)

const clock = new THREE.Clock()
const scene = new THREE.Scene()
const meshes = {}
const lights = {}
const mixers = []

const listener = new THREE.AudioListener()
camera.add(listener)
const sound1 = new THREE.PositionalAudio(listener)
const sound2 = new THREE.PositionalAudio(listener)
const audioLoader = new THREE.AudioLoader()

const button = document.getElementById("button")

// const composer = post(scene, camera, renderer)
const { composer, bloomComposer, after, bloom } = post(scene, camera, renderer);
console.log(bloom.strength);

var score
var grow = true
var moving = false
var soundOn = false

const stats = new Stats();

init()

function init() {
  //set up our renderer default settings, add scene/canvas to webpage
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  meshes.default = addBoilerPlateMeshes()
  meshes.background = addBackground()

  lights.default = addLight()

  scene.add(meshes.background)
  // scene.add(meshes.default)
  scene.add(lights.default)

  document.body.appendChild(stats.dom)

  button.addEventListener('click', () => {
    soundOn = true;
		sound1.play()
    button.innerHTML = "sound off"
    button.addEventListener('click', () => {
      soundOn = false;
      sound1.stop()
      button.innerHTML = "sound on"
    })
	})

  camera.position.set(0, 0, 5)

  // webcam()
  initAudio()
  instances()
  resize()
  animate()
}

// function webcam() {
//   video = document.getElementById('video')

//   const texture = new THREE.VideoTexture(video)
// 	texture.colorSpace = THREE.SRGBColorSpace
//   texture.wrapS = THREE.RepeatWrapping;
// texture.repeat.x = - 1;

//   const geometry = new THREE.PlaneGeometry(16, 9)
// 	geometry.scale(0.5, 0.5, 0.5)
// 	const material = new THREE.MeshBasicMaterial({ map: texture })
// 	if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
// 		const constraints = {
// 			video: { width: 1280, height: 720, facingMode: 'user' },
// 		}

// 		navigator.mediaDevices
// 			.getUserMedia(constraints)
// 			.then(function (stream) {
// 				// apply the stream to the video element used in the texture

// 				video.srcObject = stream
// 				video.play()
// 			})
// 			.catch(function (error) {
// 				console.error('Unable to access the camera/webcam.', error)
// 			})
// 	} else {
// 		console.error('MediaDevices interface not available.')
// 	}
// 	const mesh = new THREE.Mesh(geometry, material)
// 	meshes.camTexture = mesh
// 	scene.add(meshes.camTexture)
// }

function initAudio() {
  audioLoader.load('/ambient.mp3', function(buffer){
		sound1.setBuffer(buffer)
		sound1.setRefDistance(3)
		sound1.setRolloffFactor(5)
		sound1.setMaxDistance(20)
		sound1.setDistanceModel('exponential')
	})

  audioLoader.load('/footsteps.mp3', function(buffer){
		sound2.setBuffer(buffer)
		sound2.setRefDistance(3)
		sound2.setRolloffFactor(5)
		sound2.setMaxDistance(20)
		sound2.setDistanceModel('exponential')
	})
}


//MODEL//

function instances() {
  const figure = new Model({
    //4 mandatories
    mixers: mixers,
    url: '/figure.glb',
    animationState: true,
    scene: scene,
    meshes: meshes,
    replace: true,
    replaceURL: '/final.jpeg',
    name: 'figure',
    position: new THREE.Vector3(0, 1, -3)
  })
  figure.init() //calling init in model.js
}


function resize() {
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    bloomComposer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  })
}

function animate() {
  const delta = clock.getDelta()
  for (const mixer of mixers) {
    mixer.update(delta)
  }

  if (!moving) {
    if (bloom.strength < 0.01 || bloom.strength < 0.5 && grow){
      grow = true
      bloom.strength += delta*0.1
    } else if (bloom.strength > 0) {
      grow = false
      bloom.strength -= delta*0.1
    }
  } else {
    if (bloom.strength > 0.01) {
      bloom.strength -= delta*0.2
    }
  }
  
  bloomComposer.render()

  composer.render()

  stats.update()

  requestAnimationFrame(animate)

}






//MOTION DETECT//
//#Source: https://github.com/lonekorean/diff-cam-feed/blob/master/client/js/vendor/diff-cam-engine.js

var constraints = {
  audio: false,
  video: { width: 640, height: 480 }
};
navigator.mediaDevices.getUserMedia(constraints)
  .then(success)
  .catch(error);

function success(stream) {
  var video = document.getElementById('video');
  video.srcObject = stream;
  video.style.transform = 'scale(-1, 1)';
}

function error(error) {
  console.log(error);
}

var video = document.getElementById('video');

var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.className = "stream"
canvas.width = 640;
canvas.height = 480;
var captureWidth = 640;
var captureHeight = 480;
var captureContext = canvas.getContext('2d', { willReadFrequently: true });

// prep diff canvas
var diffCanvas = document.createElement('canvas');
document.body.appendChild(canvas);
diffCanvas.width = 64;
diffCanvas.height = 48;
var diffWidth = 64;
var diffHeight = 48;
var diffContext = diffCanvas.getContext('2d');

var pixelDiffThreshold = 70;
var isReadyToDiff = false;
var movementInitiated = false;

canvas.style.transform = 'scale(-1, 1)'

setInterval(capture, 400);

let debounceTimeout;
const debounceDelay = 1000;


function capture() {
  captureContext.drawImage(video, 0, 0, 640, 480);
  var captureImageData = captureContext.getImageData(0, 0, captureWidth, captureHeight);


  if (isReadyToDiff) {
    diffContext.globalCompositeOperation = 'difference';
    diffContext.drawImage(video, 0, 0, diffWidth, diffHeight);
    var diffImageData = diffContext.getImageData(0, 0, diffWidth, diffHeight);
    // console.log('drawn');

    var rgba = diffImageData.data;

    score = 0;
    

    for (var i = 0; i < rgba.length; i += 4) {
      var pixelDiff = rgba[i] * 0.3 + rgba[i + 1] * 0.6 + rgba[i + 2] * 0.1;
      var normalized = Math.min(255, pixelDiff * (255 / pixelDiffThreshold));
      rgba[i] = 0;
      rgba[i + 1] = normalized;
      rgba[i + 2] = 0;

      if (pixelDiff >= pixelDiffThreshold) {
        score++;
      }
    }
  }

  if (!debounceTimeout) {
    clearTimeout(debounceTimeout);
    // console.log(score);

    if (score > 20) {
      moving = true;
      if (!mixers[0]._actions[1].isRunning() && moving) {
        // console.log(mixers[0]._actions[0].isRunning())
        const animationAction = mixers[0]._actions[1];
        animationAction.play()
        if (soundOn) {
          sound2.play()
        }

      }
    } else {
      moving = false;
      const movement = mixers[0]._actions[1];
      movement.stop();
      sound2.stop()
      // console.log(mixers[0]._actions[0].isRunning());
      if (!mixers[0]._actions[0].isRunning() && !moving) {
        const animationAction = mixers[0]._actions[0];
        animationAction.play();
      }
    }

    debounceTimeout = setTimeout(() => {
      debounceTimeout = null;
    }, debounceDelay);
  }

  // draw current capture normally over diff, ready for next time
  diffContext.globalCompositeOperation = 'source-over';
  diffContext.drawImage(video, 0, 0, diffWidth, diffHeight);
  isReadyToDiff = true;
}




