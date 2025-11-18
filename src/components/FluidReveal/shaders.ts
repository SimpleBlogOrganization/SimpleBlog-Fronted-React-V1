export const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const fluidFragmentShader = `
uniform sampler2D uPrevTrails;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uResolution;
uniform float uDecay;
uniform bool uIsMoving;
uniform float uBrushSize;
uniform float uBrushIntensity;
uniform bool uIsExploding;
uniform vec2 uExplodeCenter;
uniform float uExplodeRadius;

varying vec2 vUv;

void main() {
    vec4 prevState = texture2D(uPrevTrails, vUv);
    
    float newValue = prevState.r * uDecay;
    
    // 圆形爆炸扩散模式
    if (uIsExploding) {
        float dist = length(vUv - uExplodeCenter);
        float edgeWidth = 0.05; // 边缘宽度
        float innerRadius = max(0.0, uExplodeRadius - edgeWidth);
        float outerRadius = uExplodeRadius;
        
        // 在半径范围内，使用平滑过渡
        float t = smoothstep(outerRadius, innerRadius, dist);
        float intensity = t * uBrushIntensity;
        
        newValue += intensity;
        newValue = min(newValue, 1.0);
    }
    // 正常的鼠标移动模式
    else if (uIsMoving) {
        vec2 mouseDirection = uMouse - uPrevMouse;
        float lineLength = length(mouseDirection);
        
        if (lineLength > 0.001) {
            vec2 mouseDir = mouseDirection / lineLength;

            vec2 toPixel = vUv - uPrevMouse;
            float projAlong = dot(toPixel, mouseDir);
            projAlong = clamp(projAlong, 0.0, lineLength);

            vec2 closestPoint = uPrevMouse + projAlong * mouseDir;
            float dist = length(vUv - closestPoint);
            
            float lineWidth = uBrushSize;
            float intensity = smoothstep(lineWidth, 0.0, dist) * uBrushIntensity;

            newValue += intensity;
            newValue = min(newValue, 1.0);
        }
    }
    
    gl_FragColor = vec4(newValue, newValue, newValue, 1.0);
}
`

export const displayFragmentShader = `
uniform sampler2D uFluid;
uniform sampler2D uTopTexture;
uniform sampler2D uBottomTexture;
uniform vec2 uResolution;
uniform float uDpr;
uniform vec2 uTopTextureSize;
uniform vec2 uBottomTextureSize;

varying vec2 vUv;

vec2 getCoverUV(vec2 uv, vec2 textureSize) {
    if (textureSize.x < 1.0 || textureSize.y < 1.0) return uv;

    vec2 s = uResolution / textureSize;
    
    float scale = max(s.x, s.y);
    
    vec2 scaledSize = textureSize * scale;
    
    vec2 offset = (uResolution - scaledSize) * 0.5;
    
    return (uv * uResolution - offset) / scaledSize;
}

void main() {
    float fluid = texture2D(uFluid, vUv).r;

    vec2 topUV = getCoverUV(vUv, uTopTextureSize);
    vec2 bottomUV = getCoverUV(vUv, uBottomTextureSize);

    vec4 topColor = texture2D(uTopTexture, topUV);
    vec4 bottomColor = texture2D(uBottomTexture, bottomUV);
    
    float threshold = 0.02;
    float edgeWidth = 0.004 / uDpr;

    float t = smoothstep(threshold, threshold + edgeWidth, fluid);
    
    // 使用 Premultiplied Alpha 混合，避免透明像素的 RGB 污染结果
    vec3 topPremult = topColor.rgb * topColor.a;
    vec3 bottomPremult = bottomColor.rgb * bottomColor.a;
    
    vec3 mixedPremult = mix(topPremult, bottomPremult, t);
    float mixedAlpha = mix(topColor.a, bottomColor.a, t);
    
    // Unpremultiply：还原 RGB（避免除以零）
    vec3 finalRGB = mixedAlpha > 0.001 ? mixedPremult / mixedAlpha : vec3(0.0);
    
    gl_FragColor = vec4(finalRGB, mixedAlpha);
}
`
