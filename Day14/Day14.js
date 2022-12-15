const fs = require('fs')

/**  (x, y) coordinate where sand is pouring in  */
const SAND_SOURCE = { X :  500, Y :  0 }    

const SIM_MODE = {
  INFINITE_ABYSS : 1,
  SOURCE_FILL    : 2
}

let rawInputData
let inputData = []
let nextPosCandidates = []
let rocks = new Map()
let sands = new Map()

let firstRockBottom = Infinity
let minX = 0
let maxX = 0
let maxY = 0

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const parseInput = () => {
  rawInputData
    .split(`\n`)
    .forEach( line => {
      let coords = line
        .split(` -> `)
        .map( coord => coord.split(`,`).map(Number) )
      
      for ( let coordIndex = 1; coordIndex < coords.length; coordIndex++ ) {
        inputData.push( [ coords.at(coordIndex - 1), coords.at(coordIndex) ])
      }
    })
}

/**  initialize cave structure, sands, and other check params  */
const init = (mode = SIM_MODE.INFINITE_ABYSS) => {
  sands.clear()
  rocks.clear()
  
  nextPosCandidates = []

  firstRockBottom = Infinity
  minX = 0
  maxX = 0
  maxY = 0
  
  inputData.forEach( rangePair => {
    let [ startA, endA, startB, endB ] = rangePair
      .sort( (a,b) => a.at(0) < b.at(0) ? -1                                          
        : a.at(0) > b.at(0) ?  1
        : a.at(1) < b.at(1) ? -1
        : a.at(1) > b.at(1) ?  1
        : 0
      ).flat()
      .map(Number)
    
    minX = minX === 0 ? Math.min( startA, startB ) : Math.min( minX, startA, startB )
    maxX = maxX === 0 ? Math.max( startA, startB ) : Math.max( maxX, startA, startB )
    maxY = maxY === 0 ? Math.max( endA, endB ) : Math.max( maxY, endA, endB )
  
    let increment = 1 + ( startB - startA || endB - endA )
    let isRangeX = !!(startB - startA)
    
    /**  build rock structures of the cave  */
    for( let i = 0; i < increment; i++ ) {
      let [ newX, newY ] = [
        isRangeX ? startA + i  : startA, 
        isRangeX ? endA        : endA + i
      ]

      if ( newX === SAND_SOURCE.X ) firstRockBottom = Math.min( newY, firstRockBottom)

      rocks.set([newX,newY].join(`,`), [newX,newY])
    }
  })

  if (mode = SIM_MODE.INFINITE_ABYSS) maxY += 2

  /**  build init trickle path from origin  */
  for (i = 0; i <= firstRockBottom - 1; i++) {
    if (i <= firstRockBottom) { 
      nextPosCandidates.push([
          [ SAND_SOURCE.X    , i ],
          [ SAND_SOURCE.X - 1, i ],
          [ SAND_SOURCE.X + 1, i ]
        ])
    }
  }
}

const isOpenSpace = (coordinates, mode = SIM_MODE.INFINITE_ABYSS) => {
  let isOpenSpace = !rocks.get(coordinates.join(`,`)) && !sands.get(coordinates.join(`,`))
  return mode === SIM_MODE.INFINITE_ABYSS 
    ? isOpenSpace 
    : isOpenSpace && coordinates.at(-1) !== maxY
}

const isInVoid = ( coordinates, mode = SIM_MODE.INFINITE_ABYSS ) => {
  let [ refX, refY ] = coordinates
  return mode = SIM_MODE.INFINITE_ABYSS 
    ? refX < minX || refX > maxX || refY > maxY
    : false
}

const getCoordinateStats = ( coordinates, mode = SIM_MODE.INFINITE_ABYSS ) => ({
    isVoid      : isInVoid( coordinates, mode ), 
    isAvailable : isOpenSpace( coordinates, mode )
  })

const getNextFlowStats = ( coordinates, mode = SIM_MODE.INFINITE_ABYSS ) => {
  let [ refX, refY ] = coordinates
  return candidateCoords = [
      [refX    , refY + 1 ],  //  bottom
      [refX - 1, refY + 1 ],  //  bottom-left
      [refX + 1, refY + 1 ],  //  bottom-right
    ].map(    coords => ({ coordinate: coords, ...getCoordinateStats(coords, mode) }) )
}

const isAtSource = ([ refX, refY ]) => refX === SAND_SOURCE.X && refY === SAND_SOURCE.Y

const simulateSandFlow = ( mode = SIM_MODE.INFINITE_ABYSS ) => {
  init(mode)
  
  let isFlowing       = true    //  set to false if a void coordinate is found
  let isFloorReached  = false   //  on source-fill mode, set to false once floor is reached

  while ( isFlowing ) {
    let pathCandidates = nextPosCandidates
      .pop()
      .map(     coord => ({ coordinate: coord, ...getCoordinateStats(coord, mode) }) )
      .filter(  coord => !!coord.isAvailable )
  
    if (!pathCandidates.length) continue    //  candidates in set were no longer available

    //  next position is in void, end flow for infinite-abyss mode
    if ( mode === SIM_MODE.INFINITE_ABYSS && pathCandidates.at(0).isVoid ) break

    pathCandidates = pathCandidates.map( coords => coords.coordinate )
    
    let nextPaths = getNextFlowStats( pathCandidates.at(0), mode )
      .filter( coord => !!coord.isAvailable )
      ?.map(   coord => coord.coordinate )
    
    if ( !nextPaths.length ) {    //  no next candidate, sand must settle at the prime candidate position
      position = pathCandidates.shift()
      sands.set( position.join(`,`), position ) 

      //  cave floor reached on source-fill mode
      if ( mode === SIM_MODE.SOURCE_FILL && position.at(-1) === maxY - 1 ) isFloorReached = true

      //  source is blocked, end flow for source-fill mode
      if ( mode === SIM_MODE.SOURCE_FILL && isFloorReached && isAtSource(position) ) break
      
      //  push other candidates back into reference set
      if ( !!pathCandidates.length ) nextPosCandidates.push(pathCandidates)
      
    } else {
      nextPosCandidates.push( pathCandidates )  //  push back current set of candidates
      nextPosCandidates.push( nextPaths )       //  push next set of candidates
    }

    isFlowing = !!nextPosCandidates.length
  } 
  
  return sands.size
}

const solveP1 = () => simulateSandFlow()

const solveP2 = () => simulateSandFlow( SIM_MODE.SOURCE_FILL )

console.log("AOC2022 | Day 14");
console.time("AOC2022 | Day 14")

if ( rawInputData ) {
  parseInput()

  console.log(`P1 : ${ solveP1() }`)
  console.log(`P2 : ${ solveP2() }`)
}

console.timeEnd("AOC2022 | Day 14")