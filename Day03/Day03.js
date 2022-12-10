const fs = require('fs')

const ELF_GROUP_SIZE_DEFAULT = 3
let prioMatrix = new Map()

let rawInputData, inputData

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const buildPrioMatrix = () => {
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    .split('')
    .forEach((item, index) => prioMatrix.set(item, index + 1))
}

const solveP1 = () => inputData
  .map( packagePair => {
    let midPoint = packagePair.length / 2
    
    let [ firstHalf, secondHalf ] = [
      packagePair.slice( 0, midPoint  ).split(''),
      packagePair.slice( midPoint     ).split('') 
    ]
    
    for( let i = 0; i < firstHalf.length; i++ ) {
      if (secondHalf.includes( firstHalf.at(i) ) ) 
        return prioMatrix.get( firstHalf.at(i) )
    }
    
    return 0
  }).reduce( ( total, itemPriority ) => total + itemPriority, 0 )

const solveP2 = ( elfGroupSize = ELF_GROUP_SIZE_DEFAULT) => Array.from(
    Array( ( inputData.length / elfGroupSize ) ).keys()
  ).map( idx => {
    let [ elf1Pack, ...otherElfPacks ] = inputData.slice(
      idx * elfGroupSize,
      idx * elfGroupSize + elfGroupSize
    )

    for( let i = 0; i < elf1Pack.length; i++ ) {
      if ( otherElfPacks
        .map( elfPack => elfPack.indexOf( elf1Pack.at(i) ) >= 0 )
        .reduce( ( hasItem, itemFound ) => hasItem && itemFound, true)
      ) {
        return prioMatrix.get( elf1Pack.at(i) )
      }
    }
     
    return 0 
  }).reduce( ( total, itemPriority ) => total + itemPriority, 0 )

console.log("AOC2022 | Day 03")
console.time("AOC2022 | Day 03")

if (rawInputData) {

  inputData = rawInputData.split('\n')

  buildPrioMatrix()
  
  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
  console.log()
}

console.timeEnd("AOC2022 | Day 03")