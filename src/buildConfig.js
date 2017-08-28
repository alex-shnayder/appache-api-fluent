function concatArrays(arrayA, arrayB) {
  if (arrayA && arrayB) {
    return arrayA.concat(arrayB)
  }

  return arrayA || arrayB || []
}

module.exports = function buildConfig(
  command, isDefault, inheritedSettings, inheritedOptions
) {
  let config = Object.assign({}, command.config)
  let commands = [config]
  let options = command.options.map((option) => option.config)
  let { sharedSettings, sharedOptions } = command
  let inheritableSettings = concatArrays(inheritedSettings, sharedSettings)
  let inheritableOptions = concatArrays(inheritedOptions, sharedOptions)

  config.default = Boolean(isDefault)
  config.inheritableSettings = inheritableSettings
  config.inheritableOptions = inheritableOptions

  if (command.commands) {
    command.commands.forEach((subcommand) => {
      let subcommandConfig = buildConfig(
        subcommand, false, inheritableSettings, inheritableOptions
      )
      commands = commands.concat(subcommandConfig.commands)
      options = options.concat(subcommandConfig.options)
    })
  }

  return { commands, options }
}
