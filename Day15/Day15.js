const fs = require('fs')

const DEFAULT_ROW_REF = 2e6
const MAX_Y_COORD     = 4e6

let rawInputData
let sensors = new Map()
let beacons = new Map()

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const getDistance = ( x1, y1, x2, y2 ) => Math.abs( x1 - x2 ) + Math.abs( y1 - y2 )

const parseInput = () => {
  rawInputData
    .split(`\n`)
    .forEach( line => {
      let { x1, y1 } = [ ...line.matchAll(
        /^Sensor at x=(?<x1>([\-\+]{0,1}\d+)), y=(?<y1>([\-\+]{0,1}\d+)):.*$/mg
      )]?.at(0).groups

      let { x2, y2 } =  [...line.matchAll(
        /^.*closest beacon is at x=(?<x2>([\-\+]{0,1}\d+)), y=(?<y2>([\-\+]{0,1}\d+)).*$/mg
      )]?.at(0).groups

      let distance = getDistance( x1, y1, x2, y2 )

      beacons.set( [ x2, y2 ].join(`,`), [ x2, y2 ].map(Number))
      sensors.set( [ x1, y1 ].join(`,`), {
        coords  : [ x1, y1 ].map(Number),
        beacon  : [ x2, y2 ].map(Number),
        maxN    : +y1 - distance,
        maxE    : +x1 + distance,
        maxS    : +y1 + distance,
        maxW    : +x1 - distance
      })
    })
}

const getTuningFrequency = ( refX, refY ) => refX + refY * MAX_Y_COORD

const checkSignalCoverageGap = () => {
  let { minRowRef, maxRowRef } = Array.from( sensors.values() )
    .map(    signal => signal.coords.at(-1) )
    .reduce( (refs, signalCoordY) => ({
      minRowRef: Math.min( refs.minRowRef, signalCoordY, MAX_Y_COORD ),
      maxRowRef: Math.max( refs.maxRowRef, signalCoordY, MAX_Y_COORD ),
    }), { minRowRef: 0, maxRowRef: 0 })

  // break on initial gap from coverage 
  for ( let rowRef = minRowRef; rowRef <= maxRowRef; rowRef++ ) {
    let findings = assessRowCoverage(rowRef)

    if (!!findings?.gaps.length)      //  gap found, return tuning frequency from its location 
      return getTuningFrequency(rowRef, findings.gaps.at(0).gapStart)
  }

  return 0      //  no gap found
}

const assessRowCoverage = (rowRef = DEFAULT_ROW_REF) => {
  let findings
  let coverage = []
  let gaps     = []

  Array.from( sensors.values() )
    .forEach( signal => {
      let [ x1, y1 ] = signal.coords
      let yRadiusDirection = y1 < rowRef ? 1 : rowRef < y1 ? -1 : 0

      if (yRadiusDirection === 0) {
        coverage.push({ rangeStart: signal.maxW, rangeEnd: signal.maxE })
      } else if ( yRadiusDirection === 1 && signal.maxS > rowRef ) {         //  signal is above referenced row
        let xRadius = signal.maxS - rowRef
        coverage.push({ rangeStart: x1 - xRadius, rangeEnd: x1 + xRadius })
      } else if ( yRadiusDirection === -1 && signal.maxN < rowRef ) {        //  signal is below referenced row
        let xRadius = rowRef - signal.maxN
        coverage.push({ rangeStart: x1 - xRadius, rangeEnd: x1 + xRadius })
      }
    })

  if (!coverage.length) return findings
  
  if (coverage.length == 1) {      //  only 1 signal covering, no gaps
    findings = coverage.at(0)
  } else {
    findings = coverage
      .sort( (a, b) => a.rangeStart < b.rangeStart ? -1
        : a.rangeStart > b.rangeStart ? 1
        : a.rangeEnd < b.rangeEnd ? -1
        : a.rangeEnd > b.rangeEnd ? 1
        : 0
      ).reduce((findings, range, rangeIndex) => {
          if (  !!rangeIndex
            &&  findings.rangeEnd < range.rangeStart
            &&  Math.abs(findings.rangeEnd - range.rangeStart) > 1 
          )
            gaps.push({ 
              gapStart: findings.rangeEnd + 1, 
              gapEnd: range.rangeStart - 1 
            })
  
          return {
            rangeStart: Math.min(findings.rangeStart, range.rangeStart),
            rangeEnd: Math.max(findings.rangeEnd, range.rangeEnd),
          }
        }, { rangeStart: Infinity, rangeEnd: 0 }
      )
  }

  return {
    ...findings,
    gaps,
    beacons  :  Array.from( beacons.values() )
                  .filter(([beaconX, beaconY]) => beaconY === rowRef
                    && findings.rangeStart <= beaconX 
                    && beaconX <= findings.rangeEnd
                  ).length
  }
}

const solveP1 = () => {
  let { rangeStart = 0, rangeEnd = 0, beacons = 0 } = assessRowCoverage()
  return rangeEnd - rangeStart + 1 - beacons
}

const solveP2 = () => checkSignalCoverageGap()

console.log("AOC2022 | Day 15");
console.time("AOC2022 | Day 15")

if (rawInputData) {
  parseInput()

  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 | Day 15")