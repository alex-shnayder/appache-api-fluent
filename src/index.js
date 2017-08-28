const { next, hook } = require('appache/effects')
const extendClasses = require('./extendClasses')
const buildConfig = require('./buildConfig')


module.exports = function* apiPlugin(lifecycle) {
  yield hook('init', function* (schema, api) {
    if (api) {
      // eslint-disable-next-line
      console.warn(
        'The default API plugin is overriding another plugin\'s modifications. ' +
        'Either change the order of the plugins, or disable the default one'
      )
    }

    let Command = extendClasses(schema)
    let createCommand = (name, description) => {
      let command = new Command(name, description)
      command.lifecycle = lifecycle

      lifecycle.hookStart('config', function* (schema) {
        let config = buildConfig(command, true)
        return yield next(schema, config)
      })

      return command
    }

    return yield next(schema, createCommand)
  })
}
