import { Descriptions } from 'antd';
type MouseEvent = {
  type: 'click';
  x: number;
  y: number;
}

type KeyEvent = {
  type: 'keydown';
  key: number;
}

type EventRec = EventFunctions<MouseEvent | KeyEvent,"type">

type EventFunctions<Events extends Record<string,any>,Key extends keyof Events> = {
  [Event in Events as Event[Key]]: (event: Event) => void
}

interface Tode {
  readonly title: string;
  completed: boolean;
  descriptions: string;
  date?: Date;
  publisher?: string;
}

// 去掉可选属性
type Required<T> = {
  [P in keyof T]-?: T[P]
}

type Type1 = Required<Tode>

// 添加可选属性
type Partial<T> = {
  [P in keyof T]+?: T[P]
}

type Type2 = Partial<Tode>

// 去掉只读属性
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

type Type3 = Mutable<Tode>

// 添加只读属性
type Readonly<T> = {
  +readonly [P in keyof T]: T[P]
}

type Type4 = Readonly<Tode>