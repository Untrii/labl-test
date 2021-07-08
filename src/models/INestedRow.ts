export default interface INestedRow {
  heading: string
  data: ({ min: number; max: number } | number)[]
  nested?: INestedRow[]
}
