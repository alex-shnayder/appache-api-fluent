const { next } = require('appache/effects')


function createRootCommandClass(BaseClass) {
  return class RootCommand extends BaseClass {
    constructor(lifecycle, ...args) {
      super(...args)
      this.lifecycle = lifecycle
    }

    start() {
      try {
        return this.lifecycle.start()
      } catch (err) {
        this.lifecycle.toot('error', err)
      }
    }

    catch(handler) {
      this.lifecycle.hook('error', function* (_, ...args) {
        let result = yield handler(...args)
        return result ? result : yield next(_, ...args)
      })
      return this
    }
  }
}


module.exports = createRootCommandClass
