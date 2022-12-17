const fs = require('fs')

let rawInputData, inputData
let doCustomLog = false  // for debugging

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const customLog = message => {
  if (doCustomLog) console.log(message)
}

const parseInput = () => {
  inputData = rawInputData.split('\n\n')
}

const solveP1 = rawInput => { }

const solveP2 = rawInput => { }

console.log("AOC2022 | Day XX");
console.time("AOC2022 | Day XX")

if (rawInputData) {
  parseInput()

  console.log(`P1 : ${solveP1(inputData)}`)
  console.log(`P2 : ${solveP2(inputData)}`)
}

console.timeEnd("AOC2022 | Day XX")