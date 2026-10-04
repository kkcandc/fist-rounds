import { draw } from './draw.js'
import {
  createState,
  currentTargets,
  guyVisual,
  hintFor,
  metrics,
  pointerDown,
  pointerMove,
  pointerUp,
  reflectionPoint,
  resize,
  roundPips,
  startGame,
  tick,
} from './logic.js'

const canvas = document.querySelector('#game')
const ctx = canvas.getContext('2d')
const hint = document.querySelector('#hint')
const rounds = document.querySelectorAll('#rounds li')
const card = document.querySelector('#card')
const cardTitle = document.querySelector('#card-title')
const cardCopy = document.querySelector('#card-copy')
const cardAction = document.querySelector('#card-action')
const live = document.querySelector('#live')

const state = createState(window.innerWidth, window.innerHeight)

if (import.meta.env.DEV) {
  window.__fistRounds = { state, currentTargets, guyVisual, metrics, reflectionPoint }
}
let shown = ''
let audio

const COPY = {
  title: {
    title: 'Fist Rounds',
    copy: 'Line the fist up with the opening, then fling it through. A hit makes him yell.',
    action: 'Play',
  },
}

function fit() {
  const width = window.innerWidth
  const height = window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  resize(state, width, height)
}

function pointFromEvent(event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

function unlockAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return
  if (!audio) audio = new AudioCtx()
  if (audio.state === 'suspended') audio.resume()
}

function blip(freq, dur, type, gainValue, when = 0) {
  if (!audio) return
  const start = audio.currentTime + when
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(gainValue, start)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

function playSound(kind) {
  try {
    if (kind === 'windup') {
      blip(180, 0.08, 'triangle', 0.03)
    } else if (kind === 'swing') {
      blip(240, 0.09, 'sawtooth', 0.02)
      blip(420, 0.06, 'sine', 0.03, 0.04)
    } else if (kind === 'ah') {
      blip(380, 0.07, 'triangle', 0.06)
      blip(260, 0.16, 'sawtooth', 0.035, 0.05)
      blip(190, 0.14, 'sine', 0.04, 0.1)
    } else if (kind === 'bonk') {
      blip(170, 0.12, 'triangle', 0.06)
      blip(90, 0.16, 'sine', 0.04, 0.03)
    } else if (kind === 'giggle') {
      blip(880, 0.08, 'sine', 0.035)
      blip(1040, 0.08, 'sine', 0.03, 0.09)
      blip(920, 0.1, 'sine', 0.028, 0.17)
    } else if (kind === 'win') {
      ;[523, 659, 784, 1046].forEach((freq, index) => {
        blip(freq, 0.18, 'sine', 0.045, index * 0.09)
      })
    }
  } catch {
    // Sound is optional if the browser blocks audio.
  }
}

function flushEvents() {
  if (state.events.length === 0) return
  const names = state.events.splice(0, state.events.length)
  const latest = names[names.length - 1]
  if (latest === 'giggle') live.textContent = 'Hee hee!'
  else if (latest === 'bonk') live.textContent = 'Bonk!'
  else if (latest === 'ah') live.textContent = 'Ah!'
  else live.textContent = hintFor(state.scene)
  for (const name of names) {
    if (name === 'ah' || name === 'bonk' || name === 'giggle' || name === 'swing' || name === 'windup') {
      playSound(name)
    }
  }
}

function syncHud() {
  hint.textContent = hintFor(state.scene)
  document.body.dataset.scene = state.scene
  const pips = roundPips(state)
  rounds.forEach((item, index) => {
    const pip = pips[index]
    if (!pip) return
    item.textContent = pip.label
    item.dataset.scene = pip.id
    item.classList.toggle('on', pip.mark === 'on')
    item.classList.toggle('done', pip.mark === 'done')
  })
  if (shown !== state.scene) {
    shown = state.scene
    const panel = COPY[state.scene]
    if (panel) {
      card.hidden = false
      cardTitle.textContent = panel.title
      cardCopy.textContent = panel.copy
      cardAction.textContent = panel.action
    } else {
      card.hidden = true
    }
  }
  flushEvents()
}

cardAction.addEventListener('click', () => {
  unlockAudio()
  startGame(state)
  syncHud()
})

canvas.addEventListener('pointerdown', (event) => {
  if (!card.hidden) return
  unlockAudio()
  canvas.setPointerCapture(event.pointerId)
  const point = pointFromEvent(event)
  pointerDown(state, point.x, point.y, event.pointerId, performance.now())
  event.preventDefault()
})

canvas.addEventListener('pointermove', (event) => {
  const point = pointFromEvent(event)
  pointerMove(state, point.x, point.y, event.pointerId, performance.now())
})

function endPointer(event) {
  const point = pointFromEvent(event)
  pointerUp(state, point.x, point.y, event.pointerId)
  flushEvents()
}

canvas.addEventListener('pointerup', endPointer)
canvas.addEventListener('pointercancel', endPointer)
canvas.addEventListener('contextmenu', (event) => event.preventDefault())

window.addEventListener('resize', fit)
window.visualViewport?.addEventListener('resize', fit)

fit()
syncHud()
live.textContent = hintFor(state.scene)

let last = performance.now()
function frame(now) {
  const dt = (now - last) / 1000
  last = now
  tick(state, dt)
  syncHud()
  draw(ctx, state)
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
