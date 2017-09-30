const { next } = require('appache/effects')
const { optionsToObject, compareNames } = require('appache/common')
const Command = require('./Command')
const Option = require('./Option')


class ExecutableCommand extends Command {
  _getLifecycle() {
    return this.lifecycle || (this.parent && this.parent._getLifecycle())
  }

  _hookHandler(event, command, handler) {
    if (handler) {
      if (typeof command !== 'string') {
        throw new Error('A command name must be a string')
      }

      if (!/^[a-z0-9 *_-]+$/.test(command)) {
        throw new Error(
          'A command name can only contain letters, numbers, underscores, hyphens and spaces'
        )
      }

      if (command.charAt(0) === '-') {
        throw new Error(
          'A hyphen is not allowed as the first character of a command name'
        )
      }

      command = this.getFullName().concat(command.split(' '))
    } else {
      handler = command
      command = this.getFullName()
    }

    if (typeof handler !== 'function') {
      throw new Error('A handler must be a function')
    }

    this._getLifecycle().hook(event, function* (
      config, _command, context
    ) {
      let { fullName, options } = _command

      if (compareNames(fullName, command, true)) {
        options = optionsToObject(options)
        context = yield handler(options, context, fullName)
      }

      return yield next(config, _command, context)
    })
  }

  getFullName() {
    let parentName = this.parent ? this.parent.getFullName() : []
    return parentName.concat(this.config.name)
  }

  handle(command, handler) {
    this._hookHandler('handle', command, handler)
    return this
  }

  tap(command, handler) {
    this._hookHandler('tap', command, handler)
    return this
  }

  tapAndHandle(command, handler) {
    this._hookHandler('tap', command, handler)
    this._hookHandler('handle', command, handler)
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

      let fullName = this.getFullName()

      if (command) {
        fullName = fullName.concat(command.split(' '))
      }

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
