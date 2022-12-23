const fs = require('fs')

const DIRECTIONS = {
  NW  : [ -1  ,   -1 ], 
  N   : [  0  ,   -1 ], 
  NE  : [  1  ,   -1 ], 
  W   : [ -1  ,    0 ],
  E   : [  1  ,    0 ], 
  SW  : [ -1  ,    1 ], 
  S   : [  0  ,    1 ], 
  SE  : [  1  ,    1 ]
}

const SIM_MODE = {
  FINITE_ROUNDS  : 1,
  ALL_SETTLED    : 2
}

const DEFAULT_MIN_ROUNDS  = 10

const DEFAULT_DIRECTION_CHECK_CYCLE = [
  [  DIRECTIONS.N,  DIRECTIONS.NE,  DIRECTIONS.NW  ],
  [  DIRECTIONS.S,  DIRECTIONS.SE,  DIRECTIONS.SW  ],
  [  DIRECTIONS.W,  DIRECTIONS.NW,  DIRECTIONS.SW  ],
  [  DIRECTIONS.E,  DIRECTIONS.NE,  DIRECTIONS.SE  ]
]

let rawInputData, inputData
let elfLocations = new Set()
let directionPriority =  []

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const parseInput = () => {
  inputData = rawInputData.split(`\n`)
    .map( (line, lineIndex) => Array.from( line.matchAll(/\#{1,1}/g) )
      .map( elf => `${elf.index},${lineIndex}`)
    ).flat()
}

const initElfPositions = () => {
  elfLocations      = new Set(inputData)
  directionPriority = DEFAULT_DIRECTION_CHECK_CYCLE.map( directionScope => [ ...directionScope ])
}

const getNeighbor = ( [ xCoord, yCoord ], direction ) => {
  let newCoords = [ xCoord, yCoord ]
    .map( (coord, coordIndex) => +coord + direction.at(coordIndex) )
    .join(`,`)
  
  return elfLocations.has(newCoords) ? newCoords : null
}

const calcCoverage = () => {
  let { maxN, maxS, maxW, maxE } = Array.from( elfLocations.values() )
    .reduce( (stats, elfLocation) => {
      let [ xCoord, yCoord ] = elfLocation.split(`,`).map(Number)
      
      return {
        maxN: Math.min (yCoord, stats.maxN ),  maxS: Math.max( yCoord, stats.maxS ), 
        maxW: Math.min( xCoord, stats.maxW ),  maxE: Math.max( xCoord, stats.maxE )
      }
    }, {
      maxN: Infinity,  maxS: -Infinity, 
      maxW: Infinity,  maxE: -Infinity
    })
  
  return ( maxS - maxN + 1 ) * ( maxE - maxW + 1 ) - elfLocations.size    
}

const simulateGroundCoverage = (
  mode       = SIM_MODE.FINITE_ROUNDS, 
  maxRounds  = DEFAULT_MIN_ROUNDS
) => {
  let rounds = mode === SIM_MODE.FINITE_ROUNDS ? maxRounds : Infinity
  let roundCounter = 1
  
  initElfPositions()

  do {
    let candidateCoords = new Map()

    //  identify elves to move and each of their proposed destinations 
    Array.from( elfLocations.values() ).forEach( elfLocation => {
      let [ xCoord, yCoord ] = elfLocation.split(`,`)

      let neighbors = directionPriority.map( priority => priority
          .map( direction => getNeighbor( [ xCoord, yCoord ], direction ) )
        )

      let isMoving = neighbors.flat().some( neighbor => !!neighbor )

      if (isMoving) {
        let nextPosition = directionPriority
          .map( priority => priority.at(0) )
          .map( ( coordIncrements, priorityIndex ) => {
            if ( neighbors.at(priorityIndex).some( neighbor => !!neighbor ) ) return null
                      
            return [ xCoord, yCoord ]
              .map( (coord, coordIndex) => +coord + coordIncrements.at(coordIndex) )
              .join(`,`)
          }).find( position => !!position )

        if (!!nextPosition) {
          if (!candidateCoords.has( nextPosition )) candidateCoords.set(nextPosition, [ elfLocation ])
          else candidateCoords.get(nextPosition).push(elfLocation)
        }
      }
    })

    // all elves are settled, end simulation for all-settled mode
    if ( SIM_MODE.ALL_SETTLED && !candidateCoords.size ) break

    //  filter destinations proposed by just one elf, then perform location transfer
    Array.from( candidateCoords.entries() )
      .filter(  ([destination, origins ]) => origins?.length === 1 )
      .forEach( ([destination, origins ]) => {
        elfLocations.add(destination)
        elfLocations.delete( origins.at(0) )
      })
    
    //  reorder direction priority by moving current first priority direction into last priority
    directionPriority.push( directionPriority.shift() )
    
  } while( ++roundCounter <= rounds )

  return { maxRounds: roundCounter, coverage: calcCoverage() }
}

const solveP1 = () => {
  let simResults = simulateGroundCoverage()
  return simResults.coverage
}

const solveP2 = () => { 
  let simResults = simulateGroundCoverage(SIM_MODE.ALL_SETTLED)
  return simResults.maxRounds
}

console.log("AOC2022 | Day 23");
console.time("AOC2022 | Day 23")

if (rawInputData) {
  parseInput()

  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 | Day 23")