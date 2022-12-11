const fs = require('fs')

const DEFAULT_MIN_ROUNDS      = 20
const DEFAULT_MAX_ROUNDS      = 1e4
const DEFAULT_RELIEF_FACTOR   = 3
const DEFAULT_RANK_RANGE_MIN  = 2

let rawInputData
let monkeys             = new Map()
let monkeyItems         = new Map()
let monkeyInspectCounts = new Map()

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const parseInput = () => rawInputData
  .split('\n\n')
  .map( (monkeyRawData, monkeyIndex) => {
    
    let { monkeyId }  = [ ...monkeyRawData.matchAll( /^Monkey (?<monkeyId>.+):$/gm             ) ]?.at(0).groups
    let { items }     = [ ...monkeyRawData.matchAll( /^\s+Starting items: (?<items>.*)$/gm     ) ]?.at(0).groups
    let { ops1 }      = [ ...monkeyRawData.matchAll( /^\s+Operation: new = (?<ops1>.*)$/gm     ) ]?.at(0).groups
    let { ops2 }      = [ ...monkeyRawData.matchAll( /^\s+Test: divisible by (?<ops2>\d*)$/gm  ) ]?.at(0).groups
    let catchers      = [ ...monkeyRawData.matchAll( /^\s+If (?:true|false): throw to monkey (?<catcher>\d*)$/gm )]
      ?.map( nextMonkey => nextMonkey.groups.catcher )

    monkeys.set(monkeyId, {
      startItems  : items.split(',').map(Number),
      worryOps    : ops1.split(' '),  // step 1.1: monkey inspects item then compute worry level
      relayTest   : +ops2,            // step 2  : worry level is tested
      catchers
    })
  })

const initMonkeyItems = () => {
  monkeyItems = new Map()
  monkeyInspectCounts = new Map()
  
  monkeys.forEach( ( monkey, monkeyId ) => {
    monkeyItems.set( monkeyId, [ ...monkey.startItems ]) 
    monkeyInspectCounts.set( monkeyId, 0) 
  })
}

const simulateGame = ( maxRounds = DEFAULT_MIN_ROUNDS, isConstantReliefFactor = true ) => {
  initMonkeyItems()
  
  let maxReliefFactor = isConstantReliefFactor 
    ? DEFAULT_RELIEF_FACTOR 
    : Array.from( monkeys.values() )
      .map( monkey => monkey.relayTest)
      .reduce( (total, stress) => total * stress, 1)

  Array.from( Array(maxRounds).keys() ).forEach( round => {
    Array.from(monkeys).forEach( ([ monkeyId, monkey ]) => {
      while( monkeyItems.get(monkeyId).length ) {
        let itemValue = [ 
          monkey.worryOps,
          [ `old`, isConstantReliefFactor ? `/` : `%`, maxReliefFactor ]  // step 1.2: factor relief into worry level
        ].reduce( (worryLevel, ops) => {
          let [ op1, operation, op2 ] = ops.map( opsPart => [...`/+-*%`].includes(opsPart) 
            ? opsPart
            : opsPart === `old`   ? worryLevel : +opsPart
          )
          
          if (operation === `+`) return op1 + op2 
          if (operation === `-`) return op1 - op2 
          if (operation === `*`) return op1 * op2 
          if (operation === `/`) return Math.floor( op1 / op2 )
          if (operation === `%`) return op1 % op2
          
        }, monkeyItems.get(monkeyId).shift() )
      
        let nextMonkey = monkey.catchers.at( !!( itemValue % monkey.relayTest) )

        monkeyItems.get(nextMonkey).push( itemValue )
        monkeyInspectCounts.set( monkeyId, monkeyInspectCounts.get(monkeyId) + 1 )
      }
    })
  })
}

const calcMonkeyBizLevel = ( minRank = DEFAULT_RANK_RANGE_MIN ) => Array
  .from( monkeyInspectCounts.values() )
  .sort( (a, b) => b - a )  // sort activity tallies into descending order
  .splice(0, minRank)
  .reduce( (total, activityCount) => total * activityCount, 1)

const solveP1 = () => {
  simulateGame()
  return calcMonkeyBizLevel()
}

const solveP2 = rawInput => { 
  simulateGame( DEFAULT_MAX_ROUNDS, false )
  return calcMonkeyBizLevel()
}

console.log("AOC2022 | Day 11");
console.time("AOC2022 | Day 11")

if (rawInputData) {
  parseInput()

  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 | Day 11")