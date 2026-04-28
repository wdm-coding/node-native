// 命名空间
declare namespace Customer {
    function test(params:string) : string;
    namespace test2 {
        function test(params:string) : string;
    }
}

// 模块声明

declare module "test" {
    function testMod(params:string) : string;
    export = testMod;
}
