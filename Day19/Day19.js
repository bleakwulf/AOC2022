const fs = require('fs')

const DEFAULT_DURATION = 24		//	minutes
const RESOURCE_TYPE = {
	ORE       : 0,
	CLAY      : 1,
	OBSIDIAN  : 2, 
	GEODE     : 3
}

let rawInputData, blueprints
let doCustomLog = true  // for debugging

try {
  //rawInputData = fs.readFileSync(`${__dirname}/Day19/input.txt`, 'utf8')
  rawInputData = fs.readFileSync(`${__dirname}/Day19/demo.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const customLog = message => {
  if (doCustomLog) console.log(message)
}

const parseInput = () => {
	blueprints = rawInputData
		.split(`\n`)
		.map( inputLine => {
			let { id }     = [ ...inputLine.matchAll(/^Blueprint (?<id>(\d+)): .*$/gm) 						        ]?.at(0).groups || {}
			let { cost1 }  = [ ...inputLine.matchAll(/^.*Each ore robot costs (?<cost1>(\d+)) ore.*$/gm)	]?.at(0).groups	|| {}
			let { cost2 }  = [ ...inputLine.matchAll(/^.*Each clay robot costs (?<cost2>(\d+)) ore.*$/gm)	]?.at(0).groups	|| {}
			let { cost3A, cost3B }  = [ ...inputLine.matchAll(
				/^.*Each obsidian robot costs (?<cost3A>(\d+)) ore and (?<cost3B>(\d+)) clay.*$/gm
			)]?.at(0).groups || {}
			let { cost4A, cost4B }  = [ ...inputLine.matchAll(
				/^.*Each geode robot costs (?<cost4A>(\d+)) ore and (?<cost4B>(\d+)) obsidian.*$/gm
			)]?.at(0).groups || {}

			return { id: +id, costs: [ +cost1, +cost2 , +cost3A, +cost3B, +cost4A, +cost4B ] }
		})
  
		customLog(blueprints) 
	}

const simulateGeodeCracking = ( blueprint, duration = DEFAULT_DURATION ) => {
	// init resources
	
	let resources = new Map([
		[ RESOURCE_TYPE.ORE       , 0 ],
		[ RESOURCE_TYPE.CLAY      , 0 ],
		[ RESOURCE_TYPE.OBSIDIAN  , 0 ],
		[ RESOURCE_TYPE.GEODE     , 0 ] 
	])
	
	let robots = [ 1, 0, 0, 0 ]	// ore, clay, obsidian, and geode collector robots respectively
	
	let timer = 0
	
	while( timer <= duration ) {
		robots = robots.map( robot => !!robot ? robot++ : robot )
    console.log(robots)
    timer++
	}

  customLog(robots)
  
}

const solveP1 = () => {
  simulateGeodeCracking(blueprints[0])
}

const solveP2 = () => { }

console.log("AOC2022 | Day 19");
console.time("AOC2022 | Day 19")

if (rawInputData) {
  parseInput()

  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}