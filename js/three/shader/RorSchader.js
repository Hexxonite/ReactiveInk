/**
 * @author D.Thiele @https://hexx.one
 * 
 * converted from: https://www.shadertoy.com/view/Md33zB
 */

THREE.RorSchader = {

    shaderID: "rorSchader",

    uniforms: {
        tDiffuse: { value: null },
        iTime: { value: 1.0 },
        timeBoost: { value: 0.1 },
        inkColor: { value: new THREE.Vector3(0.01, 0.01, 0.1) },
        paperColor: { value: new THREE.Vector3(1, 0.9, 0.8) },
        speed: { value: 0.0075 },
        shade_contrast: { value: 0.55 },
    },

    // Default vertex shader
    vertexShader: `
    precision lowp float;
    //shaderquality
    
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `,

    // A noise function mirrored and thresholded to maximize the value at the center of the screen
    // Combined with a second layer of noise to produce an ink on paper effect
    // 3D simplex noise taken from: https://www.shadertoy.com/view/XsX3zB
    fragmentShader: `
    precision lowp float;
    //shaderquality
    
    uniform float iTime;
    uniform float timeBoost;
	uniform sampler2D tDiffuse;
    uniform vec3 inkColor;
    uniform vec3 paperColor;
    uniform float speed;
    uniform float shade_contrast;
      
    const float F3 =  0.3333333;
    const float G3 =  0.1666667;
      
    varying vec2 vUv;

    vec3 random3(vec3 c) {
        float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
        vec3 r;
        r.z = fract(512.0*j);
        j *= .125;
        r.x = fract(512.0*j);
        j *= .125;
        r.y = fract(512.0*j);
        return r-0.5;
    }
    
    float simplex3d(vec3 p) {
         vec3 s = floor(p + dot(p, vec3(F3)));
         vec3 x = p - s + dot(s, vec3(G3));
         
         vec3 e = step(vec3(0.0), x - x.yzx);
         vec3 i1 = e*(1.0 - e.zxy);
         vec3 i2 = 1.0 - e.zxy*(1.0 - e);
         
         vec3 x1 = x - i1 + G3;
         vec3 x2 = x - i2 + 2.0*G3;
         vec3 x3 = x - 1.0 + 3.0*G3;
         
         vec4 w, d;
         
         w.x = dot(x, x);
         w.y = dot(x1, x1);
         w.z = dot(x2, x2);
         w.w = dot(x3, x3);
         
         w = max(0.6 - w, 0.0);
         
         d.x = dot(random3(s), x);
         d.y = dot(random3(s + i1), x1);
         d.z = dot(random3(s + i2), x2);
         d.w = dot(random3(s + 1.0), x3);
         
         w *= w;
         w *= w;
         d *= w;
         
         return dot(d, vec4(52.0));
    }
    
    float fbm(vec3 p) {
        float f = 0.0;	
        float frequency = 1.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++)
        {
            f += simplex3d(p * frequency) * amplitude;
            amplitude *= 0.5;
            frequency *= 2.0 + float(i) / 100.0;
        }
        return min(f, 1.0);
    }
    
    void main() {
        vec2 uv = 1.0 - vUv;
        vec2 coord = 1.0 - uv * 2.0;
        uv.x = 1.0 - abs(1.0 - uv.x * 2.0);
        vec3 p = vec3(uv.x, uv.y, (iTime + timeBoost) * speed);
        
        float blot = fbm(p * 3.0 + 8.0);
        float shade = fbm(p * 2.0 + 16.0);
        
        blot = (blot + (sqrt(uv.x) - abs(0.5 - uv.y)));
        blot = smoothstep(0.65, 0.71, blot) * max(1.0 - shade * shade_contrast, 0.0);
        
        gl_FragColor = vec4(mix(paperColor, inkColor, blot), 1.0);
        gl_FragColor.rgb *= 1.0 - pow(max(length(coord) - 0.5, 0.0), 5.0);
    }
    `,
};
