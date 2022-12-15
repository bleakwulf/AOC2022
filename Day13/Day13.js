const fs = require('fs')

let rawInputData, inputData
let doCustomLog = true

try {
  //rawInputData = fs.readFileSync(`${__dirname}/Day13/input.txt`, 'utf8')
  rawInputData = fs.readFileSync(`${__dirname}/Day13/demo.txt`, 'utf8')
  //rawInputData = fs.readFileSync(`${__dirname}/Day13/test.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const customLog = msg => {
  if (doCustomLog) console.log(msg)
}

const parseInput = () => {
  inputData = rawInputData
    //.replace(/\[\]/g, `[*]`)
    //.replace(/,/g, `|`)
    .split(`\n\n`)
    .map( pair => pair.split(`\n`))
}

const isSorted = ( set1, set2 ) => {

/*  if ( set1 === undefined) return false
  if ( set2 === undefined) return false */
  let maxIndex = Math.max( set1?.length - 1 || 0, set2?.length - 1 || 0)
  customLog(`maxIndex : ${maxIndex}`)
  
  for( i = 0; i <= maxIndex; i++) {
    customLog()
    customLog(`BEGIN --> i : ${i} vs maxIndex: ${maxIndex}`)
    customLog(`============================================================`)
    customLog(`STATS item1: `)
    customLog(`\titem1 === undefined : ${set1[i] === undefined}`)
    customLog(`\tisNaN(item1) : ${isNaN(set1[i] )}`)
    customLog(`\tArray.isArray(item1) : ${Array.isArray(set1[i] )}`)
    customLog(`STATS item2: `)
    customLog(`\titem2 === undefined : ${set2[i]  === undefined}`)
    customLog(`\tisNaN(item2) : ${isNaN(set2[i])}`)
    customLog(`\tArray.isArray(item2) : ${Array.isArray(set2[i])}`)

    //if ( Array.isArray( set1 ) && set2 === undefined ) return false
    
    let item1 = set1[i]
    let item2 = set2[i]
    let isArrayCompare = false
    let preTermRight = (set2?.length || 0) < (set1?.length || 0)
    
    if (Array.isArray( item1 ) && !Array.isArray( item2 ) && !isNaN(item2) ) {  
      customLog(`------------------------------------------------------------`)
      customLog(`preprocess A`)
      isArrayCompare = true
      item2 = [ item2 ]
    } else if ( Array.isArray( item2 ) && !Array.isArray( item1 ) && !isNaN(item1) ) { 
      customLog(`------------------------------------------------------------`)
      customLog(`preprocess B`)
      isArrayCompare = true
      item1 = [ item1 ]
    } else 
      isArrayCompare = Array.isArray( item1 ) && Array.isArray(item2) 

    customLog(`------------------------------------------------------------`)
    customLog(`pretermRight: ${preTermRight} | isArrayCompare: ${isArrayCompare}`)
    customLog(item1)
    customLog(item2)

    //continue
    
    if ( isArrayCompare && !item1.length && !!item2.length 
//        && i === set1.length - 1
    ) {
      customLog(`\t\tpassed at 1A.1`)
      return true
    } else if ( isArrayCompare && !!item1.length && !item2.length ) {
      customLog(`\t\tfailed at 1A.2`)
      return false
/*    } else if ( isArrayCompare && !!item1.length && !!item2.length && i === maxIndex ) {
      customLog(`\t\t\t * further list check`)
      return isSorted( item1, item2 ) */
    } else if ( isArrayCompare && !!item1.length && !!item2.length ) {
      let isSortChecked = isSorted( item1, item2 )
      
      customLog(`\t\t\t\ti : ${i} vs maxIndex: ${maxIndex}`)
      customLog(`\t\t\t\ti : isSorted: ${isSortChecked}`)
      
      if (i === maxIndex || (preTermRight && i === set2.length - 1)) {
        customLog(`\t\t\t * end of further list check`)
        customLog(`**********************************************************************`)
        return isSortChecked
      } else if (!isSortChecked) { 
        customLog(`\t\tfailed at 2A`)
        return false
      }
    } else if ( !isArrayCompare && !isNaN(item1) && isNaN(item2)  ) {
      customLog(`\t\tfailed at 2B`)
      return false
    } else if ( !isArrayCompare &&  item1 < item2 && preTermRight && i === set2.length - 1 ) {
      customLog(`\t\tpassed at 3B`)
      return true
    } else if ( !isArrayCompare &&  item1 === item2 && preTermRight && i === set2.length - 1 ) {
      customLog(`\t\tfailed at 3C`)
      return false
    } else if ( !isArrayCompare &&  item1 > item2 ) {
      customLog(`\t\tfail at 3A`)
      return false
    }
    customLog(`END -> i : ${i} vs maxIndex: ${maxIndex}`)

    //if(i === 2 && maxIndex === 4) break
  }
  
  return true
}

const solveP1 = () => {
  return inputData
/* // solution
    .reduce( ( score, pair, pairIndex ) => {
      let [ half1, half2 ] = pair.map( half => JSON.parse(half))
      if ( isSorted( half1, half2) ) score += pairIndex + 1
      
      return score
    }, 0) */ 
    //.slice(84,85)
    //.slice(147, 148)
    //.slice(6, 7)
    .map( ( pair, pairIndex ) => {
      console.log(`pairIndex: ${pairIndex}`)
      let [ half1, half2 ] = pair.map( half => JSON.parse(half))
      
      customLog(half1)
      customLog(half2)
      
      let ret =  { pairIndex: pairIndex + 1, findings: isSorted( half1, half2) }
      customLog(ret)
      return ret 
    })
    .reduce( ( score, result ) => {
      if ( result.findings ) score += result.pairIndex
      return score
    }, 0) 
    
}

const solveP2 = rawInput => { }

console.log("AOC2022 | Day 13");
console.time("AOC2022 | Day 13")

if (rawInputData) {
  parseInput()
  
  //console.log(`P1 : ${solveP1(inputData)}`)
  console.table(solveP1(inputData))
  //customLog(`P2 : ${solveP2(inputData)}`)
}

console.timeEnd("AOC2022 | Day 13")

/*
  P1: 6079 // too low
      6814
*/