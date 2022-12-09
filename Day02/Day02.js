const fs = require('fs')

console.log("AOC2022 | Day 02")
console.time("AOC2022 D02")

let SCORES = {
  WIN: 6,
  DRAW: 3,
  LOSE: 0
}

let throwValues = new Map([
  [`A`, 1],
  [`B`, 2],
  [`C`, 3],
  [`X`, 1],
  [`Y`, 2],
  [`Z`, 3]
])

let matchMatrix = new Map([
  [`AX`, SCORES.DRAW],    // both stone
  [`AY`, SCORES.WIN],     // stone vs. paper
  [`AZ`, SCORES.LOSE],    // stone vs. scissors
  [`BX`, SCORES.LOSE],    // papaer vs. stone 
  [`BY`, SCORES.DRAW],    // both paper
  [`BZ`, SCORES.WIN],     // paper vs. scissors
  [`CX`, SCORES.WIN],     // scissors vs. stone
  [`CY`, SCORES.LOSE],    // scissors vs. paper
  [`CZ`, SCORES.DRAW]     // both scissors
])

let rawInputData = ""

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const solveP1 = rawInput => {
  return rawInput
    .map(roundPair => {
      let myThrow = roundPair.at(-1)
      let roundScore = matchMatrix.get(roundPair.join(''))
      return throwValues.get(myThrow) + roundScore
    }).reduce((result, current) => result + current, 0)
}

const pivotMatchMatrix = () => {
  return Array.from(matchMatrix)
    .reduce((result, matchData) => {
      let [keyData, valueData] = matchData
      let [enemyThrow, myThrow] = keyData.split('')
      let newData = result?.get(enemyThrow) ?? {}
      return result.set(enemyThrow, { ...newData, [valueData]: myThrow })
    }, new Map())
}

const solveP2 = rawInput => {
  let refMatrix = pivotMatchMatrix()
  return rawInput
    .map(roundPair => {
      let [enemyThrow, strategy] = roundPair
      let strategyValue = strategy === `X` ? SCORES.LOSE
        : strategy === `Y` ? SCORES.DRAW
          : SCORES.WIN
      let myThrow = refMatrix.get(enemyThrow)[strategyValue]
      let roundScore = matchMatrix.get(`${enemyThrow}${myThrow}`)
      return throwValues.get(myThrow) + strategyValue
    }).reduce((result, current) => result + current, 0)
}

if (rawInputData) {

  let inputData = rawInputData
    .split('\n')
    .map(throwPair => throwPair.split(' '))

  console.log(`P1 :`)
  console.log(solveP1(inputData))

  console.log(`P2 :`)
  console.log(solveP2(inputData))
}

console.timeEnd("AOC2022 D02")