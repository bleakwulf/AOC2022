const fs = require('fs')

let ORIGIN_MARKER       = `S`
let DESTINATION_MARKER  = `E`
let rawInputData, inputData
let originCoords, destinationCoords
let HEIGHT_MATRIX = new Map()
let HEIGHT_MAP    = {}


try {
  rawInputData = fs.readFileSync(`${__dirname}/Day12/input.txt`, 'utf8')
  //rawInputData = fs.readFileSync(`${__dirname}/Day12/demo.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const buildHeightRef = () => 'abcdefghijklmnopqrstuvwxyz'
  .split('')
  .forEach( (item, index) => HEIGHT_MATRIX.set( item, index + 1 ) )

const parseInput = () => {
  inputData = rawInputData
    .split(`\n`)
    .map( (line, yIndex) => line
      .split('')
      .map( (position, xIndex ) => {
        switch (position) {
          case ORIGIN_MARKER:
            originCoords = [ yIndex, xIndex ]
            return Math.min( ...Array.from( HEIGHT_MATRIX.values() ))  
            break
          case DESTINATION_MARKER:
            destinationCoords = [ yIndex, xIndex ]
            return Math.max( ...Array.from( HEIGHT_MATRIX.values() ))  
            break
          default:
            return HEIGHT_MATRIX.get( position )
            break
        }
      })
    )

  HEIGHT_MAP = { 
    ...HEIGHT_MAP, 
    LENGTH  : inputData.at(0).length, 
    WIDTH   : inputData.length,
    START   : originCoords.join(`,`),
    END     : destinationCoords.join(`,`)
  }
  //console.log(HEIGHT_MAP)
  //console.log(inputData.map( line => line.join(` | `)).join(`\n`))
}

const simulateNavigation = () => {
  let routes = [ [ originCoords.join(`,`) ] ]
  let routeFound = []

  let nextPositionOptions = [
    [  0,  1 ],  // top
    [  0, -1 ],  // down
    [ -1,  0 ],  // left
    [  1,  0 ]   // right
  ]

  while( routes.length) {
    //console.log(`\nRoutes: ${routes.length}`)
    let currentRoute = routes.shift()
    let [ lastCoordY, lastCoordX ] = currentRoute.at(-1).split(`,`).map(Number)
    let lastHeight = inputData[ lastCoordY ][ lastCoordX ]

    //console.log()
    //console.log(`\tCurrent Route : ${currentRoute.join(` | `)}`)
    
    let candidatePositions = nextPositionOptions
      .reduce( (candidateCoords, nextCoordOption) => {
        let [ nextCoordY, nextCoordX ] = nextCoordOption
          .map( (coord, coordIndex) => ( coordIndex === 0 ? lastCoordY : lastCoordX ) + coord
        )

        //console.log(`\t\t${HEIGHT_MAP.LENGTH}, ${HEIGHT_MAP.WIDTH} | ${nextCoordY}, ${nextCoordX} `)

        if( ![ nextCoordY, nextCoordX ].includes( -1 ) 
          && nextCoordY < HEIGHT_MAP.WIDTH 
          && nextCoordX < HEIGHT_MAP.LENGTH 
          && !currentRoute.includes( [ nextCoordY, nextCoordX ].join(`,`))
        ) candidateCoords.push([ nextCoordY, nextCoordX ])
        
        return candidateCoords
      }, [] )
    //console.log(`\tcandidates : \n\t\t${candidatePositions.join(`\n\t\t`)}`)

/*    if ( candidatePositions
      .map( coords => coords.join(`,`) )
      .includes( HEIGHT_MAP.END ) 
    ) {  // end iteration if cadidate position is already among next candidate positions 
      routeFound.push( [ ...currentRoute, HEIGHT_MAP.END ] )
    
      console.log(`destination found`)
      console.log(`\t${currentRoute.join(`\n\t`)}\n\t${HEIGHT_MAP.END}`)
      break
    } */

    candidatePositions.forEach( candidateCoords => {
      let [ nextCoordY, nextCoordX ] = candidateCoords
      let candidateHeight = inputData[ nextCoordY ][ nextCoordX ]
      
      //console.log(`\n${candidateHeight} vs ${lastHeight} : ${[ lastHeight, lastHeight + 1 ].includes(candidateHeight)}`)
      
      if ( [ lastHeight, lastHeight + 1 ].includes(candidateHeight) ) {
        if (HEIGHT_MAP.END === candidateCoords.join(`,`)) {
          routeFound.push( [ ...currentRoute.splice(1), HEIGHT_MAP.END ] )
        } else routes.push([ ...currentRoute, candidateCoords.join(`,`) ] ) 
      }
    })

    if (routeFound.length) break
  }

  console.log( Math.min( ...routeFound.map( route => route.length )))
}

const solveP1 = rawInput => { simulateNavigation() }

const solveP2 = rawInput => { }

console.log("AOC2022 | Day 12");
console.time("AOC2022 | Day 12")

if (rawInputData) {
  buildHeightRef()
  parseInput()

  console.log(`P1 : ${solveP1(inputData)}`)
  console.log(`P2 : ${solveP2(inputData)}`)
}

console.timeEnd("AOC2022 | Day 12")