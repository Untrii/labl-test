type ILocalizations<K extends keyof any> = {
  [P in K]: {
    description: string
    name: string
  }
}

export default ILocalizations
