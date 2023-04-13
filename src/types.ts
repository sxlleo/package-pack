/*
 * @Author: songxiaolin songxiaolin@aixuexi.com
 * @Date: 2023-03-29 16:01:08
 * @LastEditors: songxiaolin songxiaolin@aixuexi.com
 * @LastEditTime: 2023-04-12 10:59:04
 * @FilePath: /penCorrectPlayer/src/types.ts
 * @Description: 
 * Copyright (c) 2023 by ${git_name} email: ${git_email}, All Rights Reserved.
 */
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