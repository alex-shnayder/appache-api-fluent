const { mergeConfigs } = require('appache/common')
const createRootCommandClass = require('./createRootCommandClass')
const extendClasses = require('./extendClasses')
const buildConfig = require('./buildConfig')


module.exports = function createApiFunction(lifecycle, schema) {
  let Command = extendClasses(schema)
  let RootCommand = createRootCommandClass(Command)
  let rootCommands = []

  function createRootCommand(name, description) {
    let command = new RootCommand(lifecycle, name, description)
    rootCommands.push(command)
    return command
  }

  lifecycle.preHookStart({
    event: 'configure',
    tags: ['modifyConfig', 'createCommandConfig', 'createOptionConfig'],
  }, (schema, config = {}) => {
    rootCommands.forEach((command) => {
      let commandConfig = buildConfig(command)
      config = mergeConfigs(config, commandConfig)

      if (command.config.default) {
        config.defaultCommand = command.config.name
      }
    })

    if (!config.defaultCommand && rootCommands.length === 1) {
      config.defaultCommand = rootCommands[0].config.name
    }

    return [schema, config]
  })

  return createRootCommand
}
