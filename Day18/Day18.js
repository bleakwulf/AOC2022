const fs = require('fs')

const NEIGHBOR_COORDS = new Map([
  [ `TOP`     , [  0, -1,  0  ]	],  
  [ `BOTTOM`  , [  0,  1,  0  ]	], 
  [ `LEFT`    , [ -1,  0,  0  ]	], 
  [ `RIGHT`   , [  1,  0,  0  ]	],  
  [ `FRONT`   , [  0,  0, -1  ]	], 
  [ `BACK`    , [  0,  0,  1  ]	]
])

const COVERAGE = {
  ALL            : 0, 
  EXTERNAL_ONLY  : 1
}

let RANGES = {
  X  : {  MIN: Infinity,  MAX: -Infinity  },
  Y  : {  MIN: Infinity,  MAX: -Infinity  },
  Z  : {  MIN: Infinity,  MAX: -Infinity  }
}

let rawInputData
let composite = new Map()
let aura      = new Set()    //  field of coordinates at least a unit from the maximum edge for each dimension face 

try {
  rawInputData = fs.readFileSync(`${__dirname}/Day18/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const parseInput = () => rawInputData
  .split(`\n`)
  .forEach( cube => {
    composite.set( cube, { coords: cube, aura : new Set(), connections: new Set() } )
  })

const getUnitNeighbors = (refCoords) => Array
  .from( NEIGHBOR_COORDS.values() )
  .map( coordIncrement => coordIncrement
    .map( (increment, coordIndex) => +refCoords.at(coordIndex) + increment )
  ).filter( ([ xCoord, yCoord, zCoord ]) => xCoord >= RANGES.X.MIN && xCoord <= RANGES.X.MAX
    && yCoord >= RANGES.Y.MIN && yCoord <= RANGES.Y.MAX
    && zCoord >= RANGES.Z.MIN && zCoord <= RANGES.Z.MAX
  ).map( coords => coords.join(`,`) )

const assessLavaDroplet = () => {
  //  identify aura range
  Array.from( composite.values() )
    .forEach( lavaUnit => {
      let [ xCoord, yCoord, zCoord ] = lavaUnit.coords.split(`,`).map(Number)
      RANGES.X.MIN = Math.min( RANGES.X.MIN , xCoord - 1)
      RANGES.X.MAX = Math.max( RANGES.X.MAX , xCoord + 1)
      RANGES.Y.MIN = Math.min( RANGES.Y.MIN , yCoord - 1)
      RANGES.Y.MAX = Math.max( RANGES.Y.MAX , yCoord + 1)
      RANGES.Z.MIN = Math.min( RANGES.Z.MIN , zCoord - 1)
      RANGES.Z.MAX = Math.max( RANGES.Z.MAX , zCoord + 1)
  })

  //  identify aura units 
  let auraCandidates = [ [ RANGES.X.MIN, RANGES.Y.MIN, RANGES.Z.MIN ].join(`,`) ]
  let visited = new Set()

  while ( auraCandidates.length ) {
    let currentAura = auraCandidates.shift()
    let [ xCoord, yCoord, zCoord ] = currentAura.split(`,`).map(Number)
    
    aura.add(currentAura)
    visited.add(currentAura)
    
    let neighbors = getUnitNeighbors([ xCoord, yCoord, zCoord ])
      ?.filter( neighbor => !aura.has(neighbor) && !composite.has(neighbor) && !visited.has(neighbor) )

    if (!neighbors.length) continue
    
    auraCandidates = auraCandidates.concat(neighbors)
    
    if (auraCandidates.length > 1) auraCandidates = Array.from( new Set( auraCandidates ) )
  }

  //  get stats of lava units
  Array.from( composite.values() )
    .map( lavaUnit => {
      let [ xCoord, yCoord, zCoord ] = lavaUnit.coords.split(`,`).map(Number) 
      let neighbors = getUnitNeighbors([ xCoord, yCoord, zCoord ])
      
      if (neighbors.length) 
        neighbors.forEach( neighbor => {
          if ( composite.has(neighbor) )  composite.get( lavaUnit.coords ).connections.add(neighbor)
          if ( aura.has(neighbor) )       composite.get( lavaUnit.coords ).aura.add(neighbor)
        })
    })
}

const calcArea = (coverage = COVERAGE.ALL) => Array
  .from( composite.values() )
  .map( refCoords => coverage === COVERAGE.ALL ? NEIGHBOR_COORDS.size - refCoords.connections.size : refCoords.aura.size )
  .reduce( (surfaceArea, exposedSides) => surfaceArea + exposedSides, 0)

const solveP1 = () => calcArea()

const solveP2 = () => calcArea(COVERAGE.EXTERNAL_ONLY)

console.log("AOC2022 | Day 18");
console.time("AOC2022 | Day 18")

if (rawInputData) {
  parseInput()
  assessLavaDroplet()

  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 | Day 18")