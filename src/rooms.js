import { SCENES } from './scenes.js'
import { decoyPoint, windowHole } from './logic.js'
import { cabinet, drawDollhouse, houseBox, rug } from './scenery.js'

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
  const { w } = state
  drawDollhouse(ctx, state, {
    floorDark: '#cbb89a',
    floorLight: '#e7d7bc',
    wallLight: '#fbf6ee',
    wall: '#f4eadc',
    wallShade: '#e0d2be',
    trim: '#f7f1e8',
    plank: 'rgba(120, 90, 60, 0.16)',
  })
  const box = houseBox(state)
  cabinet(ctx, 32, box.backY + 8, 78, 26, 64, {
    light: '#f7f7f7',
    face: '#e6e6e6',
    top: '#ffffff',
    side: '#bdbdbd',
    edge: 'rgba(70, 70, 70, 0.35)',
  })
  ctx.beginPath()
  ctx.arc(71, box.backY - 22, 16, 0, Math.PI * 2)
  ctx.fillStyle = '#b9dff2'
  ctx.fill()
  ctx.strokeStyle = '#9a9a9a'
  ctx.lineWidth = 3
  ctx.stroke()
  cabinet(ctx, w - 132, box.backY + 20, 72, 18, 34, {
    light: '#f0d7a2',
    face: '#d7b06a',
    top: '#f6e6c4',
    side: '#a07838',
    edge: 'rgba(80, 50, 20, 0.4)',
  })
  const colors = [
    ['#ff8fab', '#7dce7a', '#ffd15c', '#8ec8ff'],
    ['#f0a56a', '#c9a0ff', '#ff7a59', '#fff'],
    ['#6ec8ff', '#ffd56a', '#ff9eb5', '#b7e38d'],
  ][state.look % 3]
  colors.forEach((color, index) => {
    rug(ctx, state.guy.x - 78 + index * 22, state.guy.y - 8 + index * 6, 58, 22, color)
  })
}

function drawBikeRoom(ctx, state) {
  const { w } = state
  drawDollhouse(ctx, state, {
    floorDark: '#b7a07a',
    floorLight: '#dcc8a4',
    wallLight: '#f4f7ee',
    wall: '#e4ecd8',
    wallShade: '#c9d4b4',
    trim: '#efe8dc',
    plank: 'rgba(90, 70, 40, 0.2)',
  })
  const box = houseBox(state)
  cabinet(ctx, 28, box.backY + 16, Math.min(110, w * 0.28), 18, 26, {
    light: '#f2e2c4',
    face: '#d7c09a',
    top: '#f8edd4',
    side: '#b89868',
    edge: 'rgba(80, 55, 30, 0.35)',
  })
  cabinet(ctx, w - 108, box.backY + 10, 58, 16, 40, {
    light: '#c9955c',
    face: '#a56a32',
    top: '#e2b06a',
    side: '#7a4e24',
    edge: 'rgba(60, 36, 16, 0.4)',
  })
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
  drawDollhouse(ctx, state, {
    floorDark: '#c4a57a',
    floorLight: '#e6d2ae',
    wallLight: '#fbf6ee',
    wall: '#f0e6d8',
    wallShade: '#ddd0be',
    trim: '#f7f1e8',
    plank: 'rgba(90, 60, 30, 0.2)',
  })
  const frame = windowHole(state)
  const sky = ctx.createLinearGradient(frame.x, frame.y, frame.x, frame.y + frame.h)
  sky.addColorStop(0, '#7eafd4')
  sky.addColorStop(0.55, '#d5ebf6')
  sky.addColorStop(1, '#c5d6a4')
  ctx.fillStyle = sky
  ctx.fillRect(frame.x, frame.y, frame.w, frame.h)
  ctx.fillStyle = 'rgba(255, 244, 210, 0.9)'
  ctx.beginPath()
  ctx.arc(frame.x + 36, frame.y + 28, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.beginPath()
  ctx.arc(frame.x + 32, frame.y + 24, 5, 0, Math.PI * 2)
  ctx.fill()
}

function drawStatueYard(ctx, state) {
  const { w } = state
  drawDollhouse(ctx, state, {
    outdoor: true,
    floorDark: '#6f9a48',
    floorLight: '#b7d98a',
    wallLight: '#d7f0ff',
    wall: '#c5e6f6',
    wallShade: '#9ec4e4',
    trim: '#e7f3d4',
    plank: 'rgba(60, 90, 40, 0.16)',
  })
  const box = houseBox(state)
  const spec = SCENES.statue
  cabinet(ctx, w * spec.cx - 30, hFloor(state, 0.62), 60, 18, 22, {
    light: '#e7e2da',
    face: '#cfc8be',
    top: '#f4f1ea',
    side: '#b7b0a6',
    edge: 'rgba(70, 64, 58, 0.4)',
  })
  cabinet(ctx, box.left + 28, box.backY + 18, 70, 16, 28, {
    light: '#7ea85a',
    face: '#5c8a40',
    top: '#9ec46e',
    side: '#3f6e32',
    edge: 'rgba(30, 50, 20, 0.35)',
  })
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
  const { w } = state
  drawDollhouse(ctx, state, {
    floorDark: '#a67c52',
    floorLight: '#e0bc8a',
    wallLight: '#fbf3e6',
    wall: '#f4e4cc',
    wallShade: '#e2cbae',
    trim: '#f6efe6',
    plank: 'rgba(90, 58, 32, 0.22)',
  })
  const seatY = state.guy.y + 28
  cabinet(ctx, w * 0.12, seatY, w * 0.62, 20, 36, {
    light: '#9eb6e6',
    face: '#6d90d4',
    top: '#c5d4f2',
    side: '#4f73a4',
    edge: 'rgba(40, 55, 90, 0.35)',
  })
  cabinet(ctx, w * 0.14, seatY - 8, 28, 12, 48, {
    light: '#8eaae0',
    face: '#5c82c4',
    top: '#b7c9ec',
    side: '#4568a0',
    edge: 'rgba(40, 55, 90, 0.35)',
  })
  cabinet(ctx, w * 0.66, seatY - 8, 28, 12, 48, {
    light: '#8eaae0',
    face: '#5c82c4',
    top: '#b7c9ec',
    side: '#4568a0',
    edge: 'rgba(40, 55, 90, 0.35)',
  })
  rug(ctx, w * 0.18, seatY + 8, w * 0.5, 18, '#8d3532')
}

function drawPlantRoom(ctx, state) {
  const { w } = state
  drawDollhouse(ctx, state, {
    floorDark: '#c4b198',
    floorLight: '#e6d7c4',
    wallLight: '#f7f8f0',
    wall: '#eef2e4',
    wallShade: '#d5dcc8',
    trim: '#f4f1ea',
    plank: 'rgba(90, 80, 50, 0.16)',
  })
  const box = houseBox(state)
  cabinet(ctx, w * 0.08, box.backY + 20, w * 0.78, 16, 18, {
    light: '#f6f1e8',
    face: '#e4d8c8',
    top: '#fffaf3',
    side: '#cfc0ac',
    edge: 'rgba(80, 60, 40, 0.3)',
  })
  cabinet(ctx, state.guy.x - 22, state.guy.y + 18, 44, 12, 24, {
    light: '#f0c48a',
    face: '#d39a4a',
    top: '#f6d7a8',
    side: '#b07830',
    edge: 'rgba(80, 50, 20, 0.4)',
  })
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
  drawDollhouse(ctx, state, {
    outdoor: true,
    floorDark: '#6f9a48',
    floorLight: '#c6efb8',
    wallLight: '#d7f4ff',
    wall: '#c5e8f6',
    wallShade: '#9ec4e4',
    trim: '#e7f6d8',
    plank: 'rgba(60, 90, 40, 0.14)',
  })
  const box = houseBox(state)
  cabinet(ctx, w * 0.5 - 40, box.backY + 36, 80, 18, 22, {
    light: '#d7e4ee',
    face: '#b7c9d6',
    top: '#eef5f8',
    side: '#8ea4b4',
    edge: 'rgba(50, 70, 80, 0.35)',
  })
  ctx.fillStyle = '#9fd4ef'
  ellipse(ctx, w * 0.5, box.backY + 16, 28, 8)
  ctx.fill()
  for (let i = 0; i < 5; i += 1) {
    const x = w * (0.18 + i * 0.16) + Math.sin(state.time + i) * 6
    const y = h * 0.28 + Math.cos(state.time * 1.3 + i) * 10
    ctx.beginPath()
    ctx.arc(x, y, 8 + (i % 3) * 3, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.strokeStyle = 'rgba(120, 180, 210, 0.45)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

function drawPicnic(ctx, state) {
  const { w } = state
  drawDollhouse(ctx, state, {
    outdoor: true,
    floorDark: '#6f9a48',
    floorLight: '#b7d98a',
    wallLight: '#d7f0ff',
    wall: '#c9ecff',
    wallShade: '#9ec4e4',
    trim: '#e7f3d4',
    plank: 'rgba(60, 90, 40, 0.14)',
  })
  const box = houseBox(state)
  const x = state.guy.x - 90
  const y = state.guy.y - 16
  rug(ctx, x, y, 180, 70, state.look % 2 === 0 ? '#e36b62' : '#e2c15a')
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 2
  for (let col = 0; col < 5; col += 1) {
    ctx.beginPath()
    ctx.moveTo(x + 22 + col * 32, y + 8)
    ctx.lineTo(x + 22 + col * 32, y + 62)
    ctx.stroke()
  }
  cabinet(ctx, w * 0.08, box.backY + 24, 48, 16, 28, {
    light: '#f0d7a2',
    face: '#c9955c',
    top: '#f6e6c4',
    side: '#a07838',
    edge: 'rgba(80, 50, 20, 0.4)',
  })
}

function drawPorch(ctx, state) {
  const { w } = state
  drawDollhouse(ctx, state, {
    outdoor: true,
    floorDark: '#a67c52',
    floorLight: '#e0bc8a',
    wallLight: '#d7f0ff',
    wall: '#f6e2c4',
    wallShade: '#e7c49a',
    trim: '#f3e0c4',
    plank: 'rgba(90, 58, 32, 0.28)',
  })
  const y = state.guy.y
  ctx.strokeStyle = '#6a4630'
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(w * 0.16, y - 78)
  ctx.lineTo(w * 0.16, y + 46)
  ctx.moveTo(w * 0.84, y - 78)
  ctx.lineTo(w * 0.84, y + 46)
  ctx.stroke()
  ctx.strokeStyle = '#4f73a4'
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.moveTo(w * 0.16, y - 18)
  ctx.quadraticCurveTo(w * 0.5, y + 52, w * 0.84, y - 18)
  ctx.stroke()
  ctx.strokeStyle = '#8eb4f2'
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.moveTo(w * 0.2, y - 12)
  ctx.quadraticCurveTo(w * 0.5, y + 36, w * 0.8, y - 12)
  ctx.stroke()
}

function hFloor(state, portion) {
  const box = houseBox(state)
  return box.backY + (box.frontY - box.backY) * portion
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
