const ExecutableCommand = require('./ExecutableCommand')
const Option = require('./Option')


const PROPS_TO_SKIP = ['id', 'name', 'aliases', 'commands', 'options']


function createMethod(name, prop) {
  let isArray = (
    prop.type === 'array' ||
    (Array.isArray(prop.type) && prop.type.includes('array'))
  )

  if (isArray) {
    return function arrayProperty(...value) {
      value = value.length ? value : undefined
      this.config[name] = value
      return this
    }
  }

  let isBoolean = (
    !isArray && (
      prop.type === 'boolean' || typeof prop.typeof === 'boolean' ||
      (Array.isArray(prop.type) && prop.type.includes('boolean')) ||
      (Array.isArray(prop.typeof) && prop.typeof.includes('boolean'))
    )
  )

  if (isBoolean) {
    return function booleanProperty(value) {
      value = (arguments.length === 0) ? true : value
      this.config[name] = value
      return this
    }
  }

  return function genericProperty(value) {
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

    ExtendedClass.prototype[key] = createMethod(key, props[key])
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
