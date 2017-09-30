const { preHook } = require('appache/effects')
const createApiFunction = require('./createApiFunction')


module.exports = function* apiFluentPlugin(lifecycle) {
  yield preHook('init', (schema, api) => {
    if (api) {
      // eslint-disable-next-line
      console.warn(
        'The fluent API plugin is overriding another plugin\'s modifications. ' +
        'Either change the order of the plugins, or disable the fluent API'
      )
    }

    api = createApiFunction(lifecycle, schema)
    return [schema, api]
  })
}
