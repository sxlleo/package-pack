/**
 * 画笔轨迹点数据
 */
type PenPointer = {
  force: number
  penModel: number
  timelong: number
  type: 'PEN_DOWN' | 'PEN_MOVE'| 'PEN_UP'
  width: number
  x: number
  y: number
}

/**
 * 配置文件
 */
type Config = {
  // 线的宽度
  strokeWidth: number
  // 画笔数据
  penDatas: PenPointer[]
  // 是否是直播
  isLive: boolean
}

/**
 * 线点数据
 */
type LinePointer = {
  x: number
  y: number
}
/**
 * 线数据
 */
type Line = {
  points: LinePointer[]
}

export type { Config, PenPointer, Line, LinePointer };