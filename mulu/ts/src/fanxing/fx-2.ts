//2. 泛型默认值
class ArrayList<T = number> {
  arr:Array<T>;
  index:number=0;
  constructor() {
    this.arr = []
  }
  add(item: T) {
    this.arr[this.index++] = item
  }
  remove(index: number): void {
    this.arr.splice(index, 1)
  }
  get(index: number): T {
    return this.arr[index]!
  }
}

const list = new ArrayList()

list.add(1)

list.add(2)

const list2 = new ArrayList<string>

list2.add('a')

list2.add('b')
