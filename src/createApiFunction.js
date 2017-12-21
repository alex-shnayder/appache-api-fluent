const { mergeConfigs } = require('appache/common')
const createRootCommandClass = require('./createRootCommandClass')
const extendClasses = require('./extendClasses')


function buildConfig(command) {
  let commandConfig = Object.assign({}, command.config)
  let commands = [commandConfig]
  let options = command.options.map((option) => {
    return Object.assign({}, option.config)
  })

  command.commands.forEach((subcommand) => {
    let subcommandConfig = buildConfig(subcommand)
    commands = commands.concat(subcommandConfig.commands)
    options = options.concat(subcommandConfig.options)
  })

  return { commands, options }
}


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
        config.defaultCommand = command.config.id
      }
    })

    if (!config.defaultCommand && rootCommands.length === 1) {
      config.defaultCommand = rootCommands[0].config.id
    }

    return [schema, config]
  })

  return createRootCommand
}
