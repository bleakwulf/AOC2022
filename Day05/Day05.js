const fs = require('fs')

let CRANE_VERSIONS = {
  CRATE_MOVER_9000: { isMultiCargo: false }, 
  CRATE_MOVER_9001: { isMultiCargo: true }
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

const initCraneMoves = () => {
  craneMoves = craneRawMoves
    .replace(/move /g, '')
    .replace(/ from /g, ',')
    .replace(/ to /g, ',')
    .split('\n')
    .map(craneMove => craneMove.split(','))
    .map(moveData => {
      let [crateCount, ...otherData] = moveData
      return [ +crateCount, ...otherData ]
    })
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

const doCraneMoves = (craneVersion = CRANE_VERSIONS.CRATE_MOVER_9000) => {
  craneMoves.forEach( craneMove => {
    let [ crateCount, stackOrigin, stackDestination ] = craneMove
    let cargo = stacks.get(stackOrigin).splice(0, crateCount)
    if (!craneVersion.isMultiCargo) cargo.reverse()
    stacks.get(stackDestination).unshift(...cargo)
  })
}

const getTopCrates = () => Array.from(stacks.values())
  .reduce( (result, currentStack) => result + currentStack.at(0) || '', '')

const solveP1 = () => {
  initStacksData()
  doCraneMoves()
  return getTopCrates()
}

const solveP2 = () => {
  initStacksData()
  doCraneMoves(CRANE_VERSIONS.CRATE_MOVER_9001)
  return getTopCrates()
}

console.log("AOC2022 | Day 05")
console.time("AOC2022 D05")

if (rawInputData) {
  [stackRawState, craneRawMoves] = rawInputData.split('\n\n')
  
  initCraneMoves()

  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 D05")