const fs = require('fs')

const HAND_THROWS = {
  STONE     : 1,
  PAPER     : 2, 
  SCISSORS  : 3
}

const THROW_VALUES = new Map([
  [ `A`, HAND_THROWS.STONE     ], 
  [ `B`, HAND_THROWS.PAPER     ], 
  [ `C`, HAND_THROWS.SCISSORS  ],
  [ `X`, HAND_THROWS.STONE     ], 
  [ `Y`, HAND_THROWS.PAPER     ], 
  [ `Z`, HAND_THROWS.SCISSORS  ]
])

const MATCH_RESULTS = {
  WIN   : { score: 6, strategyAlias: `Z` },
  DRAW  : { score: 3, strategyAlias: `Y` },
  LOSE  : { score: 0, strategyAlias: `X` }
}

let MATCH_MATRIX = new Map([
  [ `${ HAND_THROWS.STONE 	 }${ HAND_THROWS.STONE 	  }`, MATCH_RESULTS.DRAW  ],
  [ `${ HAND_THROWS.STONE 	 }${ HAND_THROWS.PAPER 	  }`, MATCH_RESULTS.WIN   ],
  [ `${ HAND_THROWS.STONE 	 }${ HAND_THROWS.SCISSORS }`, MATCH_RESULTS.LOSE  ],
  [ `${ HAND_THROWS.PAPER 	 }${ HAND_THROWS.STONE 	  }`, MATCH_RESULTS.LOSE  ],
  [ `${ HAND_THROWS.PAPER 	 }${ HAND_THROWS.PAPER 	  }`, MATCH_RESULTS.DRAW  ],
  [ `${ HAND_THROWS.PAPER 	 }${ HAND_THROWS.SCISSORS }`, MATCH_RESULTS.WIN   ],
  [ `${ HAND_THROWS.SCISSORS }${ HAND_THROWS.STONE 	  }`, MATCH_RESULTS.WIN   ],
  [ `${ HAND_THROWS.SCISSORS }${ HAND_THROWS.PAPER 	  }`, MATCH_RESULTS.LOSE  ],
  [ `${ HAND_THROWS.SCISSORS }${ HAND_THROWS.SCISSORS }`, MATCH_RESULTS.DRAW  ] 
])

let rawInputData, inputData

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const parseInput = () => {
  inputData = rawInputData
    .split('\n')
    .map( throwPair => throwPair.split(' ') )
}

const getStrategyMatrix = () => Array.from( MATCH_MATRIX )
  .reduce( ( strategyMatrix, [ matchPair, scoreData ] ) => {
    let [ enemyThrow, myThrow ] = matchPair.split('').map(Number)
    let strategies = strategyMatrix?.get( enemyThrow ) ?? {}
    return strategyMatrix.set( enemyThrow, { ...strategies, [scoreData.strategyAlias]: myThrow } )
  }, new Map() )

const solveP1 = () => inputData
    .map( matchPair => {
      let parsedThrow = matchPair
          .map( handThrow => THROW_VALUES.get(handThrow) )
      
      let myThrow = parsedThrow.at(-1)
      let { score } = MATCH_MATRIX.get( parsedThrow.join('') )
      
      return myThrow + score
    }).reduce( (totalScore, matchScore) => totalScore + matchScore, 0)

const solveP2 = () => {
  let refMatrix = getStrategyMatrix()
  
  return inputData
    .map( matchPair => {
      let [ enemyThrow, strategy ] = matchPair
      let enemyThrowValue = THROW_VALUES.get(enemyThrow)
      let myThrowScore = refMatrix.get( enemyThrowValue )[ strategy ]
      let { score } = MATCH_MATRIX.get( `${enemyThrowValue}${myThrowScore}` )
      
      return myThrowScore + score 
    }).reduce( (totalScore, matchScore) => totalScore + matchScore, 0)
}

console.log("AOC2022 | Day 02")
console.time("AOC2022 | Day 02")

if (rawInputData) {
  parseInput()
  
  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 | Day 02")