// 函数重载: 一组具有相似功能但参数和返回值类型不同的函数
interface MessageItem {
  id: number;
  type: string;
  sendmessage: string;
}

enum MessageType {
  'Text' = '1',
  'Image' = '2',
  'Video' = '3',
  'Audio' = '4'
}


const messages:MessageItem[] = [
  {
    id: 1111,
    type: MessageType.Image,
    sendmessage: `image-随机数字：${Math.random()}`
  },
  {
    id: 2222,
    type: MessageType.Text,
    sendmessage: `text-随机数字：${Math.random()}`
  },
  {
    id: 3333,
    type: MessageType.Video,
    sendmessage: `video-随机数字：${Math.random()}`
  },
  {
    id: 4444,
    type: MessageType.Audio,
    sendmessage: `audio-随机数字：${Math.random()}`
  },
  {
    id: 5555,
    type: MessageType.Image,
    sendmessage: `image-随机数字：${Math.random()}`
  },
  {
    id: 6666,
    type: MessageType.Text,
    sendmessage: `text-随机数字：${Math.random()}`
  },
  {
    id: 7777,
    type: MessageType.Video,
    sendmessage: `video-随机数字：${Math.random()}`
  },
  {
    id: 8888,
    type: MessageType.Image,
    sendmessage: `audio-随机数字：${Math.random()}`
  }
]


function searchMessage(condition:MessageType):MessageItem[];// 重载签名
function searchMessage(condition:number):MessageItem | undefined;// 重载签名
function searchMessage(condition:MessageType | number): MessageItem | MessageItem[] | undefined { // 实现签名
  if(typeof condition === 'number'){
    return messages.find(message => message.id === condition)
  }
  return messages.filter(message => message.type === condition)
}

const ids = searchMessage(8888)
const types = searchMessage(MessageType.Audio)