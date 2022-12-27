const fs = require('fs')

const OVERLAP_TYPE  = {
  ALL   : 0, 
  FULL  : 1
}

let rawInputData, inputData

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const parseInput = () => {
  inputData = Array.from( 
    rawInputData.matchAll( /^(?<startS1>(\d{1,}))\-(?<endS1>(\d{1,}))\,(?<startS2>(\d{1,}))\-(?<endS2>(\d{1,}))$/gm ), 
    ( match ) => {
      let { startS1, endS1, startS2, endS2 } = match.groups
      return Array.of( startS1, endS1, startS2, endS2 ).map(Number)
    }
  )
}

const countOverlaps = ( overlapType = OVERLAP_TYPE.ALL ) => inputData
  .filter( sectionPair => {
    let [ elf1Min, elf1Max, elf2Min, elf2Max ] = sectionPair
    
    return overlapType === OVERLAP_TYPE.FULL
      ?     ( elf1Min <= elf2Min && elf1Max >= elf2Max ) 
        ||  ( elf2Min <= elf1Min && elf2Max >= elf1Max ) 
      :     ( elf1Min <= elf2Min && ( elf1Max >= elf2Max || elf1Max >= elf2Min ) ) 
        ||  ( elf2Min <= elf1Min && ( elf2Max >= elf1Max || elf2Max >= elf1Min ) )
  }).length

const solveP1 = () => countOverlaps(OVERLAP_TYPE.FULL)

const solveP2 = () => countOverlaps()

console.log("AOC2022 | Day 04")
console.time("AOC2022 | Day 04")

if (rawInputData) {
  parseInput()
  
  console.log(`P1 : ${ solveP1() }`)
  console.log(`P2 : ${ solveP2() }`)
}

console.timeEnd("AOC2022 | Day 04")