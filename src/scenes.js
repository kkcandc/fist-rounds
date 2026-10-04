export const OPENING = ['dance', 'mirror', 'bed']

export const LATER_SETS = [
  ['laundry', 'bike', 'window'],
  ['statue', 'couch', 'plant'],
  ['bubbles', 'picnic', 'hammock'],
]

export const LUMP_SCENES = new Set(['bed', 'laundry', 'picnic', 'hammock'])

export const SCENES = {
  dance: {
    label: 'Dance',
    hint: 'He dances behind the opening. Line the fist up, then fling it through.',
    pose: 'dance',
    cx: 0.5,
    cy: 0.48,
    hw: 62,
    hh: 26,
    fistX: 0.5,
  },
  mirror: {
    label: 'Mirror',
    hint: 'Aim through the opening at the real guy. The reflection only bonks.',
    pose: 'stand',
  },
  bed: {
    label: 'Bed',
    hint: 'The lump is behind the pillows. Fling the fist through the gap.',
    pose: 'lump',
    lump: true,
  },
  laundry: {
    label: 'Laundry',
    hint: 'He is hiding in the laundry pile. Fling the fist at the pile.',
    pose: 'lump',
    lump: true,
    cx: 0.5,
    cy: 0.56,
    hw: 100,
    hh: 34,
    fistX: 0.5,
  },
  bike: {
    label: 'Bike',
    hint: 'He rides a tiny bike in place. Fling the fist at him.',
    pose: 'bike',
    cx: 0.5,
    cy: 0.52,
    hw: 46,
    hh: 24,
    fistX: 0.5,
  },
  window: {
    label: 'Window',
    hint: 'He is stuck in one pane. Fling the fist through that opening.',
    pose: 'window',
    cx: 0.38,
    cy: 0.46,
    hw: 36,
    hh: 22,
    fistX: 0.38,
  },
  statue: {
    label: 'Statue',
    hint: 'He is posing as a statue. The birdbath only bonks.',
    pose: 'statue',
    cx: 0.34,
    cy: 0.5,
    hw: 48,
    hh: 30,
    fistX: 0.34,
    decoy: { x: 0.76, y: 0.52 },
  },
  couch: {
    label: 'Couch',
    hint: 'He is bouncing on the couch. Fling the fist at him.',
    pose: 'couch',
    cx: 0.5,
    cy: 0.52,
    hw: 86,
    hh: 30,
    fistX: 0.5,
  },
  plant: {
    label: 'Plant',
    hint: 'He is pretending to be a houseplant. The other plant bonks.',
    pose: 'plant',
    cx: 0.3,
    cy: 0.52,
    hw: 42,
    hh: 26,
    fistX: 0.3,
    decoy: { x: 0.74, y: 0.54 },
  },
  bubbles: {
    label: 'Bubbles',
    hint: 'He is bobbing in a bubble. Fling the fist at him.',
    pose: 'bubble',
    cx: 0.5,
    cy: 0.48,
    hw: 72,
    hh: 36,
    fistX: 0.5,
  },
  picnic: {
    label: 'Picnic',
    hint: 'He is a lump under the picnic blanket. Fling the fist at it.',
    pose: 'lump',
    lump: true,
    cx: 0.52,
    cy: 0.58,
    hw: 96,
    hh: 32,
    fistX: 0.5,
  },
  hammock: {
    label: 'Hammock',
    hint: 'He is a lump in the hammock. Fling the fist at the lump.',
    pose: 'lump',
    lump: true,
    cx: 0.5,
    cy: 0.5,
    hw: 78,
    hh: 26,
    fistX: 0.5,
  },
}

export function freshSets() {
  return [OPENING.slice(), ...LATER_SETS.map((set) => set.slice())]
}

export function reshuffleSets(previous) {
  const pool = shuffle(LATER_SETS.flat())
  const sets = []
  for (let index = 0; index < pool.length; index += 3) {
    sets.push(pool.slice(index, index + 3))
  }
  if (sets.length > 1 && previous && sameSet(sets[0], previous)) {
    sets.push(sets.shift())
  }
  return sets.filter((set) => !sameSet(set, OPENING))
}

export function sameSet(a, b) {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

export function hintFor(scene) {
  if (scene === 'title') return 'Pull the big fist back, then fling it.'
  return SCENES[scene]?.hint || ''
}

function shuffle(list) {
  const copy = list.slice()
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
  }
  return copy
}
