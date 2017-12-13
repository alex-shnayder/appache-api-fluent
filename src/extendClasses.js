const ExecutableCommand = require('./ExecutableCommand')
const Option = require('./Option')


const PROPS_TO_SKIP = ['id', 'name', 'aliases', 'commands', 'options']


function getAllowedPropTypes(prop) {
  if (prop.type) {
    return [].concat(prop.type)
  } else if (prop.typeof) {
    return [].concat(prop.typeof)
  } else if (prop.oneOf) {
    return prop.oneOf.reduce((types, prop) => {
      return types.concat(getAllowedPropTypes(prop))
    }, [])
  }

  return []
}

function methodArgsToValue(name, allowedTypes, args) {
  if (!allowedTypes.length) {
    return args[0]
  }

  let value = args.length ? args[0] : true
  let valueType

  if (value === null) {
    valueType = 'null'
  } else if (Array.isArray(value)) {
    valueType = 'array'
  } else {
    valueType = typeof value
  }

  if (valueType !== 'undefined' && !allowedTypes.includes(valueType)) {
    throw new Error(
      `The value of "${name}" must be of one ` +
      `of the following types: ${allowedTypes.join(', ')}`
    )
  }

  return value
}

function createMethodForProperty(name, prop) {
  let allowedTypes = getAllowedPropTypes(prop)

  return function propertyMethod(...args) {
    let value = methodArgsToValue(name, allowedTypes, args)
    this.config[name] = value
    return this
  }
}

function extendClass(Class, schema) {
  let props = schema.properties
  let ExtendedClass = class extends Class {}

  Object.keys(props).forEach((key) => {
    if (PROPS_TO_SKIP.includes(key)) {
      return
    }

    if (typeof ExtendedClass.prototype[key] !== 'undefined') {
      throw new Error(`Property "${key}" is conflicting with the API plugin`)
    }

    ExtendedClass.prototype[key] = createMethodForProperty(key, props[key])
  })

  return ExtendedClass
}

module.exports = function extendClasses(schema) {
  let commandSchema = schema.definitions.command
  let optionSchema = schema.definitions.option

  let Command = extendClass(ExecutableCommand, commandSchema)
  Command.Command = Command
  Command.Option = extendClass(Option, optionSchema)

  let commandProps = commandSchema.properties
  Command.inheritableSettings = commandProps.inheritableSettings.default
  Command.inheritableOptions = commandProps.inheritableOptions.default

  return Command
}
