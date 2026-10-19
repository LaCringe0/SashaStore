import gsap from 'gsap'
import confetti from 'canvas-confetti'

// Салют из эмодзи при выписке чека
export function fireDramaConfetti() {
  const scalar = 2.2
  const euro = confetti.shapeFromText({ text: '💶', scalar })
  const heart = confetti.shapeFromText({ text: '💔', scalar })
  const gavel = confetti.shapeFromText({ text: '⚖️', scalar })
  const fire = confetti.shapeFromText({ text: '🔥', scalar })

  confetti({
    shapes: [euro, heart, gavel, fire],
    particleCount: 45,
    spread: 90,
    origin: { y: 0.6 },
    scalar
  })
}

// Землетрясение экрана при крупном штрафе или уровне "Оскар"
export function triggerScreenShake(intensity: 'medium' | 'heavy' = 'medium') {
  const power = intensity === 'heavy' ? 12 : 5
  gsap.fromTo(
    'body',
    { x: -power, y: power },
    {
      x: power,
      y: -power,
      duration: 0.06,
      repeat: intensity === 'heavy' ? 7 : 4,
      yoyo: true,
      ease: 'power1.inOut',
      onComplete: () => {
        gsap.set('body', { clearProps: 'x,y' })
      }
    }
  )
}