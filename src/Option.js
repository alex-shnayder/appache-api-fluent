function normalizeName(name) {
  if (name.charAt(0) === '-') {
    name = name.substr(1)
  }

  if (name.charAt(0) === '-') {
    name = name.substr(1)
  }

  return name
}

class Option {
  constructor(name, description, parent) {
    if (!parent) {
      throw new Error('An option must have a parent command')
    }

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
        'The first argument of the Option constructor must be either a non-empty string or an array'
      )
    }

    name = normalizeName(name)
    this.parent = parent
    this.config = {
      name,
      id: `${parent.config.id}#${name}`,
    }

    if (aliases.length) {
      this.aliases(...aliases)
    }

    if (description) {
      this.description(description)
    }
  }

  aliases(...aliases) {
    this.config.aliases = aliases.map((a) => normalizeName(a))
    return this
  }

  shared() {
    this.parent.sharedOptions.push(this.config.id)
    return this
  }

  command(...args) {
    return this.parent.command(...args)
  }

  option(...args) {
    return this.parent.option(...args)
  }

  handle(...args) {
    return this.parent.handle(...args)
  }

  tap(...args) {
    return this.parent.tap(...args)
  }

  start(...args) {
    return this.parent.start(...args)
  }

  end() {
    return this.parent
  }
}

module.exports = Option
