const fs = require('fs')

let rawInputData, inputData

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const parseInput = () => {
  inputData = rawInputData
    .split('\n')
    .map( sectionPair => sectionPair
      .replace(/\-/g, ',')
      .split(',')
      .map(Number)
    )
}

const solveP1 = () => inputData
  .filter( sectionPair => {
    let [ elf1Min, elf1Max, elf2Min, elf2Max ] = sectionPair
    return ( elf1Min <= elf2Min && elf1Max >= elf2Max ) 
      ||   ( elf2Min <= elf1Min && elf2Max >= elf1Max ) 
  }).length

const solveP2 = () => inputData
  .filter( sectionPair => {
    let [ elf1Min, elf1Max, elf2Min, elf2Max ] = sectionPair
      return ( elf1Min <= elf2Min && ( elf1Max >= elf2Max || elf1Max >= elf2Min ) ) 
        ||   ( elf2Min <= elf1Min && ( elf2Max >= elf1Max || elf2Max >= elf1Min ) )
  }).length 

console.log("AOC2022 | Day 04")
console.time("AOC2022 | Day 04")

if (rawInputData) {
  parseInput()
  
  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 | Day 04")