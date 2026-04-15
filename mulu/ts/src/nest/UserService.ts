export class UserService {
  constructor() {
    console.log('创建UserService类对象')
  }
  pname: string = '张三'
  public login(): void {
    console.log(this.pname+'登录了')
  }
}