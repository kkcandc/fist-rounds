import { SCENES } from './scenes.js'
import { decoyPoint, windowHole } from './logic.js'
import { paintRoom, softShadow } from './scenery.js'

const INK = '#3b2a24'

export function drawBackdrop(ctx, state) {
  switch (state.scene) {
    case 'laundry':
      drawLaundry(ctx, state)
      break
    case 'bike':
      drawBikeRoom(ctx, state)
      break
    case 'window':
      drawWindowRoom(ctx, state)
      break
    case 'statue':
      drawStatueYard(ctx, state)
      break
    case 'couch':
      drawLivingRoom(ctx, state)
      break
    case 'plant':
      drawPlantRoom(ctx, state)
      break
    case 'bubbles':
      drawBubbleYard(ctx, state)
      break
    case 'picnic':
      drawPicnic(ctx, state)
      break
    case 'hammock':
      drawPorch(ctx, state)
      break
    default:
      break
  }
}

export function drawForeground(ctx, state) {
  if (state.scene === 'bike') drawBike(ctx, state)
}

export function drawDecoyProp(ctx, state) {
  const decoy = decoyPoint(state)
  if (!decoy || state.scene === 'mirror') return
  if (state.scene === 'statue') drawBirdbath(ctx, decoy.x, decoy.y)
  if (state.scene === 'plant') drawPottedPlant(ctx, decoy.x, decoy.y, state.look)
}

function drawLaundry(ctx, state) {
  const { w, h } = state
  fillRoom(ctx, w, h, '#f7e7cf', '#e7d3b4', 0.72)
  const colors = [
    ['#ff8fab', '#7dce7a', '#ffd15c', '#8ec8ff'],
    ['#f0a56a', '#c9a0ff', '#ff7a59', '#fff'],
    ['#6ec8ff', '#ffd56a', '#ff9eb5', '#b7e38d'],
  ][state.look % 3]
  const pileX = state.guy.x
  const pileY = state.guy.y + 10
  colors.forEach((color, index) => {
    const angle = index * 1.3 + state.look
    roundRect(ctx, pileX - 70 + Math.cos(angle) * 18, pileY - 20 + index * 8, 64, 28, 10)
    ctx.fillStyle = color
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = INK
    ctx.stroke()
  })
  roundRect(ctx, w * 0.08, h * 0.62, 54, 36, 8)
  ctx.fillStyle = '#f4f1ea'
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.stroke()
}

function drawBikeRoom(ctx, state) {
  const { w, h } = state
  fillRoom(ctx, w, h, '#d9f3c8', '#c7e6b4', 0.62)
  ctx.fillStyle = '#f2e2c4'
  roundRect(ctx, 20, h * 0.66, w - 40, 18, 8)
  ctx.fill()
}

function drawBike(ctx, state) {
  const x = state.guy.x
  const y = state.guy.y + 28
  const spin = state.time * 10
  ctx.strokeStyle = INK
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  wheel(ctx, x - 28, y, 16, spin)
  wheel(ctx, x + 30, y, 16, spin)
  ctx.beginPath()
  ctx.moveTo(x - 28, y)
  ctx.lineTo(x + 4, y - 26)
  ctx.lineTo(x + 30, y)
  ctx.moveTo(x + 4, y - 26)
  ctx.lineTo(x - 8, y - 8)
  ctx.stroke()
  ctx.strokeStyle = '#ff7a59'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(x + 8, y - 24)
  ctx.lineTo(x + 26, y - 24)
  ctx.stroke()
}

function wheel(ctx, x, y, r, spin) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.strokeStyle = INK
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + Math.cos(spin) * r, y + Math.sin(spin) * r)
  ctx.lineTo(x - Math.cos(spin) * r, y - Math.sin(spin) * r)
  ctx.stroke()
}

function drawWindowRoom(ctx, state) {
  const { w, h } = state
  const frame = windowHole(state)
  fillRoom(ctx, w, h, '#efe4d6', '#d7c3a4', 0.72, {
    sky: frame,
    lightX: 0.42,
  })
  const sky = ctx.createLinearGradient(frame.x, frame.y, frame.x, frame.y + frame.h)
  sky.addColorStop(0, '#8eb7d8')
  sky.addColorStop(0.62, '#d5ebf6')
  sky.addColorStop(1, '#b7c99a')
  ctx.fillStyle = sky
  ctx.fillRect(frame.x, frame.y, frame.w, frame.h)
  ctx.fillStyle = 'rgba(255, 244, 210, 0.85)'
  ctx.beginPath()
  ctx.arc(frame.x + 36, frame.y + 28, 12, 0, Math.PI * 2)
  ctx.fill()
}

function drawStatueYard(ctx, state) {
  const { w, h } = state
  fillRoom(ctx, w, h, '#c9ecff', '#b7e38d', 0.46)
  const spec = SCENES.statue
  const x = w * spec.cx
  const y = h * spec.cy + 36
  roundRect(ctx, x - 28, y, 56, 14, 4)
  ctx.fillStyle = '#d9d3cb'
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.stroke()
  roundRect(ctx, x - 18, y + 14, 36, 10, 3)
  ctx.fillStyle = '#cfc8be'
  ctx.fill()
  ctx.stroke()
}

function drawBirdbath(ctx, x, y) {
  ctx.fillStyle = '#d7dde6'
  roundRect(ctx, x - 8, y - 6, 16, 28, 4)
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.stroke()
  ellipse(ctx, x, y - 16, 26, 10)
  ctx.fillStyle = '#9fd4ef'
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.stroke()
  ellipse(ctx, x - 4, y - 18, 8, 3)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fill()
}

function drawLivingRoom(ctx, state) {
  const { w, h } = state
  fillRoom(ctx, w, h, '#f8e4c8', '#e7c39a', 0.7)
  const seatY = state.guy.y + 20
  roundRect(ctx, w * 0.1, seatY, w * 0.8, 48, 16)
  ctx.fillStyle = '#7ea2e8'
  ctx.fill()
  ctx.lineWidth = 4
  ctx.strokeStyle = INK
  ctx.stroke()
  roundRect(ctx, w * 0.12, seatY - 28, 22, 40, 8)
  ctx.fillStyle = '#6b90d6'
  ctx.fill()
  ctx.stroke()
  roundRect(ctx, w * 0.78, seatY - 28, 22, 40, 8)
  ctx.fill()
  ctx.stroke()
}

function drawPlantRoom(ctx, state) {
  const { w, h } = state
  fillRoom(ctx, w, h, '#f3f7e8', '#e6d7bf', 0.74)
  ctx.fillStyle = '#fff6ea'
  roundRect(ctx, w * 0.08, h * 0.7, w * 0.84, 16, 8)
  ctx.fill()
}

function drawPottedPlant(ctx, x, y, look) {
  const greens = ['#67b85a', '#3f9d73', '#8bc76a']
  ctx.fillStyle = greens[look % greens.length]
  ellipse(ctx, x, y - 28, 22, 16)
  ctx.fill()
  ellipse(ctx, x - 16, y - 16, 14, 12)
  ctx.fill()
  ellipse(ctx, x + 16, y - 14, 14, 12)
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ellipse(ctx, x, y - 28, 22, 16)
  ctx.stroke()
  roundRect(ctx, x - 14, y - 4, 28, 22, 6)
  ctx.fillStyle = '#e39a4a'
  ctx.fill()
  ctx.stroke()
}

function drawBubbleYard(ctx, state) {
  const { w, h } = state
  fillRoom(ctx, w, h, '#d7f4ff', '#c6efb8', 0.58)
  for (let i = 0; i < 5; i += 1) {
    const x = w * (0.18 + i * 0.16) + Math.sin(state.time + i) * 6
    const y = h * 0.3 + Math.cos(state.time * 1.3 + i) * 12
    ctx.beginPath()
    ctx.arc(x, y, 8 + (i % 3) * 3, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.lineWidth = 3
    ctx.stroke()
  }
}

function drawPicnic(ctx, state) {
  const { w, h } = state
  fillRoom(ctx, w, h, '#c9ecff', '#b7e38d', 0.42)
  const x = state.guy.x - 90
  const y = state.guy.y - 20
  roundRect(ctx, x, y, 180, 80, 14)
  ctx.fillStyle = state.look % 2 === 0 ? '#ff8b7b' : '#f2d15a'
  ctx.fill()
  ctx.lineWidth = 4
  ctx.strokeStyle = INK
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = 3
  for (let col = 0; col < 5; col += 1) {
    ctx.beginPath()
    ctx.moveTo(x + 20 + col * 32, y + 8)
    ctx.lineTo(x + 20 + col * 32, y + 72)
    ctx.stroke()
  }
}

function drawPorch(ctx, state) {
  const { w, h } = state
  fillRoom(ctx, w, h, '#f6e2c4', '#e7c49a', 0.72)
  const y = state.guy.y
  ctx.strokeStyle = INK
  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(w * 0.16, y - 70)
  ctx.lineTo(w * 0.16, y + 50)
  ctx.moveTo(w * 0.84, y - 70)
  ctx.lineTo(w * 0.84, y + 50)
  ctx.stroke()
  ctx.strokeStyle = '#6f97e4'
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.moveTo(w * 0.16, y - 20)
  ctx.quadraticCurveTo(w * 0.5, y + 48, w * 0.84, y - 20)
  ctx.stroke()
  ctx.strokeStyle = '#8eb4f2'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(w * 0.2, y - 14)
  ctx.quadraticCurveTo(w * 0.5, y + 36, w * 0.8, y - 14)
  ctx.stroke()
}

function fillRoom(ctx, w, h, top, bottom, split, extra = {}) {
  paintRoom(ctx, w, h, {
    wall: top,
    wallLight: top,
    wallShade: top,
    floorLight: bottom,
    floorDark: bottom,
    plank: 'rgba(70, 44, 24, 0.18)',
    trim: '#f4efe8',
    horizon: split,
    lightX: extra.lightX ?? 0.7,
    sky: extra.sky,
  })
  softShadow(ctx, w * 0.5, h * split + 8, w * 0.28, 14)
}

function circle(ctx, x, y, r) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath()
  ctx.ellipse(x, y, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2)
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}
