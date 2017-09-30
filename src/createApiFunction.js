const { next } = require('appache/effects')
const extendClasses = require('./extendClasses')
const buildConfig = require('./buildConfig')


function createApiFunction(lifecycle, schema) {
  let Command = extendClasses(schema)

  function createCommand(name, description) {
    let command = new Command(name, description)
    command.lifecycle = lifecycle

    lifecycle.preHookStart('config', (schema) => {
      let config = buildConfig(command, true)
      return [schema, config]
    })

    return command
  }

  createCommand.start = () => {
    try {
      return lifecycle.toot('start')
    } catch (err) {
      lifecycle.toot('error', err)
    }
  }

  createCommand.catch = (handler) => {
    lifecycle.hook('error', function* (_, ...args) {
      let result = yield handler(...args)
      return result ? result : yield next(_, ...args)
    })
    return this
  }

  return createCommand
}

module.exports = createApiFunction
