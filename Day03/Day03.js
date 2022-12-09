const fs = require('fs')

console.log("AOC2022 | Day 03")
console.time("AOC2022 D03")

const ELF_GROUP_SIZE_DEFAULT = 3
let prioMatrix = new Map()

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const buildPrioMatrix = () => {
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    .split('')
    .forEach((item, index) => prioMatrix.set(item, index + 1))
}

const solveP1 = inputData => { 
  let allPackages = inputData
    .map( packagePair => {
      let midPoint = packagePair.length / 2
      return [
        packagePair.slice(0, midPoint).split(''),
        packagePair.slice(0 - midPoint).split('')
      ]
    })
  
  let prioList = []
  
  for( let pairIndex = 0; pairIndex < allPackages.length; pairIndex++ ) {
    let [ firstHalf, secondHalf ] = allPackages[pairIndex]
    for( let i = 0; i < firstHalf.length; i++ ) {
      if (secondHalf.includes(firstHalf[i])) {
        prioList.push(prioMatrix.get(firstHalf[i]))
        break
      }
    }
  }

  return prioList.reduce((result, current) => result + current, 0)
}

const solveP2 = ( inputData, elfGroupSize = ELF_GROUP_SIZE_DEFAULT) => { 
  let prioList = []

  while (inputData.length) {
    let [ elf1Pack, ...otherElfPacks ] = inputData.splice(0, elfGroupSize)
    for( let i = 0; i < elf1Pack.length; i++ ) {
      let isBadgeFound = otherElfPacks
        .map( elfPack => !!elfPack.match(elf1Pack[i]) )
        .reduce((result, current) => result && current, true)
      
      if (isBadgeFound) {
        prioList.push(prioMatrix.get(elf1Pack[i]))
        break
      }
    }
  }
  
  return prioList.reduce((result, current) => result + current, 0)
}

if (rawInputData) {

  let inputData = rawInputData.split('\n')

  buildPrioMatrix()
  
  console.log(`P1 :`)
  console.log(solveP1(inputData))

  console.log(`P2 :`)
  console.log(solveP2(inputData))
}

console.timeEnd("AOC2022 D03")