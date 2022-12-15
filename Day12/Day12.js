const fs = require('fs')

const CELL_STATE = {
  AVAILABLE : 0,
  VISITED   : 1
}
const ORIGIN_MARKER       = `S`
const DESTINATION_MARKER  = `E`

let rawInputData, inputData
let origin, destination
let HEIGHT_MATRIX = new Map()
let TERRAIN_MAP    = {}


try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
  //rawInputData = fs.readFileSync(`${__dirname}/Day12/demo.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const buildHeightRef = () => 'abcdefghijklmnopqrstuvwxyz'
  .split('')
  .forEach( (item, index) => HEIGHT_MATRIX.set( item, index + 1 ) )

//heuristic we will be using - Manhattan distance
//for other heuristics visit - https://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
const heuristic = ( refCoordX, refCoordY ) => {
  let d1 = Math.abs(refCoordX - destination.x);
  let d2 = Math.abs(refCoordY - destination.y);
  return d1 + d2;
}

const getNeighbors = ( position, includeDiagonals = false ) => {
  let nextPositionOptions = [
    [  0,  1 ],  // top
    [  0, -1 ],  // down
    [ -1,  0 ],  // left
    [  1,  0 ]   // right
  ]

  if ( includeDiagonals ) {
    nextPositionOptions.push(
      [ -1,  1 ],  // top left
      [  1,  1 ],  // top right
      [ -1, -1 ],  // down left
      [  1, -1 ]  // down left
    )
  }

  //console.log(`\nposition: ${JSON.stringify(position, null, '\t')}`)
  let neighbors = nextPositionOptions
    .reduce( (allNeighbors, [ neighborCoordX, neighborCoordY ]) => {
      let [ refCoordX, refCoordY ] = [ position.x + neighborCoordX, position.y + neighborCoordY ]

      //if( position.x === 2 && position.y === 2) {
      //  console.log(`\t\t==============================`)
      //  console.log(`\t\t${refCoordX} vs. ${TERRAIN_MAP.LENGTH}`)
      //  console.log(`\t\t${refCoordY} vs. ${TERRAIN_MAP.WIDTH}`)
      //  console.log(`\t\t${position.height} vs. ${inputData[ refCoordY ][ refCoordX ].height}`)
      //}
      if (refCoordX < 0 || refCoordX >= TERRAIN_MAP.LENGTH ) return allNeighbors
      if (refCoordY < 0 || refCoordY >= TERRAIN_MAP.WIDTH  ) return allNeighbors
      if (inputData[ refCoordY ][ refCoordX ].state !== CELL_STATE.AVAILABLE) return allNeighbors
  
      if ( [ position.height, position.height + 1 ].includes( inputData[ refCoordY ][ refCoordX ].height ) ) {
        inputData[ refCoordY ][ refCoordX ].heuristic = heuristic(refCoordX, refCoordY)
        allNeighbors.push(inputData[ refCoordY ][ refCoordX ])
      }
      
      return allNeighbors
    }, [])
    ?.sort( (a, b) => a.heuristic - b.heuristic)
    ?.sort( (a, b) => b.height - a.height)

  //console.log(`\nneighbors: ${JSON.stringify(neighbors, null, '\t')}`)

  return neighbors
}

const parseInput = () => {
  inputData = rawInputData
    .split(`\n`)
    .map( (line, yIndex) => line
      .split('')
      .map( (altitude, xIndex ) => {
        switch (altitude) {
          case ORIGIN_MARKER:
            origin = {
              x          : xIndex, 
              y          : yIndex,
              height     : Math.min( ...Array.from( HEIGHT_MATRIX.values() )),
              heuristic  : 0,
              state      : CELL_STATE.AVAILABLE
            }
            return origin 
            break
          case DESTINATION_MARKER:
            destination = {
              x          : xIndex, 
              y          : yIndex,
              height     : Math.max( ...Array.from( HEIGHT_MATRIX.values() )),
              heuristic  : 0,
              state      : CELL_STATE.AVAILABLE
            }
            return destination
            break
          default:
            return {
              x          : xIndex, 
              y          : yIndex,
              height     : HEIGHT_MATRIX.get( altitude ),
              heuristic  : 0,
              state      : CELL_STATE.AVAILABLE
            }
            break
        }
      })
    )

  TERRAIN_MAP = { 
    LENGTH  : inputData.at(0).length,  // max x
    WIDTH   : inputData.length,        // max y
    START   : origin,
    END     : destination
  }
}

const simulateNavigation = ( canDoDiagonals = false) => {
  let routes = [ origin ]
  let path = []

  let nextPositionOptions = [
    [  0,  1 ],  // top
    [  0, -1 ],  // down
    [ -1,  0 ],  // left
    [  1,  0 ]   // right
  ]

  while( routes.length ) {
    let currentPosition = routes.shift()

    if (currentPosition.x === destination.x && currentPosition.y === destination.y) 
      break
    
    let [ nextLocation ] = getNeighbors(currentPosition, canDoDiagonals)

    if (!nextLocation) break

    if (path.length > 33) break
    path.push( currentPosition )
    inputData[ nextLocation.y ][ nextLocation.x].state = CELL_STATE.VISITED
    routes.push(nextLocation)
  }

  console.log(path)
  return path.length
}

const solveP1 = rawInput => simulateNavigation()

const solveP2 = rawInput => { }

console.log("AOC2022 | Day 12");
console.time("AOC2022 | Day 12")

if (rawInputData) {
  buildHeightRef()
  parseInput()

  //console.log(inputData)
  //console.log(TERRAIN_MAP)

  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2(inputData)}`)
}

console.timeEnd("AOC2022 | Day 12")