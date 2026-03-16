interface Tode {
  name: string;
  complete: boolean;
  description: string;
  add():number;
  delete():number;
  update():number;
}

// type Test = "do"
// // 首字母大写
// type TestCap = Capitalize<Test>;
// 1. 获取tode的函数
type ExcArr<T> = Exclude<T,Array<any>>
type Degree<T extends Record<string, any>>= {
  [P in keyof ExcArr<T> as ExcArr<T>[P] extends Function ? `do${Capitalize<P & string>}`: never]: ExcArr<T>[P];
}

type TodoFun = Degree<Tode>;

type todoFunA = Degree<{
  say():string
}>
