const fs = require('fs')

const DEFAULT_MIN_TOP_RANK = 3
let rawInputData, inputData

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const parseInput = () => {
  inputData = rawInputData
    .split('\n\n')
    .map(elfData => elfData
      .split('\n')
      .map(calorieData => +calorieData)
    ).map(elfData => elfData
      .reduce((last, current) => last + current, 0)
    ).sort((a, b) => b - a)  // sort into descending order of values
}

const solveP1 = () => inputData.at(0)

const solveP2 = ( minRank = DEFAULT_MIN_TOP_RANK ) => inputData
  .slice( 0, minRank)
  .reduce( (sum, addend) => sum + addend, 0 )

console.log("AOC2022 | Day 01")
console.time("AOC2022 | Day 01")

if (rawInputData) {
  parseInput()

  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 | Day 01")