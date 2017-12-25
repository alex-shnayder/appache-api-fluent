const { mergeConfigs } = require('appache/common')
const createRootCommandClass = require('./createRootCommandClass')
const extendClasses = require('./extendClasses')


function buildConfigForCommand(command) {
  let commandConfig = Object.assign({}, command.config)
  let commands = [commandConfig]
  let options = command.options.map((option) => {
    return Object.assign({}, option.config)
  })

  command.commands.forEach((subcommand) => {
    let subcommandConfig = buildConfigForCommand(subcommand)
    commands = commands.concat(subcommandConfig.commands)
    options = options.concat(subcommandConfig.options)
  })

  return { commands, options }
}

function buildConfig(config, commands) {
  config = commands.reduce((config, command) => {
    let commandConfig = buildConfigForCommand(command)
    return mergeConfigs(config, commandConfig)
  }, config)
  config.commands[0].default = true
  return config
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
    config = buildConfig(config, rootCommands)
    return [schema, config]
  })

  return createRootCommand
}
