const fs = require('fs')

const MATH_OPERATION = {
  ADD       : `+`,
  SUBTRACT  : `-`,
  MULTIPLY  : `*`,
  DIVIDE    : `/`
}

const DELIMITERS = {
  OPENING  : `(`,
  CLOSING  : `)`
}

let ROOT_MONKEY_ID  = `root`
let HUMAN_ID        = `humn`

let rawInputData, inputData
let formulaRefs = new Map()
let valueRefs   = new Map()

try {
  rawInputData = fs.readFileSync(`${__dirname}/input.txt`, 'utf8')
} catch (e) {
  console.log(`Error!`)
  console.error(e)
}

const solveValue = ( ops, val1, val2) => ops === MATH_OPERATION.ADD ? val1 + val2
  : ops === MATH_OPERATION.SUBTRACT  ? val1 - val2
  : ops === MATH_OPERATION.MULTIPLY  ? val1 * val2
  : ops === MATH_OPERATION.DIVIDE    ? val1 / val2
  : null

const initRefs = () => {
  formulaRefs = new Map()
  valueRefs   = new Map()
  
  Array.from(      //   get formulae 
    rawInputData.matchAll( /^(?<id>(\w+)): (?<op1>(\w+)) (?<ops>([\*\+\-\/]{1,})) (?<op2>(\w+))$/gm ), 
    ( match ) => formulaRefs.set( match.groups.id, { ...match.groups } )
  )

  Array.from(      //  get values
    rawInputData.matchAll( /^(?<id>(\w+)): (?<value>(\d+))$/gm ),
    ( match ) => {
      let { id, value } = match.groups
      valueRefs.set( id, +value )
    }
  )
}

const interpret = (formulae, checkId) => {
  while (formulae.length) {
    let formula = formulae.shift(0)
    let [ val1, val2 ] = [ formula.op1, formula.op2 ]
      .map( operand => {
        if (!isNaN(operand)) return operand
        let value = valueRefs.get(operand)
        return (!!value) ? value : operand
      })
    
    if (isNaN(val1) || isNaN(val2)) {
      formula.op1 = val1
      formula.op2 = val2
      formulae.push(formula)
      continue
    }

    let value = solveValue(formula.ops, val1, val2)

    valueRefs.set(formula.id, value)
    
    if (formula.id === checkId) return value
  }

  return undefined
}

const simplfyFormula = formula => {
  let calcMatch = formula.match(/(\()(\d{1,}) ([\+\-\*\/]) (\d{1,})(\))/g)
  
  while( !!calcMatch?.length ) {
    calcMatch.forEach( match => {
      let {  op1, ops, op2 } = match.match(/(?<op1>\d{1,}) (?<ops>[\+\-\*\/]) (?<op2>\d{1,})/)?.groups
      formula = formula.replace(match, `${solveValue( ops, +op1, +op2 )}`)
    }) 
    calcMatch = formula.match(/(\()(\d{1,}) ([\+\-\*\/]) (\d{1,})(\))/g)
  }

  return formula
}

const deriveValue = ( endValue, formula, checkId ) => {
  let value = endValue
  
  do {
    let ops, operand, op1, op2 
    let hasOp2 = false
    
    formula = formula.substring(1, formula.length - 1)
    
    if (formula.indexOf( DELIMITERS.OPENING ) < 0) {
      [ op1, ops, op2 ] = formula.trim().split(` `)
      operand = op1 === checkId ? +op2 : +op1
      hasOp2 = operand === +op2 && ( ops === MATH_OPERATION.DIVIDE || ops === MATH_OPERATION.SUBTRACT )
    } else if (formula.indexOf( DELIMITERS.OPENING ) === 0) {
      [ ops, operand ] = formula.substring(formula.lastIndexOf( DELIMITERS.CLOSING ) + 1 ).trim().split(` `)
      formula = formula.substring(0, formula.lastIndexOf( DELIMITERS.CLOSING ) + 1)
      hasOp2 = ops === MATH_OPERATION.DIVIDE || ops === MATH_OPERATION.SUBTRACT
    } else {
      [ operand, ops ] = formula.substring(0, formula.indexOf( DELIMITERS.OPENING ) - 1 ).trim().split(` `)
      formula = formula.substring(formula.indexOf( DELIMITERS.OPENING ))
    }
    
    value = ops === MATH_OPERATION.ADD              ? solveValue( MATH_OPERATION.SUBTRACT  , value     , +operand )
      : ops === MATH_OPERATION.SUBTRACT && hasOp2   ? solveValue( MATH_OPERATION.ADD       , value     , +operand )
      : ops === MATH_OPERATION.SUBTRACT && !hasOp2  ? solveValue( MATH_OPERATION.SUBTRACT  , +operand  , value )
      : ops === MATH_OPERATION.MULTIPLY             ? solveValue( MATH_OPERATION.DIVIDE    , value     , +operand )
      : ops === MATH_OPERATION.DIVIDE && hasOp2     ? solveValue( MATH_OPERATION.MULTIPLY  , value     , +operand )
      : ops === MATH_OPERATION.DIVIDE && !hasOp2    ? solveValue( MATH_OPERATION.DIVIDE    , +operand  , value )
      : null
    
  } while (formula.indexOf( DELIMITERS.OPENING ) >= 0 )

  return value
}

const getStats = ( headId, checkId ) => {
  let hasCheckId = false
  let formulae = []
  
  let checked = new Set()
  let unchecked = [ headId ]

  while ( unchecked.length ) {
    let currentOp = unchecked.shift()

    if (checked.has(currentOp)) continue
    
    let currentOpFormula = formulaRefs.get(currentOp)
    if (!currentOpFormula) {
      checked.add(currentOp)
      continue
    }
    
    let { op1, op2 } = currentOpFormula
    if ([ op1, op2 ].includes(checkId)) hasCheckId = true

    checked.add(currentOp)

    if ( valueRefs.has(op1) && valueRefs.has(op2) ) {
      let value = solveValue( currentOpFormula.ops, valueRefs.get(op1), valueRefs.get(op2))
      valueRefs.set( currentOpFormula.id, value)
    } else formulae.push(currentOpFormula)
    
    unchecked.push( op1, op2 )
  }

  return { headId, hasCheckId, formulae }
}

const findValue = (formulae, checkId = HUMAN_ID) => {
  let formulaText, finalAnswer

  // build full formula
  while (formulae.length) {
    let formula = formulae.shift()
    
    finalAnswer = finalAnswer ?? valueRefs.get(formula.id)
    formulaText = formulaText ?? formula.id
    
    let [ val1, val2 ] = [ formula.op1, formula.op2 ]
      .map( operand => {
        if (!isNaN(operand)) return operand
        let value = valueRefs.get(operand)
        return (!!value) ? value : operand
      })

    if ( !isNaN(val1) && !isNaN(val2) ) {
      formulaText = formulaText.replace( formula.id, solveValue( formula.ops, val1, val2) )
    } else {
      formulaUpdate = `${DELIMITERS.OPENING}${ [ val1, formula.ops, val2 ].join(` `) }${DELIMITERS.CLOSING}`
      formulaText = formulaText.replace( formula.id, formulaUpdate )
    }
  }
  
  formulaText = simplfyFormula(formulaText)
  
  return deriveValue( finalAnswer, formulaText, checkId )
}

const solveP1 = () => {
  initRefs()
  return interpret( Array.from( formulaRefs.values() ), ROOT_MONKEY_ID )
}

const solveP2 = () => { 
  initRefs()
  valueRefs.delete(HUMAN_ID)
  
  let { op1: finalOp1, op2: finalOp2 } = formulaRefs.get( ROOT_MONKEY_ID )
  
  let [ op1Stats, op2Stats ] = Array.of( finalOp1, finalOp2 ).map( operand => getStats( operand, HUMAN_ID ) )

  if (!!op1Stats.hasCheckId) [ op1Stats, op2Stats ] = [ op2Stats, op1Stats ]
    
  let endValue = interpret(op1Stats.formulae, op1Stats.headId)
  valueRefs.set( op2Stats.headId, endValue)
  
  let resultVal = findValue(op2Stats.formulae, HUMAN_ID)
  return resultVal
}

console.log("AOC2022 | Day 21");
console.time("AOC2022 | Day 21")

if (rawInputData) {
  console.log(`P1 : ${solveP1()}`)
  console.log(`P2 : ${solveP2()}`)
}

console.timeEnd("AOC2022 | Day 21")