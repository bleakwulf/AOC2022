const fs = require('fs')

const ORIGIN_MARKER               = `S`
const DESTINATION_MARKER          = `E`
const DEFAULT_MAX_ELEVATION_DIFF  = 1

const ORIGIN_MODE  = {
  START_POINT            : 1, 
  ANY_LOWEST_ELEVATION   : 2
}

const NEIGHBOR_DIRECTIONS = [
    [  0,  1  ],    //  right
    [  0, -1  ],    //  left
    [ -1,  0  ],    //  top
    [  1,  0  ]     //  bottom
]

let rawInputData, inputData
let HEIGHT_MATRIX = new Map()
let originCoords, destinationCoords

let COORDS_MAP = new Map()
let GEO_MAP    = {}

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const buildHeightRef = () => 'abcdefghijklmnopqrstuvwxyz'
  .split('')
  .forEach( (item, index) => HEIGHT_MATRIX.set( item, index + 1 ) )

const parseInput = () => {
  GEO_MAP.ALTITUDE_MIN = Math.min( ...Array.from( HEIGHT_MATRIX.values() ))
  GEO_MAP.ALTITUDE_MAX = Math.max( ...Array.from( HEIGHT_MATRIX.values() ))
  
  inputData = rawInputData.split(`\n`).map( 
    (line, yIndex) => line.split('').map( 
      (position, xIndex ) => {
        let coords = [ xIndex, yIndex ].join(`,`)
        
        if ( position === ORIGIN_MARKER )      originCoords       = coords
        if ( position === DESTINATION_MARKER ) destinationCoords  = coords
        
        return { 
          coords,
          x        : xIndex,
          y        : yIndex,
          value    : position === ORIGIN_MARKER       ? GEO_MAP.ALTITUDE_MIN
                   : position === DESTINATION_MARKER  ? GEO_MAP.ALTITUDE_MAX
                   : HEIGHT_MATRIX.get( position ) 
        }
    })
  )
  
  GEO_MAP.LENGTH = inputData.at(0).length    //  column count
  GEO_MAP.WIDTH  = inputData.length          //  row count
}

const getDistance = ( start, end ) => {
  let [ startX, startY, endX, endY ] = Array.of( start, end ).flat()
  return Math.abs( endX - startX ) + Math.abs( endY - startY )
}

const init = (originMode = ORIGIN_MODE.START_POINT) => inputData
  .flat()
  .forEach( coord => COORDS_MAP.set( coord.coords, { 
    ... coord, 
    pointer  : undefined,
    f  :   originMode === ORIGIN_MODE.START_POINT && coord.coords === originCoords                  ?  0 
         : originMode === ORIGIN_MODE.ANY_LOWEST_ELEVATION && coord.value === GEO_MAP.ALTITUDE_MIN  ?  0
         : Infinity, 
    g  :   originMode === ORIGIN_MODE.START_POINT && coord.coords === originCoords                  ?  0 
         : originMode === ORIGIN_MODE.ANY_LOWEST_ELEVATION && coord.value === GEO_MAP.ALTITUDE_MIN  ?  0
         : Infinity, 
    h  :   coord.coords === destinationCoords  ?  0 
         : getDistance( [coord.x, coord.y ] , destinationCoords.split(`,`).map(Number) ) 
  }))

const getLowestPoints = () => Array
  .from(   COORDS_MAP.values() )
  .filter( coords => coords.value === GEO_MAP.ALTITUDE_MIN)
  .map(    lowPoint => lowPoint.coords )

const isValidCoords = ([ refCoordX, refCoordY ]) => refCoordX >= 0 
  && refCoordX < GEO_MAP.LENGTH
  && refCoordY >= 0 
  && refCoordY < GEO_MAP.WIDTH

const getNeighborCoords = (refCoords) => NEIGHBOR_DIRECTIONS
  .map(     increments => increments.map( (value, index) => refCoords.at(index) + value ) )
  .filter(  refCoords => isValidCoords( refCoords )  )
  .map(     ([ refCoordX, refCoordY ]) => ({ 
    coords  : [ refCoordX, refCoordY ].join(`,`), 
    x       : refCoordX, 
    y       : refCoordY
  }))

const findPath = (originMode = ORIGIN_MODE.START_POINT) => {
  init( originMode )
  let candidates = originMode === ORIGIN_MODE.START_POINT ? [ originCoords ] : getLowestPoints()  //  priority queue (PQ)
  let visited = new Set()

  while( candidates.length) {
    let refCoord = candidates.shift()
    visited.add( refCoord )
    
    if (refCoord === destinationCoords) break      //  destination reached

    let currentUnit = COORDS_MAP.get( refCoord )
    let neighbors   = getNeighborCoords([ currentUnit.x, currentUnit.y ])
      ?.filter( neighborCoords => !visited.has( neighborCoords.coords ) 
        && COORDS_MAP.get( neighborCoords.coords ).value - currentUnit.value <= DEFAULT_MAX_ELEVATION_DIFF ) 

    //  recalculate f of each neighbor
    neighbors.forEach( neighbor => {
      let neighborUnit = COORDS_MAP.get( neighbor.coords )
      let newG = Math.min( currentUnit.g + 1, neighborUnit.g )
      
      if ( newG < neighborUnit.g ) 
        COORDS_MAP.set( neighborUnit.coords, { 
          ...neighborUnit, 
          g        : newG,
          f        : newG + neighborUnit.h, 
          pointer  : currentUnit.coords 
        })
    })

    //  append neighbor to PQ
    candidates = Array.from( new Set( candidates
        .concat( neighbors.map( neighbor => neighbor.coords ) )
      ))

    //  find coordinates with minimum f and move them in front of PQ
    if (candidates.length > 1) {
      let priorityCandidates = []
      let minF = candidates
        .map( coords => COORDS_MAP.get( coords ) )
        .reduce( (minF, candidate ) => Math.min( minF, candidate.f ), Infinity)

      while ( true ) {
        let index = candidates
          .map( coords => COORDS_MAP.get( coords ) )
          .findIndex( candidate => candidate.f === minF)

        if (index < 0) break

        priorityCandidates.push( ...candidates.splice(index, 1) )
      }

      candidates = priorityCandidates.concat(candidates)
    }
  }
  
  return COORDS_MAP.get( destinationCoords).g
}

const solveP1 = () => findPath()

const solveP2 = () => findPath( ORIGIN_MODE.ANY_LOWEST_ELEVATION )

console.log("AOC2022 | Day 12");
console.time("AOC2022 | Day 12")

if (rawInputData) {
  buildHeightRef()
  parseInput()
  
  console.log(`P1 : ${ solveP1() }`)
  console.log(`P2 : ${ solveP2() }`)
}

console.timeEnd("AOC2022 | Day 12")