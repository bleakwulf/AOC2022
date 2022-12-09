const fs = require('fs')

let rawInputData, inputData
let LOCATION_STATS = {}

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const assessTree = ( refTreeHeight, rowIndex, colIndex ) => {
  return [
      // verticals (i.e., all trees North, all trees South)
      inputData
        .reduce( (allTreesInY, treeRow, yIndex) => allTreesInY + ( yIndex === rowIndex ? `,` : treeRow.at(colIndex) ), '' ), 
      // horizontals (i.e., all trees West, all trees East)
      inputData.at(rowIndex)
        .reduce( (allTreesInX, xTree, xIndex) => allTreesInX + ( xIndex === colIndex ? `,` : xTree), '' )
    ].map( treeSequence => treeSequence
      .split(`,`)
      .map( (direction, halfIndex) => halfIndex === 0 
        ? direction.split('').reverse() // reverse sequence of trees from North and West
        : direction.split('')
      )
    ).flat()
    .map( direction => {
      let viewLimit = direction.findIndex( tree => tree >= refTreeHeight )
      return { 
        isVisible: viewLimit < 0,
        scenicScore: viewLimit < 0 ? direction.length : viewLimit + 1
      }
    }).reduce( (findings, stats) => ({
      isVisible  : stats.isVisible || ( findings.isVisible ?? false ),
      scenicScore: stats.scenicScore * ( findings.scenicScore ?? 1 )
    }), {} ) 
}

const assessLocation = () => {
  LOCATION_STATS = { 
    ...LOCATION_STATS,        
    maxHeight : inputData.length, 
    maxWidth  : inputData.at(0).length
  }
  
  let visibleTreesCount = (LOCATION_STATS.maxHeight * 2) + (LOCATION_STATS.maxWidth - 2) * 2
  let maxScenicScore = 0

  inputData.forEach( ( gridRow, gridRowIndex ) => {
    gridRow.forEach( ( treeHeight, gridColumnIndex ) => {
      if ( ![ 0, LOCATION_STATS.maxWidth  - 1].includes(gridRowIndex)
        && ![ 0, LOCATION_STATS.maxHeight - 1].includes(gridColumnIndex) 
      ) {
        let { isVisible, scenicScore } = assessTree( treeHeight, gridRowIndex, gridColumnIndex )
        
        if (isVisible) visibleTreesCount++
        
        maxScenicScore = Math.max(scenicScore, maxScenicScore)
      }
    })
  })

  LOCATION_STATS = { ...LOCATION_STATS, visibleTreesCount, maxScenicScore }
}

const solveP1 = () => {
  return LOCATION_STATS.visibleTreesCount
}

const solveP2 = () => {
  return LOCATION_STATS.maxScenicScore
}

console.log("AOC2022 | Day 08")
console.time("AOC2022 | Day 08")

if (rawInputData) {
  inputData = rawInputData
    .split('\n')
    .map( row => row
      .split('')
      .map(tree => +tree)
    )

  assessLocation()
  
  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 | Day 08")