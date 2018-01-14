varying vec3 p;
uniform vec3 cameraPos;

void main() {
	p = position - cameraPos; 
	gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
}