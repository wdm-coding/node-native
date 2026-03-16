interface ParamsType {
  name: string;
  age: number;
}

type CusFn = (params: ParamsType,token:string) => string;
//条件类型 语法结构 type Name = T extends U ? T : never;
// 只获取第一个参数类型 type CusFnOnlyOne = ParamsType
// infer P：这是一个占位符
type CusFnOnlyOne = CusFn extends ((params: infer P,...rest:any[]) => string) ? P : never;
// type ReturnType = string
type ReturnType = CusFn extends ((params: ParamsType,token:string) => infer R) ? R : never;

type ParamsT<T> = T extends ((params: ParamsType,token:string) => infer R) ? R : never;

type ReturnTy = ParamsT<CusFn>;

type EleOfArray<T> = T extends Array<infer R> ? R : never;

type EleOfArray2 = EleOfArray<Array<number>>;

type EleOfArray3 = EleOfArray<[1,2,3]>;

type EleOfArray4 = EleOfArray<['a', 'b']>;

type EleOfArray5 = EleOfArray<string[]>;

type EleOfArray6 = EleOfArray<Array<{ name: string }>>;

// in keyof ... 遍历

type Value = {
  [p in keyof ParamsType]:ParamsType[p]
}