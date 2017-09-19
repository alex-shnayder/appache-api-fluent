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

      if (!/^[a-z0-9 _-]+$/.test(command)) {
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
      config, _command, context, ...args
    ) {
      let { fullName, options } = _command

      if (compareNames(fullName, command)) {
        options = optionsToObject(options)
        context = yield handler(options, context, ...args)
      }

      return yield next(config, _command, context, ...args)
    })

    return this
  }

  getFullName() {
    let parentName = this.parent ? this.parent.getFullName() : []
    return parentName.concat(this.config.name)
  }

  handle(command, handler) {
    return this._hookHandler('handle', command, handler)
  }

  tap(command, handler) {
    return this._hookHandler('tap', command, handler)
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

  start() {
    let lifecycle = this.lifecycle

    if (!lifecycle || this.parent) {
      throw new Error('start() can only be used on the root command (the app)')
    }

    try {
      return lifecycle.toot('start')
    } catch (err) {
      lifecycle.toot('error', err)
    }
  }

  catch(handler) {
    let lifecycle = this.lifecycle

    if (!lifecycle || this.parent) {
      throw new Error('catch() can only be used on the root command (the app)')
    }

    lifecycle.hook('error', function* (_, ...args) {
      let result = yield handler(...args)
      return result ? result : yield next(_, ...args)
    })

    return this
  }
}

ExecutableCommand.Option = Option

module.exports = ExecutableCommand