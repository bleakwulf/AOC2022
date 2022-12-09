const fs = require('fs')

let rawInputData

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const solveP1 = rawInput => { }

const solveP2 = rawInput => { }

console.log("AOC2022 | Day XX");
console.time("AOC2022 | Day XX")

if (rawInputData) {
  let inputData = rawInputData.split('\n\n')

  console.log(`P1 : ${solveP1(inputData)}`)
  console.log(`P2 : ${solveP2(inputData)}`)
}

console.timeEnd("AOC2022 | Day XX")