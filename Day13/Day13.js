const fs = require('fs')

const SORT_VALUE = {
  ASCENDING   : -1,
  EQUAL       :  0, 
  DESCENDING  :  1
}

const DIVIDER_PACKETS = `[[2]]
[[6]]`

let rawInputData, inputData

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const parseInput = () => {
  inputData = rawInputData
    .split(`\n\n`)
    .map( pair => pair.split(`\n`))
}

const checkSortOrder = ( dataA, dataB ) =>  {
  if ( dataA === undefined && ( dataB !== undefined || Array.isArray(dataB) ) ) return SORT_VALUE.ASCENDING
  if ( dataB === undefined && ( dataA !== undefined || Array.isArray(dataA) ) ) return SORT_VALUE.DESCENDING

  if ( Array.isArray( dataA ) || Array.isArray( dataB ) ) {
    return checkListItems( 
      Array.isArray( dataA )  ? dataA  : Array.of( dataA ), 
      Array.isArray( dataB )  ? dataB  : Array.of( dataB )
    )
  }

  return  dataA < dataB ? SORT_VALUE.ASCENDING 
    :     dataA > dataB ? SORT_VALUE.DESCENDING 
    :     SORT_VALUE.EQUAL
}

const checkListItems = ( groupA, groupB ) => {
  if ( !groupA.length && groupB.length ) return SORT_VALUE.ASCENDING
  if ( !groupB.length && groupA.length ) return SORT_VALUE.DESCENDING
  
  let maxLength      = Math.max( groupA.length, groupB.length ) - 1
  let lastSortValue  = SORT_VALUE.EQUAL
  
  for ( let i = 0; i <= maxLength; i++ ) {
    lastSortValue = checkSortOrder( groupA.at(i), groupB.at(i) )
    if ( lastSortValue !== SORT_VALUE.EQUAL ) break
  }

  return lastSortValue
}

const solveP1 = () => inputData
  .map( ( pair, pairIndex ) => {
    let [ half1, half2 ] = pair.map( half => JSON.parse(half))
    return { pairIndex: pairIndex + 1, findings: checkSortOrder( half1, half2) }
  }).reduce( ( score, result ) => {
    if ( result.findings !== SORT_VALUE.DESCENDING  ) score += result.pairIndex
    return score
  }, 0)

const solveP2 = () => {
  let sortedPackets = inputData
    .concat( DIVIDER_PACKETS.split(`\n`) )
    .flat()
    .map(  packet    => JSON.parse( packet ) )
    .sort( ( a, b )  => checkSortOrder( a, b ) )
    .map(  packet    => JSON.stringify( packet ) )
    
  return DIVIDER_PACKETS
    .split(`\n`)
    .reduce( ( decoderKey, dividerPacket ) => decoderKey * ( sortedPackets.indexOf( dividerPacket ) + 1 ), 1 )
}

console.log("AOC2022 | Day 13");
console.time("AOC2022 | Day 13")

if (rawInputData) {
  parseInput()
  
  console.log(`P1 : ${ solveP1() }`)
  console.log(`P2 : ${ solveP2() }`)
}

console.timeEnd("AOC2022 | Day 13")