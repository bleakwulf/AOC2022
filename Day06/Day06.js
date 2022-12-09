const fs = require('fs')

const MARKER_TYPES = {
  START_OF_PACKET: { length: 4 },
  START_OF_MESSAGE: { length: 14 }
}

let rawInputData

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const getMaxIndexForMarker = (markerType = MARKER_TYPES.START_OF_PACKET) => {
  for (let i = 0; i < rawInputData.length; i++) {
    let maxIndex = i + markerType.length
    if (new Set(rawInputData.slice(i, maxIndex)).size === markerType.length)
      return maxIndex
  }

  return 0
}

const solveP1 = () => {
  return getMaxIndexForMarker()
}

const solveP2 = () => {
  return getMaxIndexForMarker(MARKER_TYPES.START_OF_MESSAGE)
}

console.log("AOC2022 | Day 06")
console.time("AOC2022 D06")

if (rawInputData) {
  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 D06")