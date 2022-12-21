const fs = require('fs')

const DEFAULT_CHAMBER_WIDTH    = 7
const DEFAULT_ORIGIN_OFFSET_X  = 2
const DEFAULT_ORIGIN_OFFSET_Y  = 3
const DEFAULT_INTERVAL_CHECK   = 2022

const ROCK_SHAPES = new Map([
  [ 1, { type: 1, height: 1, width: 4, form: [ `#`, `#`, `#`, `#` ]  } ],    // 4-unit horizontal line
  [ 2, { type: 2, height: 3, width: 3, form: [ `.#`, `###`, `.#` ]   } ],    // cross-shaped
  [ 3, { type: 3, height: 3, width: 3, form: [ `#`, `#`,`###` ]      } ],    // horizontal-flipped L
  [ 4, { type: 4, height: 4, width: 1, form: [ `####` ]              } ],    // 4-unit vertical line
  [ 5, { type: 5, height: 2, width: 2, form: [ `##`, `##` ]          } ]     // 4-unit 
])

let rawInputData, inputData

let hotGasJets   = []
let fallingRocks = []
let towerStructure = new Map()
let fallenRocks  = 0
let peaks = []

let doCustomLog = true  // for debugging

try {
  rawInputData = fs.readFileSync(`${__dirname}/Day17/input.txt`, 'utf8')
  //rawInputData = fs.readFileSync(`${__dirname}/Day17/demo.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const customLog = message => {
  if (doCustomLog) console.log(message)
}

const parseInput = () => {
  inputData = rawInputData.split(``)
}

const init = () => {
  peaks         = Array( DEFAULT_CHAMBER_WIDTH ).fill( 0 )
  fallingRocks  = Array.from( ROCK_SHAPES.values() )
  hotGasJets    = [ ...inputData ]
  fallenRocks   - 0
  towerStructure = new Map([ 
    [ 0, [] ],
    [ 1, [] ],
    [ 2, [] ],
    [ 3, [] ],
    [ 4, [] ],
    [ 5, [] ]
  ])
  
}

const getRockTowerHeight = () => Math.max( ...peaks )

const simulateRockTower = ( refIntervals = []) => {
  let intervalStats = {}
  
  init()
  
  while( refIntervals.length ) {
    doCustomLog = fallenRocks >= 34
    
    //  get incoming rock, and position it
    let fallingRock = fallingRocks.shift()
    let rockPosition = { 
      X  : 0 + DEFAULT_ORIGIN_OFFSET_X,
      Y  : getRockTowerHeight() + DEFAULT_ORIGIN_OFFSET_Y + 1
    }
    let jets = ``
    
    //customLog(`\n------------------------------------------------------------`)
    //customLog(`\t Rock incoming!`)
    //customLog(fallingRock)
    //customLog(rockPosition)
    //customLog(`------------------------------------------------------------`)

    
    let hasLanded           = false
    //let isFlatBottomLanding = true
    
    do {
      let hotGasJet = hotGasJets.shift()
      jets += hotGasJet
      
      switch( hotGasJet ) {
        case `>`: 
          //customLog(`hot air > | ${rockPosition.X} + ${fallingRock.width} < ${DEFAULT_CHAMBER_WIDTH}`)
          if (  rockPosition.X + fallingRock.width  < DEFAULT_CHAMBER_WIDTH 
            &&  peaks.at( rockPosition.X + fallingRock.width ) < rockPosition.Y ) 
            rockPosition.X++
          //customLog(rockPosition)
          break
          
        case `<`: 
          //customLog(`hot air < | ${rockPosition.X} - 1 >= 0`)
          if (  rockPosition.X - 1 >= 0 && peaks.at( rockPosition.X - 1 ) < rockPosition.Y ) rockPosition.X--
          //customLog(rockPosition)
          break
      }
      
      hotGasJets.push(hotGasJet)
      rockPosition.Y--
      //customLog(rockPosition)

      //  check landing
      let landingArea = peaks.slice( rockPosition.X, rockPosition.X + fallingRock.width)
      switch ( fallingRock.type ) {
        case 2: 
          let [ y1, y2, y3 ] = landingArea
          if ( y2 === rockPosition.Y )    //  landed on its most bottom part
            hasLanded = true
          else if ( [ y1, y3 ].includes( rockPosition.Y + 1) ) {
            //  landed on its edge part
            //isFlatBottomLanding = false
            hasLanded = true
          }
          break

        default:    // for rest of flat-bottom shapes
          hasLanded = landingArea.includes( rockPosition.Y )
          break
      }
      
    } while (!hasLanded)
    
    // recalibrate peaks once rock has landed
    if (hasLanded) {
      //customLog(`\n------------------------------------------------------------`)
      //customLog(`\t Rock landed!`)

      //customLog(rockPosition)
      //customLog(isFlatBottomLanding)
      
      landingArea = Array.from(
        Array( fallingRock.width ), 
        (_, peakIndex) => Math.max(
          peaks.at(rockPosition.X + peakIndex),
          rockPosition.Y + 1 + fallingRock.form.at( peakIndex ).lastIndexOf(`#`) //- !isFlatBottomLanding
        )
      )

      peaks.splice( rockPosition.X, fallingRock.width, ...landingArea)
      fallenRocks++
      
      //customLog(`------------------------------------------------------------`)
      //customLog(`\t rocks : ${fallenRocks} | jetCounter : ${jets}`)
      customLog(`\t #${`${fallenRocks}`.padStart(4, `0`)} : ${getRockTowerHeight().toString().padStart(4, ` `)} => ` 
                + peaks.map( peak => `${peak}`.padStart( 4, ` `)).join(` | `)
               + ` || ${jets}`)
    }
    
    //  if an expected interval is reached, record the tower's height and remove the interval from expected intervals
    if (refIntervals.includes(fallenRocks)) {
      //customLog(`\n------------------------------------------------------------`)
      //customLog(`\tInterval reached!`)
      
      refIntervals.splice( refIntervals.indexOf(fallenRocks), 1)
      intervalStats = { ...intervalStats, [fallenRocks] : getRockTowerHeight() }
      
      //customLog(intervalStats)
    }

    fallingRocks.push(fallingRock)  // put same type of rock at the end of queue of incoming rocks
  }

  return intervalStats
}

const solveP1 = () => {
  //return simulateRockTower([ DEFAULT_INTERVAL_CHECK ])[ DEFAULT_INTERVAL_CHECK ]
  //let intervalStats = simulateRockTower([ DEFAULT_INTERVAL_CHECK ])
  let intervalStats = simulateRockTower([ 50 ])
  console.log(intervalStats)
}

const solveP2 = () => { }

console.log("AOC2022 | Day 17");
console.time("AOC2022 | Day 17")

if (rawInputData) {
  parseInput()

  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 | Day 17")

/*
  P!: 3165  //  too low
  P1: expected 3186
*/