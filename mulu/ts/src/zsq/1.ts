// 不带参数的装饰器
function FirstClassDecorator(target: any) {
  let ins = new target()
  ins.order() 
  console.log('装饰器执行了',ins) 
}

@FirstClassDecorator
class CustomerService {
  name: string = '下单'
  constructor() {
    console.log('构造函数')
  }
  order() {
    console.log('下单了')
  }
  pay() {
    console.log('支付了')
  }
}