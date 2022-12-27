const fs = require('fs')

let CRANE_VERSIONS = {
  CRATE_MOVER_9000  : {  isMultiCargo: false   }, 
  CRATE_MOVER_9001  : {  isMultiCargo: true    }
}

let rawInputData, stackRawState, craneRawMoves
let stacks = new Map()
let craneMoves = []

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const parseInput = () => {
  [ stackRawState, craneRawMoves ] = rawInputData.split('\n\n')
  
  craneMoves = Array.from( 
    craneRawMoves.matchAll( /^move (?<count>(.{1,})) from (?<source>(.{1,})) to (?<target>(.{1}))$/gm ), 
    ( match ) => {
      let { count, source, target } = match.groups
      return Array.of( +count, source, target )
    }
  )
}

const initStacksData = () => {
  stacks = new Map()
  
  let tiers = stackRawState
    .split('\n')
    .map(tier => tier
      .replace(/[\[\]]/g, ' ')
      .split('')
    )
  let stacksList = tiers.pop()
  
  stacksList.forEach((stack, stackIndex) => {
    if (stack.trim()) {
      let stackCrates = []
      
      tiers.forEach((tier) => {
        if ( tier[stackIndex].trim() ) 
          stackCrates.push( tier[stackIndex] )
      })
      
      stacks.set(stack, stackCrates)
    }
  })
}

const doCraneMoves = ( craneVersion = CRANE_VERSIONS.CRATE_MOVER_9000 ) => {
  craneMoves.forEach( craneMove => {
    let [ crateCount, stackOrigin, stackDestination ] = craneMove
    let cargo = stacks.get(stackOrigin).splice(0, crateCount)
    if (!craneVersion.isMultiCargo) cargo.reverse()
    stacks.get(stackDestination).unshift(...cargo)
  })
}

const getTopCrates = (craneVersion = CRANE_VERSIONS.CRATE_MOVER_9000) => {
  initStacksData()
  doCraneMoves(craneVersion)
  
  return Array
    .from(    stacks.values() )
    .reduce(  (result, currentStack) => result + currentStack.at(0) || '', '' )
}

const solveP1 = () => getTopCrates()

const solveP2 = () => getTopCrates(CRANE_VERSIONS.CRATE_MOVER_9001)

console.log("AOC2022 | Day 05")
console.time("AOC2022 D05")

if (rawInputData) {
  parseInput()

  console.log(`P1 : ${ solveP1() }`)
  console.log(`P2 : ${ solveP2() }`)
}

console.timeEnd("AOC2022 D05")