export * from './common/models/personal/directory'
export * from './common/models/personal/note'
export * from './common/models/personal/library'
export * from './common/models/personal/notebook'
export * from './common/models/account'
export * from './common/models/article'
export * from './common/models/auth'
export * from './common/models/channel'
export * from './common/models/common-result'
export * from './common/models/relation'
export * from './common/models/session'
export * from './common/models/tag'

export function sayHelloCommon(word: string) {
    return "Hello from SteleCommon!" + word
}