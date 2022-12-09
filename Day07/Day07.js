const fs = require('fs')

const TOTAL_DISK_SPACE = 70000000
const REQ_FREE_DISK_SPACE = 30000000
const DIRECTORY_MAX_SIZE_THRESHOLD = 100000

let rawInputData, inputData
let directory = new Map() 
let allFiles = []

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const parseRawData = () => {
  let folders = [ `.` ]
  directory.set(`.`, { parent: null, size: 0, depth: 0 })
  inputData = rawInputData.split('\n')
  
  while (inputData.length) {
    let [ arg1, arg2, arg3] = inputData.shift().split(' ')
        
    if ( arg1 === `$` && arg2 === `cd`) {
      switch( arg3 ) {
        case `/`: 
          folders.splice(1)
          break

        case `..`:
          folders.pop()
          break

        default:
          folders.push(arg3)
          break
      }
    } else if ( arg1 !== `$`) {
      let fullPath = folders.join(`/`)
      let parentPath = folders.slice(0, -1).join(`/`) || null
      let depth = folders.length
      
      if (arg1 === `dir`) 
        directory.set(`${fullPath}/${arg2}`, { parent: fullPath, size: 0, depth })
      else 
        allFiles.push({ fullPath, filename: arg2, size: +arg1 })
    }
  }
}

const calcFolderSizes = () => {
  Array.from(
    allFiles.reduce((folders, file) => {
      folders.set(file.fullPath, file.size + (folders.get(file.fullPath) ?? 0))  
        return folders
      }, new Map()
    )
  ).forEach( ([folder, size]) => {
    directory.get(folder).size += size
  })
  
  Array.from(directory.values())
    .sort( (a, b) => b.depth - a.depth)
    .forEach(folder => {
      if (folder.parent)
        directory.get(folder.parent).size += folder.size
    })
}

const solveP1 = (sizeThreshold = DIRECTORY_MAX_SIZE_THRESHOLD) => {
  return Array.from(directory.values())
    .filter(folder => folder.size <= sizeThreshold)
    .reduce((totalSize, folder) => totalSize + folder.size, 0)
}

const solveP2 = () => {
  let reqFreeSpace = REQ_FREE_DISK_SPACE - (TOTAL_DISK_SPACE - directory.get(`.`).size)
  
  return Array.from(directory.values())
    .filter(folder => folder.size >= reqFreeSpace)
    .sort( (a, b) => a.size - b.size)
    .at(0)
    .size
}

console.log("AOC2022 | Day 07")
console.time("AOC2022 | Day 07")

if (rawInputData) {
  parseRawData()
  calcFolderSizes()
  
  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 | Day 07")