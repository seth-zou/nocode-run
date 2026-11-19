const {
  createAppSchema,
  updateAppSchema,
} = require('../src/routes/apps')

describe('createAppSchema', () => {
  it('accepts a valid name with an empty description', () => {
    const { error, value } = createAppSchema.validate({
      name: 'My App',
      description: '',
    })

    expect(error).toBeUndefined()
    expect(value.name).toBe('My App')
    expect(value.description).toBe('')
  })

  it('accepts a valid name with a description', () => {
    const { error, value } = createAppSchema.validate({
      name: 'Todo App',
      description: 'A simple todo application',
    })

    expect(error).toBeUndefined()
    expect(value.name).toBe('Todo App')
    expect(value.description).toBe('A simple todo application')
  })

  it('rejects a missing name', () => {
    const { error } = createAppSchema.validate({ description: 'desc' })

    expect(error).toBeDefined()
    expect(error.details[0].message).toBe('应用名称是必填项')
  })

  it('rejects an empty name', () => {
    const { error } = createAppSchema.validate({ name: '' })

    expect(error).toBeDefined()
    expect(error.details[0].message).toBe('应用名称不能为空')
  })

  it('rejects a name longer than 50 characters', () => {
    const longName = 'a'.repeat(51)
    const { error } = createAppSchema.validate({ name: longName })

    expect(error).toBeDefined()
    expect(error.details[0].message).toBe('应用名称不能超过50个字符')
  })

  it('rejects a description longer than 200 characters', () => {
    const longDesc = 'b'.repeat(201)
    const { error } = createAppSchema.validate({
      name: 'App',
      description: longDesc,
    })

    expect(error).toBeDefined()
    expect(error.details[0].message).toBe('应用描述不能超过200个字符')
  })

  it('trims whitespace from name and description', () => {
    const { error, value } = createAppSchema.validate({
      name: '  Trimmed App  ',
      description: '  spaced desc  ',
    })

    expect(error).toBeUndefined()
    expect(value.name).toBe('Trimmed App')
    expect(value.description).toBe('spaced desc')
  })

  it('accepts a name that is exactly 50 characters', () => {
    const { error } = createAppSchema.validate({
      name: 'c'.repeat(50),
    })

    expect(error).toBeUndefined()
  })
})

describe('updateAppSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    const { error, value } = updateAppSchema.validate({})

    expect(error).toBeUndefined()
    expect(value).toEqual({})
  })

  it('accepts a name-only update', () => {
    const { error, value } = updateAppSchema.validate({ name: 'New Name' })

    expect(error).toBeUndefined()
    expect(value.name).toBe('New Name')
  })

  it('accepts a description-only update', () => {
    const { error, value } = updateAppSchema.validate({
      description: 'updated description',
    })

    expect(error).toBeUndefined()
    expect(value.description).toBe('updated description')
  })

  it('rejects an empty name when provided', () => {
    const { error } = updateAppSchema.validate({ name: '' })

    expect(error).toBeDefined()
    expect(error.details[0].message).toBe('应用名称不能为空')
  })

  it('rejects a name longer than 50 characters', () => {
    const { error } = updateAppSchema.validate({
      name: 'd'.repeat(51),
    })

    expect(error).toBeDefined()
    expect(error.details[0].message).toBe('应用名称不能超过50个字符')
  })

  it('rejects a description longer than 200 characters', () => {
    const { error } = updateAppSchema.validate({
      description: 'e'.repeat(201),
    })

    expect(error).toBeDefined()
    expect(error.details[0].message).toBe('应用描述不能超过200个字符')
  })
})
