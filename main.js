import './style.css'
import * as THREE from 'three'
import { addBoilerPlateMeshes } from './addMeshes'
import { addLight } from './addLights'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Model from './model'


const threeCanvas = document.querySelector('canvas.webgl')
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  canvas: threeCanvas 
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

var score;

init()
function init() {
  //set up our renderer default settings, add scene/canvas to webpage
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  meshes.default = addBoilerPlateMeshes()
  lights.default = addLight()

  scene.add(meshes.default)
  scene.add(lights.default)

  camera.position.set(0, 0, 5)

  // webcam()
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

function instances() {
  const figure = new Model({
    //4 mandatories
    mixers: mixers,
    url: '/figure.glb',
    animationState: true,
    scene: scene,
    meshes: meshes,
    replace: false,
    name: 'figure',
    position: new THREE.Vector3(0, 0, -2)
  })
  figure.init() //calling init in model.js
}
window.addEventListener('click', () => {
  playSpecificAnimation(0);
}) 

function playSpecificAnimation(index) {
  // if (!mixer) return;

  // Stop all actions
  mixers[0].stopAllAction();
  const animationAction = mixers[0]._actions.find((action) => action._clip.name === 'MoveAnimation');
  console.log(mixers[0]._action);

  // animationAction.reset();
  // animationAction.play();

  // Get the specific animation action using its clip name or index
  const action = mixers[0].clipAction('MoveAnimation');
  // action.reset();  // Reset the action
  // action.play();   // Play the action
}

function resize() {
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  })
}

function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  // controls.update()
  if (score > 20) {
    meshes.default.rotation.x += 0.01
    meshes.default.rotation.y -= 0.01
  } 
  renderer.render(scene, camera)
}






//MOTION DETECT//

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

var pixelDiffThreshold = 120;
var isReadyToDiff = false;

canvas.style.transform = 'scale(-1, 1)'

setInterval(capture, 300);


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

  if (score > 20) {
    console.log('movement detected');
  }

  // draw current capture normally over diff, ready for next time
  diffContext.globalCompositeOperation = 'source-over';
  diffContext.drawImage(video, 0, 0, diffWidth, diffHeight);
  isReadyToDiff = true;
}




