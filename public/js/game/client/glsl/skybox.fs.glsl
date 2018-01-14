// UNIFORMS
uniform samplerCube skybox;
varying vec3 p;

void main() {
	gl_FragColor = textureCube(skybox,p);
}