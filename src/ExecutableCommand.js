const Command = require('./Command')
const Option = require('./Option')


class ExecutableCommand extends Command {
  _getLifecycle() {
    return this.lifecycle || (this.parent && this.parent._getLifecycle())
  }

  getFullName(subcommand) {
    let result = this.parent ? this.parent.getFullName() : []
    result.push(this.config.name)

    if (subcommand) {
      result.push(...subcommand.split(' '))
    }

    return result
  }

  _tapHandle(event, command, handler) {
    if (!handler) {
      handler = command
      command = this.getFullName()
    } else if (typeof command === 'string') {
      command = this.getFullName(command)
    } else {
      throw new Error('A command name must be a stirng')
    }

    if (event === true) {
      this._getLifecycle().tapAndHandle(command, handler)
    } else if (event === 'tap') {
      this._getLifecycle().tap(command, handler)
    } else if (event === 'handle') {
      this._getLifecycle().handle(command, handler)
    }

    return this
  }

  tap(command, handler) {
    this._tapHandle('tap', command, handler)
    return this
  }

  handle(command, handler) {
    this._tapHandle('handle', command, handler)
    return this
  }

  tapAndHandle(command, handler) {
    this._tapHandle(true, command, handler)
    return this
  }

  execute(command, options) {
    let request

    if (Array.isArray(command)) {
      request = command
    } else {
      if (arguments.length === 1 && typeof command !== 'string') {
        options = command
        command = null
      }

      let fullName = this.getFullName(command)
      request = [{ fullName, options }]
    }

    let lifecycle = this._getLifecycle()
    return lifecycle
      .toot('execute', request)
      .catch((err) => lifecycle.toot('error', err))
  }
}

ExecutableCommand.Option = Option

module.exports = ExecutableCommand
