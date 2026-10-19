<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'

const props = defineProps<{
  billEur: number // Текущий счёт в евро (меняет атмосферу)
  cartCount: number // При изменении срабатывает волна-импульс
}>()

const containerRef = ref<HTMLDivElement | null>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animationFrameId: number
let objectsGroup: THREE.Group
let pointLight1: THREE.PointLight
let pointLight2: THREE.PointLight

const meshes: {
  mesh: THREE.Mesh
  baseSpeedX: number
  baseSpeedY: number
  floatOffset: number
}[] = []

let mouseX = 0
let mouseY = 0
let rageMultiplier = 1 // Ускорение вращения от суммы чека

// Генерация 3D-геометрии сердца
function createHeartGeometry() {
  const x = 0, y = 0
  const heartShape = new THREE.Shape()
  heartShape.moveTo(x + 0.25, y + 0.25)
  heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y)
  heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35)
  heartShape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95)
  heartShape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35)
  heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y)
  heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25)

  const extrudeSettings = {
    depth: 0.2,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 2,
    bevelSize: 0.08,
    bevelThickness: 0.08
  }

  const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings)
  geometry.center()
  geometry.rotateZ(Math.PI) // Переворачиваем сердце правильной стороной вверх
  return geometry
}

onMounted(() => {
  if (!containerRef.value) return

  // 1. Инициализация сцены
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 12

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  containerRef.value.appendChild(renderer.domElement)

  objectsGroup = new THREE.Group()
  scene.add(objectsGroup)

  // 2. Освещение
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
  scene.add(ambientLight)

  pointLight1 = new THREE.PointLight(0xff2a85, 35, 30)
  pointLight1.position.set(6, 6, 6)
  scene.add(pointLight1)

  pointLight2 = new THREE.PointLight(0x9333ea, 35, 30)
  pointLight2.position.set(-6, -6, 5)
  scene.add(pointLight2)

  // 3. Материалы (глянцевый леденец / стекло)
  const heartMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf43f5e,
    roughness: 0.15,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.1
  })

  const crystalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xa855f7,
    roughness: 0.1,
    metalness: 0.2,
    transmission: 0.4,
    thickness: 1.0,
    clearcoat: 1
  })

  const heartGeo = createHeartGeometry()
  const crystalGeo = new THREE.OctahedronGeometry(0.55, 0) // Кристаллы
  const ringGeo = new THREE.TorusGeometry(0.45, 0.15, 16, 40) // Пончики/кольца

  // 4. Спавним 22 объекта в пространстве
  for (let i = 0; i < 22; i++) {
    const type = i % 3
    const geo = type === 0 ? heartGeo : type === 1 ? crystalGeo : ringGeo
    const mat = type === 0 ? heartMaterial.clone() : crystalMaterial.clone()

    const mesh = new THREE.Mesh(geo, mat)

    mesh.position.set(
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 8 - 2
    )

    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
    const scale = 0.6 + Math.random() * 0.8
    mesh.scale.set(scale, scale, scale)

    objectsGroup.add(mesh)
    meshes.push({
      mesh,
      baseSpeedX: (Math.random() - 0.5) * 0.015,
      baseSpeedY: (Math.random() - 0.5) * 0.015,
      floatOffset: Math.random() * Math.PI * 2
    })
  }

  // 5. Анимационный цикл
  const clock = new THREE.Clock()

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    const elapsed = clock.getElapsedTime()

    // Плавный параллакс всей группы за мышкой
    objectsGroup.rotation.y += (mouseX * 0.25 - objectsGroup.rotation.y) * 0.05
    objectsGroup.rotation.x += (mouseY * 0.25 - objectsGroup.rotation.x) * 0.05

    // Вращение и левитация каждой фигуры
    meshes.forEach(item => {
      item.mesh.rotation.x += item.baseSpeedX * rageMultiplier
      item.mesh.rotation.y += item.baseSpeedY * rageMultiplier
      item.mesh.position.y += Math.sin(elapsed * 1.5 + item.floatOffset) * 0.005 * rageMultiplier
    })

    renderer.render(scene, camera)
  }

  animate()

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('resize', onResize)
})

function onMouseMove(e: MouseEvent) {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1
  mouseY = (e.clientY / window.innerHeight) * 2 - 1
}

function onResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// Реакция 3D-сцены на рост суммы штрафа
watch(
  () => props.billEur,
  newBill => {
    // Чем выше чек — тем быстрее крутятся объекты (до x6 скорости)
    rageMultiplier = Math.min(1 + newBill * 0.15, 6)

    if (!pointLight1) return
    if (newBill >= 15) {
      // Режим "Красная тревога"
      gsap.to(pointLight1.color, { r: 1, g: 0, b: 0, duration: 0.8 })
      gsap.to(pointLight1, { intensity: 80, duration: 0.8 })
    } else {
      gsap.to(pointLight1.color, { r: 1, g: 0.16, b: 0.52, duration: 0.8 })
      gsap.to(pointLight1, { intensity: 35, duration: 0.8 })
    }
  }
)

// Импульс 3D-объектов при добавлении товара в корзину
watch(
  () => props.cartCount,
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      meshes.forEach(item => {
        gsap.fromTo(
          item.mesh.scale,
          { x: item.mesh.scale.x * 1.35, y: item.mesh.scale.y * 1.35, z: item.mesh.scale.z * 1.35 },
          { x: item.mesh.scale.x, y: item.mesh.scale.y, z: item.mesh.scale.z, duration: 0.6, ease: 'elastic.out(1, 0.4)' }
        )
      })
    }
  }
)

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onResize)
  renderer?.dispose()
})
</script>

<template>
  <div
    ref="containerRef"
    class="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-85"
  />
</template>