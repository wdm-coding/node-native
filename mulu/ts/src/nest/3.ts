/**
 * 1. 定义构造参数装饰器
 * 
 * 参数说明：
 * - target: 类的构造函数 (Target)
 * - parameterName: 参数的名字 (string | symbol | undefined)
 * - parameterIndex: 参数在参数列表中的索引 (number)
 */
function LogParameter(
  target: Function,
  parameterName: string | symbol | undefined,
  parameterIndex: number
) : void {
    console.log('target:', target)
}

/**
 * 2. 使用装饰器
 */
class UserService {
    constructor(
        // 在这里应用装饰器
        @LogParameter public username: string = '', 
        @LogParameter private age: number = 0
    ) {
        console.log(`🚀 构造函数执行: 创建用户 ${this.username}, 年龄 ${this.age}`);
    }

    getInfo() {
        return `${this.username} is ${this.age}`;
    }
}

// 实例化类 (触发装饰器逻辑)
const user = new UserService('Alice', 25);

// 验证功能
console.log(user.getInfo());