// Setup renderer
var canvas = document.getElementById('canvas');
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xFFFFFF);
canvas.appendChild(renderer.domElement);

// Adapt backbuffer to window size
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

// Hook up to event listener
window.addEventListener('resize', resize);
//window.addEventListener('vrdisplaypresentchange', resize, true);

// Disable scrollbar function
window.onscroll = function() {
  window.scrollTo(0, 0);
}

var scene = new THREE.Scene(); 

// Main camera 
var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000); // view angle, aspect ratio, near, far
camera.position.set(0,10,20);
camera.lookAt(scene.position);
scene.add(camera);

// COMMENT BELOW FOR VR CAMERA
// ------------------------------

// Giving it some controls
cameraControl = new THREE.OrbitControls(camera);
cameraControl.damping = 0.2;
cameraControl.autoRotate = false;
// ------------------------------
// COMMENT ABOVE FOR VR CAMERA



// UNCOMMENT BELOW FOR VR CAMERA
// ------------------------------
// Apply VR headset positional data to camera.
// var controls = new THREE.VRControls(camera);
// controls.standing = true;

// // Apply VR stereo rendering to renderer.
// var effect = new THREE.VREffect(renderer);
// effect.setSize(window.innerWidth, window.innerHeight);


// var display;

// // Create a VR manager helper to enter and exit VR mode.
// var params = {
//   hideButton: false, // Default: false.
//   isUndistorted: false // Default: false.
// };
// var manager = new WebVRManager(renderer, effect, params);
// ------------------------------
// UNCOMMENT ABOVE FOR VR CAMERA


// ------------------------------
// LOADING MATERIALS AND TEXTURES

// XYZ axis helper
var worldFrame = new THREE.AxisHelper(2);
scene.add(worldFrame)


// Uniforms
var cameraPositionUniform = {type: "v3", value: camera.position }
var lightColorUniform = {type: "c", value: new THREE.Vector3(1.0, 1.0, 1.0) };
var ambientColorUniform = {type: "c", value: new THREE.Vector3(1.0, 1.0, 1.0) };
var kAmbientUniform = {type: "f", value: 0.1};
var kDiffuseUniform = {type: "f", value: 0.8};
var kSpecularUniform = {type: "f", value: 0.4};
var shininessUniform = {type: "f", value: 50.0};

// Materials

var armadilloMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightColorUniform: lightColorUniform,
    ambientColorUniform: ambientColorUniform,
    kAmbientUniform: kAmbientUniform,
    kDiffuseUniform: kDiffuseUniform,
    kSpecularUniform, kSpecularUniform,
    shininessUniform: shininessUniform,
  },
});

var skyboxCubemap = new THREE.CubeTextureLoader()
  .setPath( 'images/' )
  .load( [
  'space.png', 'space.png',
  'space.png', 'space.png',
  'space.png', 'space.png'
  ] );

var skyboxMaterial = new THREE.ShaderMaterial({
  uniforms: {
    skybox: { type: "t", value: skyboxCubemap },
    cameraPos: cameraPositionUniform,
  },
    side: THREE.DoubleSide
})

// -------------------------------
// LOADING SHADERS
var shaderFiles = [
  'glsl/bphong.vs.glsl',
  'glsl/bphong.fs.glsl',
  'glsl/skybox.vs.glsl',
  'glsl/skybox.fs.glsl'
];

new THREE.SourceLoader().load(shaderFiles, function(shaders) {
  armadilloMaterial.vertexShader = shaders['glsl/bphong.vs.glsl']
  armadilloMaterial.fragmentShader = shaders['glsl/bphong.fs.glsl']
  skyboxMaterial.vertexShader = shaders['glsl/skybox.vs.glsl']  
  skyboxMaterial.fragmentShader = shaders['glsl/skybox.fs.glsl']
})



function loadOBJ(file, material, scale, xOff, yOff, zOff, xRot, yRot, zRot) {
  var onProgress = function(query) {
    if (query.lengthComputable) {
      var percentComplete = query.loaded / query.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  };

  var onError = function() {
    console.log('Failed to load ' + file);
  };

  var loader = new THREE.OBJLoader();
  loader.load(file, function(object) {
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });

    object.position.set(xOff, yOff, zOff);
    object.rotation.x = xRot;
    object.rotation.y = yRot;
    object.rotation.z = zRot;
    object.scale.set(scale, scale, scale);
    scene.add(object)
  }, onProgress, onError);
}

loadOBJ('obj/earth.obj',armadilloMaterial,1,0,0,0,0,0,0);

// -------------------------------
// ADD OBJECTS TO THE SCENE

var skyboxGeometry = new THREE.BoxGeometry(1000,1000,1000);
var skybox = new THREE.Mesh(skyboxGeometry,skyboxMaterial);
scene.add(skybox);


//loadDAE('./obj/ert.dae');

// -------------------------------
// UPDATE ROUTINES
var keyboard = new THREEx.KeyboardState();

function checkKeyboard() { }

function updateMaterials() {
  cameraPositionUniform.value = camera.position
  armadilloMaterial.needsUpdate = true
  skyboxMaterial.needsUpdate = true
}

// Update routine
function update() {
  checkKeyboard()
  updateMaterials()

  requestAnimationFrame(update)
  renderer.render(scene, camera)


  // UNCOMMENT BELOW FOR VR CAMERA
  // ------------------------------
  // Update VR headset position and apply to camera.
  // controls.update();
  // ------------------------------
  // UNCOMMENT ABOVE FOR VR CAMERA

  // To see the shadowmap values: 
    // renderer.render(depthScene, lightCamera)
}

resize();
update();