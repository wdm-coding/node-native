// 泛型函数重载

// 中文排序
function sortChinese(arr:Array<string>):Array<string>{
  return arr.sort((a,b)=>a.localeCompare(b,'zh-CN'))
}

// 判断是否是中文
function isChinese(str:string):boolean{
  return /^[\u4e00-\u9fa5]+$/.test(str)
}
// 判断是否是中文数组
function isChineseArr(arr:Array<string>):boolean{
  return arr.every(isChinese)
}

// 字符串的自排序
function sortString(str:string):string{
  return str.split('').sort().join('')
}

// 字符串或者数组的排序
function sortStringOrArray<T>(data:T):any[] | string | undefined{
  if(data instanceof Array){
    if(isChineseArr(data)){
      return sortChinese(data)
    }else{
      return data.sort()
    }
  }else if(typeof data === 'string'){
    return sortString(data)
  }
}

const result = sortStringOrArray(['a','喀什','c','d','e'])

