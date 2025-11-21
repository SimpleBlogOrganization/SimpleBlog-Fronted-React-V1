import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import * as THREE from 'three'
import {
  vertexShader,
  fluidFragmentShader,
  displayFragmentShader,
} from './shaders'
import type { FluidRevealProps, FluidRevealRef } from './type'
import './index.scss'

// 常量
const EXPLODE_MAX_RADIUS = Math.sqrt(2) / 2 + 0.1

const FluidReveal = forwardRef<FluidRevealRef, FluidRevealProps>(
  (
    {
      topImage,
      bottomImage,
      resolution = 500,
      decay = 0.97,
      className = '',
      style,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationFrameRef = useRef<number | null>(null)

    // Refs for sharing between effects
    const displayMaterialRef = useRef<THREE.ShaderMaterial | null>(null)
    const topTextureSizeRef = useRef<THREE.Vector2 | null>(null)
    const bottomTextureSizeRef = useRef<THREE.Vector2 | null>(null)
    const placeholderTopTextureRef = useRef<THREE.Texture | null>(null)
    const placeholderBottomTextureRef = useRef<THREE.Texture | null>(null)

    // 反转控制
    const isReversingRef = useRef(false)
    const currentTopImageRef = useRef(topImage)
    const currentBottomImageRef = useRef(bottomImage)
    const hasSwappedRef = useRef(false)
    const isFullyClearedRef = useRef(false)
    const checkClearIntervalRef = useRef<number | null>(null)
    const trailsMaterialRef = useRef<THREE.ShaderMaterial | null>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const pingPongTargetsRef = useRef<THREE.WebGLRenderTarget[]>([])
    const originalDecayRef = useRef(decay)
    const explodeRadiusRef = useRef(0)
    const explodeStartTimeRef = useRef(0)

    // 常量
    const CLEAR_THRESHOLD = 0.85
    const EXPLODE_DURATION = 1000
    const CHECK_INTERVAL = 200
    const MOVE_TIMEOUT = 50
    const MAX_TEXTURE_SIZE = 4096
    const DEFAULT_BRUSH_SIZE = 0.09
    const DEFAULT_BRUSH_INTENSITY = 0.3
    const EXPLODE_BRUSH_INTENSITY = 1.0

    // 检测是否完全清理（简化版：直接检查最小值）
    const checkFullyCleared = (
      renderTarget: THREE.WebGLRenderTarget,
      renderer: THREE.WebGLRenderer
    ): boolean => {
      const width = renderTarget.width
      const height = renderTarget.height
      const pixels = new Float32Array(width * height * 4)

      renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixels)

      // 检查所有像素的最小值
      let minValue = 1.0
      for (let i = 0; i < width * height; i++) {
        minValue = Math.min(minValue, pixels[i * 4])
        if (minValue < CLEAR_THRESHOLD) return false // 提前退出
      }

      return minValue >= CLEAR_THRESHOLD
    }

    // 暴露 reverse 方法
    useImperativeHandle(
      ref,
      () => ({
        reverse: () => {
          if (isReversingRef.current) return // 如果正在反转，忽略新的请求

          isReversingRef.current = true
          hasSwappedRef.current = false
          isFullyClearedRef.current = false
          explodeRadiusRef.current = 0
          explodeStartTimeRef.current = performance.now()

          // 启用爆炸模式，并禁用衰减（decay = 1）
          if (trailsMaterialRef.current) {
            originalDecayRef.current =
              trailsMaterialRef.current.uniforms.uDecay.value
            trailsMaterialRef.current.uniforms.uIsExploding.value = true
            trailsMaterialRef.current.uniforms.uExplodeCenter.value.set(
              0.5,
              0.5
            ) // 中心点
            trailsMaterialRef.current.uniforms.uExplodeRadius.value = 0.0
            trailsMaterialRef.current.uniforms.uBrushIntensity.value =
              EXPLODE_BRUSH_INTENSITY
            trailsMaterialRef.current.uniforms.uDecay.value = 1.0 // 不衰减，已揭示的地方不会恢复
          }

          // 开始检测是否完全清理
          if (checkClearIntervalRef.current) {
            clearInterval(checkClearIntervalRef.current)
          }

          checkClearIntervalRef.current = window.setInterval(() => {
            if (
              !isReversingRef.current ||
              hasSwappedRef.current ||
              !rendererRef.current ||
              pingPongTargetsRef.current.length < 2
            ) {
              if (checkClearIntervalRef.current) {
                clearInterval(checkClearIntervalRef.current)
                checkClearIntervalRef.current = null
              }
              return
            }

            // 检测两个渲染目标是否都完全清理
            const [target1, target2] = pingPongTargetsRef.current
            if (
              checkFullyCleared(target1, rendererRef.current) &&
              checkFullyCleared(target2, rendererRef.current)
            ) {
              isFullyClearedRef.current = true
              if (checkClearIntervalRef.current) {
                clearInterval(checkClearIntervalRef.current)
                checkClearIntervalRef.current = null
              }
            }
          }, CHECK_INTERVAL)
        },
      }),
      []
    )

    // 同步 props 到 refs
    useEffect(() => {
      currentTopImageRef.current = topImage
      currentBottomImageRef.current = bottomImage
      originalDecayRef.current = decay
    }, [topImage, bottomImage, decay])

    // Scene initialization - only rebuild when resolution/decay changes
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        precision: 'highp',
        alpha: true,
        premultipliedAlpha: false,
      })

      rendererRef.current = renderer

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      // 设置清除颜色为透明，避免频繁刷新时闪白底
      renderer.setClearColor(0x000000, 0)

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

      const mouse = new THREE.Vector2(0.5, 0.5)
      const prevMouse = new THREE.Vector2(0.5, 0.5)
      let isMoving = false
      let lastMoveTime = 0
      let isFirstMove = true // 标记是否是第一次移动

      const pingPongTargets = [
        new THREE.WebGLRenderTarget(resolution, resolution, {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          type: THREE.FloatType,
        }),
        new THREE.WebGLRenderTarget(resolution, resolution, {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          type: THREE.FloatType,
        }),
      ]
      pingPongTargetsRef.current = pingPongTargets
      let currentTarget = 0

      const createPlaceholderTexture = (color: string) => {
        const size = 512
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return new THREE.Texture()
        ctx.fillStyle = color
        ctx.fillRect(0, 0, size, size)

        const texture = new THREE.Texture(canvas)
        texture.minFilter = THREE.LinearFilter
        return texture
      }

      const topTexture = createPlaceholderTexture('#0000ff')
      const bottomTexture = createPlaceholderTexture('#ff0000')

      const topTextureSize = new THREE.Vector2(1, 1)
      const bottomTextureSize = new THREE.Vector2(1, 1)

      const trailsMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uPrevTrails: { value: null },
          uMouse: { value: mouse },
          uPrevMouse: { value: prevMouse },
          uResolution: { value: new THREE.Vector2(resolution, resolution) },
          uDecay: { value: decay },
          uIsMoving: { value: false },
          uBrushSize: { value: DEFAULT_BRUSH_SIZE },
          uBrushIntensity: { value: DEFAULT_BRUSH_INTENSITY },
          uIsExploding: { value: false },
          uExplodeCenter: { value: new THREE.Vector2(0.5, 0.5) },
          uExplodeRadius: { value: 0.0 },
        },
        vertexShader,
        fragmentShader: fluidFragmentShader,
      })

      trailsMaterialRef.current = trailsMaterial

      const displayMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uFluid: { value: null },
          uTopTexture: { value: topTexture },
          uBottomTexture: { value: bottomTexture },
          uResolution: {
            value: new THREE.Vector2(
              canvas.offsetWidth || canvas.clientWidth,
              canvas.offsetHeight || canvas.clientHeight
            ),
          },
          uDpr: { value: window.devicePixelRatio },
          uTopTextureSize: { value: topTextureSize },
          uBottomTextureSize: { value: bottomTextureSize },
        },
        vertexShader,
        fragmentShader: displayFragmentShader,
      })

      displayMaterialRef.current = displayMaterial
      topTextureSizeRef.current = topTextureSize
      bottomTextureSizeRef.current = bottomTextureSize
      placeholderTopTextureRef.current = topTexture
      placeholderBottomTextureRef.current = bottomTexture

      // 初始化尺寸（必须在 displayMaterial 定义之后）
      const updateSize = () => {
        const width = canvas.offsetWidth || canvas.clientWidth
        const height = canvas.offsetHeight || canvas.clientHeight
        if (width > 0 && height > 0) {
          renderer.setSize(width, height, false)
          displayMaterial.uniforms.uResolution.value.set(width, height)
        }
      }
      updateSize()

      const planeGeometry = new THREE.PlaneGeometry(2, 2)
      const displayMesh = new THREE.Mesh(planeGeometry, displayMaterial)
      scene.add(displayMesh)

      const simMesh = new THREE.Mesh(planeGeometry, trailsMaterial)
      const simScene = new THREE.Scene()
      simScene.add(simMesh)

      renderer.setRenderTarget(pingPongTargets[0])
      renderer.clear()
      renderer.setRenderTarget(pingPongTargets[1])
      renderer.clear()
      renderer.setRenderTarget(null)

      // 更新鼠标位置的公共逻辑
      const updateMousePosition = (clientX: number, clientY: number) => {
        const canvasRect = canvas.getBoundingClientRect()
        const inBounds =
          clientX >= canvasRect.left &&
          clientX <= canvasRect.right &&
          clientY >= canvasRect.top &&
          clientY <= canvasRect.bottom

        if (inBounds) {
          const newX = (clientX - canvasRect.left) / canvasRect.width
          const newY = 1 - (clientY - canvasRect.top) / canvasRect.height

          if (isFirstMove) {
            // 第一次移动：同时更新 prevMouse 和 mouse，避免从中心跳到鼠标位置
            mouse.set(newX, newY)
            prevMouse.set(newX, newY)
            isFirstMove = false
            isMoving = false // 第一次不绘制线条
          } else {
            // 后续移动：正常更新
            prevMouse.copy(mouse)
            mouse.set(newX, newY)
            isMoving = true
          }
          lastMoveTime = performance.now()
        } else {
          isMoving = false
          // 鼠标离开后，下次进入时重置为第一次移动
          isFirstMove = true
        }
      }

      const onMouseMove = (event: MouseEvent) => {
        updateMousePosition(event.clientX, event.clientY)
      }

      const onTouchMove = (event: TouchEvent) => {
        if (event.touches.length > 0) {
          event.preventDefault()
          updateMousePosition(
            event.touches[0].clientX,
            event.touches[0].clientY
          )
        }
      }

      const onWindowResize = () => {
        updateSize()
        displayMaterial.uniforms.uDpr.value = window.devicePixelRatio
      }

      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate)

        if (isMoving && performance.now() - lastMoveTime > MOVE_TIMEOUT) {
          isMoving = false
        }

        // 处理圆形爆炸扩散
        if (isReversingRef.current && trailsMaterialRef.current) {
          const progress = Math.min(
            (performance.now() - explodeStartTimeRef.current) /
              EXPLODE_DURATION,
            1
          )
          const easedProgress = 1 - Math.pow(1 - progress, 3) // cubic ease-out

          explodeRadiusRef.current = easedProgress * EXPLODE_MAX_RADIUS
          trailsMaterialRef.current.uniforms.uExplodeRadius.value =
            explodeRadiusRef.current
        }

        const prevTarget = pingPongTargets[currentTarget]
        currentTarget = (currentTarget + 1) % 2
        const currentRenderTarget = pingPongTargets[currentTarget]

        trailsMaterial.uniforms.uPrevTrails.value = prevTarget.texture
        trailsMaterial.uniforms.uMouse.value.copy(mouse)
        trailsMaterial.uniforms.uPrevMouse.value.copy(prevMouse)
        trailsMaterial.uniforms.uIsMoving.value = isMoving

        renderer.setRenderTarget(currentRenderTarget)
        renderer.render(simScene, camera)

        // 如果正在反转且已完全清理，交换图片
        if (
          isReversingRef.current &&
          !hasSwappedRef.current &&
          isFullyClearedRef.current
        ) {
          // 交换图片引用
          ;[currentTopImageRef.current, currentBottomImageRef.current] = [
            currentBottomImageRef.current,
            currentTopImageRef.current,
          ]

          // 交换纹理尺寸
          if (topTextureSizeRef.current && bottomTextureSizeRef.current) {
            const tempSize = topTextureSizeRef.current.clone()
            topTextureSizeRef.current.copy(bottomTextureSizeRef.current)
            bottomTextureSizeRef.current.copy(tempSize)
          }

          // 交换纹理
          const tempTex = displayMaterial.uniforms.uTopTexture.value
          displayMaterial.uniforms.uTopTexture.value =
            displayMaterial.uniforms.uBottomTexture.value
          displayMaterial.uniforms.uBottomTexture.value = tempTex

          hasSwappedRef.current = true

          // 清空流体值
          pingPongTargets.forEach((target) => {
            renderer.setRenderTarget(target)
            renderer.clear()
          })
          renderer.setRenderTarget(null)

          // 恢复参数并关闭爆炸模式
          if (trailsMaterialRef.current) {
            const uniforms = trailsMaterialRef.current.uniforms
            uniforms.uBrushSize.value = DEFAULT_BRUSH_SIZE
            uniforms.uBrushIntensity.value = DEFAULT_BRUSH_INTENSITY
            uniforms.uDecay.value = originalDecayRef.current
            uniforms.uIsExploding.value = false
            uniforms.uExplodeRadius.value = 0.0
          }

          // 重置状态
          isReversingRef.current = false
          isFullyClearedRef.current = false
        }

        displayMaterial.uniforms.uFluid.value = currentRenderTarget.texture

        renderer.setRenderTarget(null)
        // 清除主 canvas 背景为透明，避免频繁刷新时闪白底
        renderer.clear()
        renderer.render(scene, camera)
      }

      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('resize', onWindowResize)

      const resizeObserver = new ResizeObserver(() => {
        updateSize()
      })
      resizeObserver.observe(canvas)

      animate()

      return () => {
        resizeObserver.disconnect()
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('touchmove', onTouchMove)
        window.removeEventListener('resize', onWindowResize)

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }

        renderer.dispose()
        pingPongTargets.forEach((target) => target.dispose())
        trailsMaterial.dispose()
        displayMaterial.dispose()
        planeGeometry.dispose()
        topTexture.dispose()
        bottomTexture.dispose()

        // Clear refs
        displayMaterialRef.current = null
        topTextureSizeRef.current = null
        bottomTextureSizeRef.current = null
        placeholderTopTextureRef.current = null
        placeholderBottomTextureRef.current = null
        trailsMaterialRef.current = null
        rendererRef.current = null
        pingPongTargetsRef.current = []

        if (checkClearIntervalRef.current) {
          clearInterval(checkClearIntervalRef.current)
          checkClearIntervalRef.current = null
        }
      }
    }, [resolution, decay])

    // Image loading - only update textures when images change
    useEffect(() => {
      const displayMaterial = displayMaterialRef.current
      const topTextureSize = topTextureSizeRef.current
      const bottomTextureSize = bottomTextureSizeRef.current

      if (!displayMaterial || !topTextureSize || !bottomTextureSize) return

      const loadImage = (
        url: string,
        textureSizeVector: THREE.Vector2,
        type: 'top' | 'bottom'
      ) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const originalWidth = img.width
          const originalHeight = img.height
          textureSizeVector.set(originalWidth, originalHeight)

          let newWidth = originalWidth
          let newHeight = originalHeight

          if (
            originalWidth > MAX_TEXTURE_SIZE ||
            originalHeight > MAX_TEXTURE_SIZE
          ) {
            const scale =
              originalWidth > originalHeight
                ? MAX_TEXTURE_SIZE / originalWidth
                : MAX_TEXTURE_SIZE / originalHeight
            newWidth = Math.floor(originalWidth * scale)
            newHeight = Math.floor(originalHeight * scale)
          }

          const canvas = document.createElement('canvas')
          canvas.width = newWidth
          canvas.height = newHeight
          const ctx = canvas.getContext('2d', {
            alpha: true,
            willReadFrequently: false,
          })
          if (!ctx) return

          // 使用标准平滑，避免过度平滑产生描边
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'medium'
          ctx.drawImage(img, 0, 0, newWidth, newHeight)

          const newTexture = new THREE.CanvasTexture(canvas)
          // 使用 mipmap 过滤，改善缩放时的边缘质量
          newTexture.minFilter = THREE.LinearMipmapLinearFilter
          newTexture.magFilter = THREE.LinearFilter
          newTexture.premultiplyAlpha = false
          newTexture.generateMipmaps = true
          // 设置纹理包装模式为 clamp，避免边缘重复产生描边
          newTexture.wrapS = THREE.ClampToEdgeWrapping
          newTexture.wrapT = THREE.ClampToEdgeWrapping
          newTexture.anisotropy = 16

          // Dispose old texture before replacing (but not placeholder textures)
          const oldTexture =
            type === 'top'
              ? displayMaterial.uniforms.uTopTexture.value
              : displayMaterial.uniforms.uBottomTexture.value
          const placeholderTexture =
            type === 'top'
              ? placeholderTopTextureRef.current
              : placeholderBottomTextureRef.current
          if (oldTexture && oldTexture !== placeholderTexture) {
            oldTexture.dispose()
          }

          if (type === 'top') {
            displayMaterial.uniforms.uTopTexture.value = newTexture
          } else {
            displayMaterial.uniforms.uBottomTexture.value = newTexture
          }
        }

        img.onerror = () => {
          console.error(`Error loading image: ${url}`)
        }

        img.src = url
      }

      loadImage(currentTopImageRef.current, topTextureSize, 'top')
      loadImage(currentBottomImageRef.current, bottomTextureSize, 'bottom')
    }, [topImage, bottomImage])

    return (
      <canvas
        ref={canvasRef}
        className={`fluid-reveal ${className}`}
        style={style}
      />
    )
  }
)

FluidReveal.displayName = 'FluidReveal'

export default FluidReveal
export type { FluidRevealProps, FluidRevealRef } from './type'
