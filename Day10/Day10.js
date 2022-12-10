const fs = require('fs')

const INSTRUCTIONS = new Map([
  [ `noop`, { cycleLength : 1 } ],
  [ `addx`, { cycleLength : 2 } ]
])

const DEFAULT_CYCLE_INTERVALS = [ 20, 60, 100, 140, 180, 220 ]

const CRT_SCREEN = {
  height  : 6,
  width   : 40
}

const PIXEL_STATE = {
  LIT  : `#`, 
  DARK : `.`
}

const SPRITE_SIZE = 3  // sprite size in pixels

let rawInputData, inputData
let deviceStats = {}

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const parseInput = () => {
  inputData = rawInputData
    .split(`\n`)
    .map( instructionData => {
      let [ command, commandArg ] = instructionData.split(' ')
      return [
        INSTRUCTIONS.get( command ).cycleLength,
        +commandArg || 0
      ]
    }) 
}

const getSpriteOverlapRange = () => {
  // calculate pixel ranges on either side of sprite's midpoint
  const CURSOR_MAX_OVERLAP = Math.floor( SPRITE_SIZE / 2 )  
  return Array.from( Array( CURSOR_MAX_OVERLAP + 1 ).keys() )
}

const runCommands = () => {
  let register = 1
  let allCycleCount = 0
  let signalStrength = []
  
  let displayData = Array.from(
    { length: CRT_SCREEN.height }, 
    () => Array.from({ length: CRT_SCREEN.width }).fill( PIXEL_STATE.DARK )
  )
  
  let cursorSpriteOverlap = getSpriteOverlapRange()
  
  inputData.forEach( ( [ cycleLength, registerIncrement ], commandIndex ) => {
    let instructionCycle = 0
    while (instructionCycle < cycleLength) {
      let cursor = allCycleCount
      
      allCycleCount++
      instructionCycle++

      // check signal interval and strength
      if ( DEFAULT_CYCLE_INTERVALS.includes(allCycleCount) ) 
        signalStrength.push( register * allCycleCount )

      // draw screen display
      if ( cursor < CRT_SCREEN.height * CRT_SCREEN.width ) {
        let crtCoordX = cursor % CRT_SCREEN.width  
        let crtCoordY = Math.floor( cursor / CRT_SCREEN.width )
        
        displayData[crtCoordY][crtCoordX] = cursorSpriteOverlap
          .includes( Math.abs( register - crtCoordX ) )
          ? PIXEL_STATE.LIT : PIXEL_STATE.DARK
      }
    }

    register += registerIncrement
  })

  deviceStats = { signalStrength, displayData } 
}  

const solveP1 = () => deviceStats.signalStrength
  .reduce( (totalStrength, strength) => totalStrength + strength, 0 )

const solveP2 = () => deviceStats.displayData
  .map( displayLines => displayLines.join('') )
  .join( '\n' )

console.log("AOC2022 | Day 10");
console.time("AOC2022 | Day 10")

if (rawInputData) {
  parseInput()
  runCommands()

  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : \n${solveP2()}`)
  
}

console.timeEnd("AOC2022 | Day 10")