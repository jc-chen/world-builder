/*
//game stuff
// var socket = io();

// Input.applyEventHandlers(); //might remove

var game = Game.create(socket);
game.init();
*/

// Setup renderer

console.log('begin')
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
//cameraControl.autoRotate = false;
cameraControl.noPan = true;

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


var intersectionObjects;
var placementPos;

// ------------------------------
// LOADING MATERIALS AND TEXTURES

// XYZ axis helper
var worldFrame = new THREE.AxisHelper(2);
scene.add(worldFrame)

// Lighting
var ambientLight = new THREE.AmbientLight('#fff');
scene.add(ambientLight);
var light = new THREE.DirectionalLight(0xFFFFFF, 0.7, 100);
//light.position.set(camera.position.x-10,camera.position.y+10,camera.position.z-5);
light.position.set(-10,10,9);
camera.add(light);

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
  .setPath( 'public/images/' )
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
  'public/glsl/bphong.vs.glsl',
  'public/glsl/bphong.fs.glsl',
  'public/glsl/skybox.vs.glsl',
  'public/glsl/skybox.fs.glsl'
];

new THREE.SourceLoader().load(shaderFiles, function(shaders) {
  armadilloMaterial.vertexShader = shaders['public/glsl/bphong.vs.glsl']
  armadilloMaterial.fragmentShader = shaders['public/glsl/bphong.fs.glsl']
  skyboxMaterial.vertexShader = shaders['public/glsl/skybox.vs.glsl']  
  skyboxMaterial.fragmentShader = shaders['public/glsl/skybox.fs.glsl']
})

var lmao=[];

function loadOBJMTL(file, mat, scale, xOff, yOff, zOff, xRot, yRot, zRot) {
  var onProgress = function(query) {
    if (query.lengthComputable) {
      var percentComplete = query.loaded / query.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  };

  var onError = function() {
    console.log('Failed to load ' + file);
  };

  var mtlLoader = new THREE.MTLLoader();
  var loader = new THREE.OBJLoader();
  mtlLoader.load(mat,function(materials) {
    materials.preload();
    loader.setMaterials(materials);
    loader.load(file, function(object) {
      object.position.set(xOff, yOff, zOff);
      object.rotation.x = xRot;
      object.rotation.y = yRot;
      object.rotation.z = zRot;
      object.scale.set(scale, scale, scale);

      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          console.log("instance");
          child.geometry.computeFaceNormals();
          var mesh = new THREE.Mesh(child.geometry,child.material);
          //lmao.push(mesh);

          var fgeometry = new THREE.Geometry();
          fgeometry.fromBufferGeometry(child.geometry);
          //lmao = fgeometry.faces;
          
          var fgfaces
          var faceGeom;
          var facepush;
          var faceMat;
          for ( var i = 0; i < fgeometry.faces.length; i++ ) {
            fgfaces = fgeometry.faces[i];
            faceGeom = new THREE.Geometry();
            faceGeom.vertices.push(fgfaces.a);
            faceGeom.vertices.push(fgfaces.b);
            faceGeom.vertices.push(fgfaces.c);
            facepush = new THREE.Face3(0,1,2,fgfaces.normal,fgfaces.color,fgfaces.materialIndex);
            faceGeom.faces.push(facepush);
            faceGeom.computeFaceNormals();
            faceGeom.computeVertexNormals();
            faceMat = new THREE.MeshBasicMaterial();
            //lmao.push(new THREE.Mesh(faceGeom)); 
            //scene.add(lmao[i]);
          }

         // intersectionObjects.push(mesh);
        }
      });
      //intersectionObjects.push(object);
      scene.add(object);

    });
  }, onProgress, onError);
};


// LOADING ASSETS
var path = 'assets/NATURE/Models/naturePack_';
//need a better way to load all assets
var asset1o = path+'001.obj';
var asset1m = path+'001.mtl';
var asset2o = path+'007.obj';
var asset2m = path+'007.mtl';
var asset3o = path+'0012.obj';
var asset3m = path+'0012.mtl';


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
    object.position.set(xOff, yOff, zOff);
    object.rotation.x = xRot;
    object.rotation.y = yRot;
    object.rotation.z = zRot;
    object.scale.set(scale, scale, scale);

    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
        child.geometry.computeFaceNormals();
        lmao.push(new THREE.Mesh(child.geometry,material));
        var fgeometry = new THREE.Geometry();
        fgeometry.fromBufferGeometry(child.geometry);        
        var fgfaces;
        var faceGeom;
        var facepush;
        var faceMesh;
        for ( var i = 0; i < fgeometry.faces.length; i++ ) {
          fgfaces = fgeometry.faces[i];
          faceGeom = new THREE.Geometry();
          faceGeom.vertices.push(fgfaces.a);
          faceGeom.vertices.push(fgfaces.b);
          faceGeom.vertices.push(fgfaces.c);
          facepush = new THREE.Face3(0,1,2,fgfaces.normal,fgfaces.color,fgfaces.materialIndex);
          faceGeom.faces.push(facepush);
          faceMesh = new THREE.Mesh(faceGeom,material);
          //scene.add(faceMesh);
          //lmao.push(faceMesh);     
        } 
      }
    });
    scene.add(object); 
  }, onProgress, onError);
}



// -------------------------------
// ADD OBJECTS TO THE SCENE

// TO DO: Change meshPhongMaterial to real material shaders for highlighting
var landMaterial = new THREE.MeshPhongMaterial({color: 0x89D044});
loadOBJ('public/obj/pureobjearthland.obj',landMaterial,1,0,0,0,0,0,0);

var seaMaterial = new THREE.MeshPhongMaterial({color: 0x47A4C5});
loadOBJ('public/obj/pureobjearthsea.obj',seaMaterial,1,0,0,0,0,0,0);


var skyboxGeometry = new THREE.BoxGeometry(1000,1000,1000);
var skybox = new THREE.Mesh(skyboxGeometry,skyboxMaterial);
scene.add(skybox);

/*
targetList = [];

// this material causes a mesh to use colors assigned to faces
  var faceColorMaterial = new THREE.MeshBasicMaterial( 
  { color: 0xffffff, vertexColors: THREE.FaceColors } );
  
  var sphereGeometry = new THREE.SphereGeometry( 80, 32, 16 );
  for ( var i = 0; i < sphereGeometry.faces.length; i++ ) 
  {
    face = sphereGeometry.faces[ i ]; 
    face.color.setRGB( 0, 0, 0.8 * Math.random() + 0.2 );   
  }
  var sphere = new THREE.Mesh( sphereGeometry, faceColorMaterial );
  sphere.position.set(0, 50, 0);
  scene.add(sphere);
  
  targetList.push(sphere);

*/

// -------------------------------
// UPDATE ROUTINES

document.addEventListener('mousedown', onDocumentMouseDown, false);


var keyboard = new THREEx.KeyboardState();

function checkKeyboard() { }

function updateMaterials() {
  cameraPositionUniform.value = camera.position
 // light.position.set(camera.position.x-30,camera.position.y+30,camera.position.z-5);
  armadilloMaterial.needsUpdate = true
  skyboxMaterial.needsUpdate = true
}


var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onDocumentMouseDown( event ) {
  switch(event.button) {
    case 2: { // left click
      // calculate mouse position in normalized device coordinates
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      // update the picking ray with the camera and mouse position
      raycaster.setFromCamera( mouse, camera );

    // calculate objects intersecting the picking ray
      var intersects = raycaster.intersectObjects(lmao, true);
      if ( intersects.length > 0 ) {
        console.log("Hit @ " + intersects[0].point.x.toString() + ', ' + intersects[0].point.y.toString() + ', ' + intersects[0].point.z.toString());
        // change the color of the closest face.
        //intersects[ 0 ].face.color.setRGB( 1, 0, 0 ); 
        //intersects[ 0 ].object.geometry.colorsNeedUpdate = true;
        placementPos = new THREE.Vector3(intersects[0].point.x,intersects[0].point.y,intersects[0].point.z);
      }
      else {
        console.log("clickity click you missed the earthity earth");
      }
      for ( var i = 0; i < intersects.length; i++ ) {
        //intersects[ i ].object.material.color.set( 0xffffff );
      }
      break;
    }
    case 1:  // middle click
      break;
    case 0: // right click
      break;
  }
}



// Update routine
function update() {
  checkKeyboard()
  updateMaterials()
  requestAnimationFrame(update)
  cameraControl.update()
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

console.log('done')