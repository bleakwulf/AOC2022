const fs = require('fs')

const DEFAULT_MAX_ELASTICITY_UNIT  = 2
const DEFAULT_MIN_KNOTS  = 2
const DEFAULT_MAX_KNOTS  = 10

const directionMultipliers = new Map([
  [ `U`, [  0,  1 ] ],
  [ `D`, [  0, -1 ] ],
  [ `L`, [ -1,  0 ] ],
  [ `R`, [  1,  0 ] ]
])

let rawInputData, inputData

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const parseHeadMoves = () => {
  inputData = rawInputData
    .split('\n')
    .map(move => {
      let [direction, unit] = move.split(' ')
      return directionMultipliers.get(direction)
        .map(coordinate => coordinate * +unit)
    })
}

const performMoves = ( knotCount = DEFAULT_MIN_KNOTS ) => {
  let knots = Array.from( { length: knotCount }, () => [ 0, 0 ] )

  let coveredPoints = new Set()
  coveredPoints.add(`0,0`)  // add starting point

  inputData.forEach( refMove => {
    let [ xMove, yMove ] = refMove
    let increment = ( xMove || yMove ) < 0 ? -1 : +( !!xMove || !!yMove )
    let iteration = 0

    while ( iteration !== (xMove || yMove) ) {
      let [ [ xHeadCoord, yHeadCoord ], ...body ] = knots
      let newBody = []

      xHeadCoord += !!xMove ? increment : 0
      yHeadCoord += !!yMove ? increment : 0

      iteration += increment

      body.forEach( (bodyUnit, bodyIndex) => {
        let [lastXCoord = xHeadCoord, lastYCoord = yHeadCoord ] = newBody.at( bodyIndex - 1 ) ?? [] 

        let knotGaps = bodyUnit.map(
            (unitCoord, coordIndex) => (coordIndex === 0 ? lastXCoord : lastYCoord) - unitCoord
          )

        if ( knotGaps.some( gap => Math.abs(gap) === DEFAULT_MAX_ELASTICITY_UNIT ) ) {
          let [ unitCoordX, unitCoordY ] = bodyUnit
          let [ xGap, yGap ] = knotGaps

          bodyUnit = [
            !xGap ? unitCoordX : unitCoordX + xGap / Math.abs(xGap),
            !yGap ? unitCoordY : unitCoordY + yGap / Math.abs(yGap),
          ]

          if (bodyIndex === body.length - 1) // end of tail has moved
            coveredPoints.add(bodyUnit.join(`,`))
        }

        newBody.push(bodyUnit)
      })

      knots = [ [ xHeadCoord, yHeadCoord ], ...newBody]
    }
  })

  return coveredPoints.size
}

const solveP1 = () => performMoves()

const solveP2 = () => performMoves(DEFAULT_MAX_KNOTS)

console.log("AOC2022 | Day 09")
console.time("AOC2022 | Day 09")

if (rawInputData) {
  parseHeadMoves()
  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 | Day 09")