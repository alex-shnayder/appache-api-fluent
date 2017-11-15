function concatArrays(arrayA, arrayB) {
  if (arrayA && arrayB) {
    return arrayA.concat(arrayB)
  }

  return arrayA || arrayB || []
}

module.exports = function buildConfig(
  command, inheritedSettings, inheritedOptions
) {
  let config = Object.assign({}, command.config)
  let commands = [config]
  let options = command.options.map((option) => option.config)
  let { inheritableSettings, inheritableOptions } = command

  inheritableSettings = concatArrays(inheritedSettings, inheritableSettings)
  inheritableOptions = concatArrays(inheritedOptions, inheritableOptions)
  config.inheritableSettings = inheritableSettings
  config.inheritableOptions = inheritableOptions

  if (command.commands) {
    command.commands.forEach((subcommand) => {
      let subcommandConfig = buildConfig(
        subcommand, inheritableSettings, inheritableOptions
      )
      commands = commands.concat(subcommandConfig.commands)
      options = options.concat(subcommandConfig.options)
    })
  }

  return { commands, options }
}
