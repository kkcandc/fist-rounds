import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { OPENING } from '../src/scenes.js'
import {
  createState,
  currentTargets,
  enter,
  metrics,
  mirrorGeom,
  pointerDown,
  pointerMove,
  pointerUp,
  reflectionPoint,
  startGame,
  tick,
} from '../src/logic.js'

function ticks(state, frames) {
  for (let i = 0; i < frames; i += 1) tick(state, 0.05)
}

function drag(state, x, y) {
  const id = 1
  const grabbed = pointerDown(state, state.fist.x, state.fist.y, id, 0)
  assert.equal(grabbed, true)
  const x0 = state.fist.x
  const y0 = state.fist.y
  const steps = 8
  for (let i = 1; i <= steps; i += 1) {
    pointerMove(
      state,
      x0 + ((x - x0) * i) / steps,
      y0 + ((y - y0) * i) / steps,
      id,
      i * 16,
    )
  }
  pointerUp(state, x, y, id)
}

function fling(state, x, y) {
  drag(state, x, y)
  ticks(state, 28)
}

describe('Fist Rounds rules', () => {
  it('has no score', () => {
    const state = createState(390, 844)
    startGame(state)
    assert.equal(state.score, undefined)
    assert.equal(state.points, undefined)
    fling(state, state.w * 0.5, state.h * 0.48)
    assert.equal(state.score, undefined)
    assert.equal(state.points, undefined)
  })

  it('does not punch from a tap on the fist', () => {
    const state = createState(390, 844)
    startGame(state)
    pointerDown(state, state.fist.x, state.fist.y, 1, 0)
    pointerUp(state, state.fist.x + 4, state.fist.y + 2, 1)
    assert.equal(state.fist.phase, 'ready')
    assert.equal(state.scene, 'dance')
    assert.equal(state.guy.hop, null)
    assert.equal(state.pending, null)
  })

  it('cocks back, then hits hard enough to shove him', () => {
    const state = createState(390, 844)
    startGame(state)
    const dancer = currentTargets(state)[0]
    drag(state, dancer.x, dancer.y)
    const commitX = state.fist.commitX
    const commitY = state.fist.commitY
    let cocked = 0
    for (let i = 0; i < 14 && state.fist.phase === 'windup'; i += 1) {
      tick(state, 0.05)
      cocked = Math.max(cocked, Math.hypot(state.fist.x - commitX, state.fist.y - commitY))
    }
    assert.ok(cocked > 50, `cocked ${cocked}`)
    let reacted = false
    for (let i = 0; i < 24 && state.scene === 'dance'; i += 1) {
      tick(state, 0.05)
      if (state.fist.phase === 'impact' && state.guy.react > 0.45 && state.shake > 0.45) reacted = true
    }
    assert.equal(reacted, true)
    assert.equal(state.score, undefined)
  })

  it('winds up before a fling becomes a hit', () => {
    const state = createState(390, 844)
    startGame(state)
    const dancer = currentTargets(state)[0]
    drag(state, dancer.x, dancer.y)
    assert.equal(state.fist.phase, 'windup')
    assert.equal(state.scene, 'dance')
    assert.equal(state.pending, null)
    ticks(state, 3)
    assert.ok(state.fist.phase === 'windup' || state.fist.phase === 'strike' || state.fist.phase === 'impact')
    ticks(state, 25)
    assert.equal(state.scene, 'mirror')
    assert.equal(state.score, undefined)
  })

  it('keeps the dancer in place until a miss', () => {
    const state = createState(390, 844)
    startGame(state)
    const x = state.guy.x
    const y = state.guy.y
    ticks(state, 40)
    assert.equal(state.guy.x, x)
    assert.equal(state.guy.y, y)
    assert.equal(state.guy.hop, null)
    assert.equal(state.scene, 'dance')
  })

  it('giggles and hops on a miss without leaving the dance spotlight', () => {
    const state = createState(390, 844)
    startGame(state)
    const before = { x: state.guy.x, y: state.guy.y }
    drag(state, 24, state.fist.y)
    assert.equal(state.scene, 'dance')
    ticks(state, 12)
    assert.equal(state.scene, 'dance')
    assert.ok(state.guy.hop)
    assert.ok(state.popups.some((popup) => popup.text === 'hee hee!'))
    ticks(state, 16)
    const moved = Math.hypot(state.guy.x - before.x, state.guy.y - before.y)
    assert.ok(moved > 8)
    assert.ok(Math.abs(state.guy.x - state.w * 0.5) <= 62)
    assert.ok(Math.abs(state.guy.y - state.h * 0.48) <= 26)
  })

  it('plays the opening trio and then two different sets', () => {
    const state = createState(390, 844)
    startGame(state)
    const seen = []
    for (let round = 0; round < 9; round += 1) {
      seen.push(state.scene)
      const target = currentTargets(state).find((item) => item.id === 'guy' || item.id === 'lump')
      fling(state, target.x, target.y)
    }
    assert.deepEqual(seen.slice(0, 3), ['dance', 'mirror', 'bed'])
    const second = seen.slice(3, 6)
    const third = seen.slice(6, 9)
    assert.deepEqual(second, ['laundry', 'bike', 'window'])
    assert.deepEqual(third, ['statue', 'couch', 'plant'])
    assert.notDeepEqual(second, OPENING)
    assert.notDeepEqual(third, OPENING)
    assert.notDeepEqual(second, third)
    assert.equal(state.scene, 'bubbles')
    assert.equal(state.score, undefined)
  })

  it('bonks the mirror and keeps going into new scenes instead of repeating the opening', () => {
    const state = createState(390, 844)
    startGame(state)
    fling(state, currentTargets(state)[0].x, currentTargets(state)[0].y)
    assert.equal(state.scene, 'mirror')

    const reflection = reflectionPoint(state)
    const guyX = state.guy.x
    drag(state, reflection.x, reflection.y)
    ticks(state, 16)
    assert.equal(state.scene, 'mirror')
    assert.equal(state.pending, null)
    assert.equal(state.guy.hop, null)
    assert.equal(state.guy.x, guyX)
    assert.ok(state.popups.some((popup) => popup.text === 'bonk!'))
    ticks(state, 10)

    const real = currentTargets(state).find((target) => target.id === 'guy')
    fling(state, real.x, real.y)
    assert.equal(state.scene, 'bed')
    fling(state, currentTargets(state)[0].x, currentTargets(state)[0].y)
    assert.equal(state.scene, 'laundry')
    assert.notEqual(state.scene, 'dance')
  })

  it('reshuffles later scenes without returning to only dance, mirror, and bed', () => {
    const state = createState(390, 844)
    startGame(state)
    const seen = []
    for (let round = 0; round < 12; round += 1) {
      seen.push(state.scene)
      const target = currentTargets(state).find((item) => item.id === 'guy' || item.id === 'lump')
      fling(state, target.x, target.y)
    }
    const extra = []
    for (let round = 0; round < 3; round += 1) {
      extra.push(state.scene)
      const target = currentTargets(state).find((item) => item.id === 'guy' || item.id === 'lump')
      fling(state, target.x, target.y)
    }
    assert.notDeepEqual(extra, OPENING)
    assert.equal(extra.includes('dance') || extra.includes('mirror') || extra.includes('bed'), false)
    assert.equal(new Set(seen.slice(3)).size >= 6, true)
  })

  it('keeps the reflection inside the mirror on a narrow phone', () => {
    for (const size of [
      [320, 700],
      [390, 844],
      [430, 932],
    ]) {
      const state = createState(size[0], size[1])
      enter(state, 'mirror', { setIndex: 0, scenePos: 1 })
      assert.ok(state.arena.minX < state.arena.maxX)
      assert.ok(state.arena.minY < state.arena.maxY)
      assert.ok(state.guy.x >= state.arena.minX - 0.5)
      assert.ok(state.guy.x <= state.arena.maxX + 0.5)
      const point = reflectionPoint(state)
      const { glass } = mirrorGeom(state)
      const rad = metrics(state).bubR
      assert.ok(point.x - rad >= glass.x - 1, `reflection left ${point.x - rad} glass ${glass.x}`)
      assert.ok(point.x + rad <= glass.x + glass.w + 1)
      assert.ok(point.y - rad >= glass.y - 1)
      assert.ok(point.y + rad <= glass.y + glass.h + 1)
    }
  })

  it('gives every later scene a place to stand on a phone', () => {
    const state = createState(390, 844)
    startGame(state)
    for (let round = 0; round < 12; round += 1) {
      assert.ok(state.arena.maxX > state.arena.minX, state.scene)
      assert.ok(state.arena.maxY > state.arena.minY, state.scene)
      const target = currentTargets(state).find((item) => item.id === 'guy' || item.id === 'lump')
      assert.ok(target, state.scene)
      fling(state, target.x, target.y)
    }
  })
})
