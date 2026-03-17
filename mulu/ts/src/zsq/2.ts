// 带参数的装饰器
function FirstClassDecorator(params?:any){
  return function(target: any) {
    console.log('装饰器执行了') 
  }
}
@FirstClassDecorator('xxx')
@FirstClassDecorator()
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