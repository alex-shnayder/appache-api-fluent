const Command = require('./Command')


class ExecutableCommand extends Command {
  constructor(...args) {
    super(...args)
    this.rootCommand = this._getRootCommand()
  }

  _getRootCommand() {
    if (this.parent) {
      return this.parent._getRootCommand()
    }

    return this
  }

  _tapHandle(type, handler) {
    if (typeof handler !== 'function') {
      throw new Error('A handler must be a function')
    }

    if (type === true) {
      this.rootCommand.lifecycle.tapAndHandle(this.config.id, handler)
    } else if (type === 'tap') {
      this.rootCommand.lifecycle.tap(this.config.id, handler)
    } else if (type === 'handle') {
      this.rootCommand.lifecycle.handle(this.config.id, handler)
    }

    return this
  }

  tap(handler) {
    return this._tapHandle('tap', handler)
  }

  handle(handler) {
    return this._tapHandle('handle', handler)
  }

  tapAndHandle(handler) {
    return this._tapHandle(true, handler)
  }

  execute(batch) {
    return new Promise((resolve) => {
      if (!Array.isArray(batch)) {
        batch = [{ name: this.config.name, options: batch }]
      }

      let lifecycle = this.rootCommand.lifecycle
      let result = lifecycle
        .toot('execute', batch)
        .catch((err) => lifecycle.error(err))
      resolve(result)
    })
  }
}


module.exports = ExecutableCommand
