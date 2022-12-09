const fs = require('fs')

console.log("AOC2022 | Day 01")
console.time("AOC2022 D01")

let rawInputData = ""

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const solveP1 = rawInput => {
  let [ max ] = rawInput
  return max
}

const solveP2 = rawInput => {
  let [first = 0, second = 0, third = 0] = rawInput
  return first + second + third
}

if (rawInputData) {

  let inputData = rawInputData
    .split('\n\n')
    .map(elfData => elfData.split('\n').map(calorieData => +calorieData))
    .map(elfData => elfData.reduce((last, current) => last + current, 0))
    .sort((a, b) => b - a)  // sort into descending order of values
    
  console.log(`P1 :`)
  console.log(solveP1(inputData))

  console.log(`P2 :`)
  console.log(solveP2(inputData))
}

console.timeEnd("AOC2022 D01")