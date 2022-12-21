const fs = require('fs')

const DEFAULT_CHECK_INTERVALS = [1e3, 2e3, 3e3]
const DECRYPTION_KEY          = 811589153
const DEFAULT_MIX_ROUNDS_MIN  = 1
const DEFAULT_MIX_ROUNDS_MAX  = 10

let rawInputData, inputData

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const parseInput = () => {
  inputData = rawInputData.split(`\n`).map(Number)
}

const initEncryption = (isUseDecryptionKey = false) => inputData
  .map( (element, index ) => ({ value: isUseDecryptionKey ? element * DECRYPTION_KEY : element, index }) )

const decrypt = (
  isUseDecryptionKey = false, 
  maxMixRounds = DEFAULT_MIX_ROUNDS_MIN, 
  checkIntervals = DEFAULT_CHECK_INTERVALS 
) => {
  let decryption = initEncryption(isUseDecryptionKey)

  let mixRound = 1
  let endMixing= false
  
  while (!endMixing) {
    let index = 0
    let endDecryption = false
  
    while (!endDecryption) {
      let newPosition = position = decryption.findIndex( element => element.index === index )
      let element = decryption.at(position)
  
      if (element.value === 0) {
        endDecryption = ++index >= decryption.length
        continue
      }
  
      newPosition += element.value
  
      if ( Math.abs(newPosition) > decryption.length )
        newPosition = newPosition % ( decryption.length - 1 )
      
      element = decryption.splice( position, 1 ).at(0)
  
      if (newPosition === 0) decryption.push( element )
      else decryption.splice( newPosition, 0, element )
  
      endDecryption = ++index >= decryption.length
    }
    
    endMixing = ++mixRound > maxMixRounds
  }

  //  find interval values
  let coordStart = decryption.findIndex( element => element.value === 0 )
  
  return checkIntervals
    .map(interval => {
      let intervalIndex = ( coordStart + interval ) % decryption.length
      return decryption.at(intervalIndex).value
    }).reduce( (mix, coord) => mix + coord, 0 )  

}

const solveP1 = () => decrypt()

const solveP2 = () => decrypt( true, DEFAULT_MIX_ROUNDS_MAX )

console.log("AOC2022 | Day 20");
console.time("AOC2022 | Day 20")

if (rawInputData) {
  parseInput()

  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 | Day 20")