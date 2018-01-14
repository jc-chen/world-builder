 var camera, scene, projector, renderer;
        var particleMaterial;

                    var textureLoader;
                    var modelLoader;

        var objects = [];

        init();
        animate();

        function init() {

            container = document.createElement( 'div' );
            document.body.appendChild( container );

            camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
            camera.position.set( 0, 300, 500 );

            scene = new THREE.Scene();

                            var manager = new THREE.LoadingManager();
                            textureLoader = new THREE.ImageLoader( manager );
                            modelLoader = new THREE.OBJLoader(manager);




                            modelLoader.load( 'cube.obj', function ( object ) {

                                object.traverse( function ( child ) {

                                        if ( child instanceof THREE.Mesh ) {
                                                console.log("instance");
                                                child.geometry.computeFaceNormals();
                                                child.material = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } );

                                                child.material.side = THREE.DoubleSided;
                                        }

                                } );
                                objects.push(object);
                                object.position.x = 10;
                                object.position.y = 10;
                                object.scale.set(100,100,100);
                                scene.add(object);
                            });

                            var geometry = new THREE.SphereGeometry(150, 100, 100);
            for ( var i = 0; i < 1; i ++ ) {

                var object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } ) );
                object.position.x = Math.random() * 800 - 400;
                object.position.y = Math.random() * 800 - 400;
                object.position.z = Math.random() * 800 - 400;

                object.scale.x = Math.random() * 2 + 1;
                object.scale.y = Math.random() * 2 + 1;
                object.scale.z = Math.random() * 2 + 1;

                object.rotation.x = Math.random() * 2 * Math.PI;
                object.rotation.y = Math.random() * 2 * Math.PI;
                object.rotation.z = Math.random() * 2 * Math.PI;

                scene.add( object );

                objects.push( object );

            }

            var PI2 = Math.PI * 2;
            particleMaterial = new THREE.SpriteCanvasMaterial( {

                color: 0x000000,
                program: function ( context ) {

                    context.beginPath();
                    context.arc( 0, 0, 0.5, 0, PI2, true );
                    context.fill();

                }

            } );

            projector = new THREE.Projector();

            renderer = new THREE.WebGLRenderer();
            renderer.setClearColor( 0xf0f0f0 );
            renderer.setSize( window.innerWidth, window.innerHeight );

            container.appendChild( renderer.domElement );

            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            container.appendChild( stats.domElement );

            document.addEventListener( 'mousedown', onDocumentMouseDown, false );

            //

            window.addEventListener( 'resize', onWindowResize, false );

        }

        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize( window.innerWidth, window.innerHeight );

        }

        function onDocumentMouseDown( event ) {

            event.preventDefault();

            var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
            projector.unprojectVector( vector, camera );

            var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

            var intersects = raycaster.intersectObjects( objects );

            if ( intersects.length > 0 ) {
                                    console.log("intersected");
                intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );

                var particle = new THREE.Sprite( particleMaterial );
                particle.position = intersects[ 0 ].point;
                particle.scale.x = particle.scale.y = 16;
                scene.add( particle );

            }


        }

        //

        function animate() {

            requestAnimationFrame( animate );
                            scene.updateMatrixWorld();
            render();
            stats.update();

        }

        var radius = 600;
        var theta = 0;

        function render() {

            theta += 0.1;

            camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
            camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
            camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
            camera.lookAt( scene.position );

            renderer.render( scene, camera );

        }