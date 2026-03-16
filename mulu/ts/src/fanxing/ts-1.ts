// 交叉类型

type O1 = { a: string; b: number }
type O2 = { c: boolean; d: string }

let o1:O1 = { a: '1', b: 2 }
let o2:O2 = { c: true, d: '3' }

function cross<T extends object, U extends object>(t: T, u: U): T & U {
  const combine = {} as T & U
  union(combine,t)
  union(combine,u)
  return combine
}

function union(combine:any,curobj:any){
  for(let key in curobj){
    combine[key] = curobj[key]
  }
  return combine
}