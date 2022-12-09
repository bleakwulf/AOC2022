const fs = require('fs')

console.log("AOC2022 | Day 04")
console.time("AOC2022 D04")

let rawInputData

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const solveP1 = inputData => { 
  return inputData
    .filter(sectionPair => {
      let [ [elf1Min, elf1Max], [elf2Min, elf2Max] ] = sectionPair
      return (elf1Min <= elf2Min && elf1Max >= elf2Max) 
        || (elf2Min <= elf1Min && elf2Max >= elf1Max) 
    }).length
}

const solveP2 = ( inputData) => { 
  return inputData
    .filter(sectionPair => {
      let [ [elf1Min, elf1Max], [elf2Min, elf2Max] ] = sectionPair
      return (elf1Min <= elf2Min && elf1Max >= elf2Max) || (elf2Min <= elf1Min && elf2Max >= elf1Max)
        || ( elf1Min <= elf2Min && elf1Max >= elf2Min && elf1Max <= elf2Max)  
        || ( elf2Min <= elf1Min && elf2Max >= elf1Min && elf2Max <= elf1Max)
    }).length 
}

if (rawInputData) {
  let inputData = rawInputData
    .split('\n')
    .map(sectionPair => sectionPair
      .replace(/w/, '')
      .split(',')
      .map(range => range
        .split('-')
        .map( limit => +limit)
      )
    )
  
  console.log(`P1 :`)
  console.log(solveP1(inputData))

  console.log(`P2 :`)
  console.log(solveP2(inputData))
}

console.timeEnd("AOC2022 D04")