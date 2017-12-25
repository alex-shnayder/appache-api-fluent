class Command {
  constructor(name, description, parent) {
    let aliases

    if (Array.isArray(name)) {
      aliases = name
      name = aliases.shift()
    } else if (typeof name === 'string') {
      aliases = name.split(', ')
      name = aliases.shift()
    }

    if (!name || typeof name !== 'string') {
      throw new Error(
        'The first argument of the Command constructor must be either a non-empty string or an array'
      )
    }

    this.config = {
      name,
      id: parent ? `${parent.config.id}.${name}` : name,
      commands: [],
      options: [],
      extends: parent ? parent.config.id : undefined,
    }

    this.parent = parent
    this.commands = []
    this.options = []

    if (aliases.length) {
      this.aliases(...aliases)
    }

    if (description) {
      this.description(description)
    }
  }

  aliases(aliases) {
    this.config.aliases = Array.isArray(aliases) ? aliases : [aliases]
    return this
  }

  command(name, description) {
    let command = new this.constructor.Command(name, description, this)
    this.commands.push(command)
    this.config.commands.push(command.config.id)
    return command
  }

  option(name, description) {
    let option = new this.constructor.Option(name, description, this)
    this.options.push(option)
    this.config.options.push(option.config.id)
    return option
  }

  end() {
    return this.parent
  }
}

module.exports = Command
