/*
 * @Author: songxiaolin songxiaolin@aixuexi.com
 * @Date: 2023-02-21 17:09:53
 * @LastEditors: songxiaolin songxiaolin@aixuexi.com
 * @LastEditTime: 2023-04-12 15:55:42
 * @FilePath: /penCorrectPlayer/src/index.ts
 * @Description:
 */
import type { Config, PenPointer, Line, LinePointer } from './types'

const DefaultConfig: any = {
  strokeWidth: 0.5,
};

class CorrectStringPlayer {
  /**
   * canvas节点
   */
  _canvas: HTMLCanvasElement
  /**
   * 配置
   */
  _config: Config;
  /**
   * 笔的数据
   */
  _penData: PenPointer[];
  /**
   * 轨迹总时长（毫秒）
   */
  _totalTime: number
  /**
   * 当前时间
   */
  _curTime: number = 0
  /**
   * 播放倍速
   */
  _rate: number = 1;

  /**
   * 正在播放中
   */
  _isplaying: boolean = false;

  /**
   * 剩余未绘制的画笔轨迹
   */
  _leftPenData: PenPointer[];

  /**
   * requestAnimationFrame动画id
   */
  _myRequestAnimationFrame: number;
  constructor(canvas: HTMLCanvasElement, config?: Config) {
    this._canvas = canvas;
    this._config = {
      ...DefaultConfig,
      ...config
    };

    this._penData = Array.from(config?.penDatas);

    // 初始化设置
    const ctx: CanvasRenderingContext2D = this._canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = this._config.strokeWidth;
  }

  /**
   * 解析成线的数组
   * @param penDatas 画笔数据
   * @returns 
   */
  _parseToLines(penDatas: PenPointer[]): Line[] {
    const lines: Line[] = [];
    penDatas.forEach((dot) => {
      const pointer: LinePointer = { x: dot.x, y: dot.y };
      if (dot.type === "PEN_DOWN") {
        const line: Line = {
          points: [pointer],
        };
        lines.push(line);
      } else if (dot.type === "PEN_MOVE" || dot.type === "PEN_UP") {
        lines[lines.length - 1].points.push(pointer);
      }
    });

    return lines;
  }

  /**
   * 直接展示
   */
  show(): void {
    const ctx: CanvasRenderingContext2D = this._canvas.getContext("2d");
    // 所有线数据
    const lines: Line[] = this._parseToLines(this._penData);
    if(lines.length === 0) return;

    ctx.beginPath();
    lines.forEach((line: Line) => {
      const [firstPoint, ...others] = line.points;
      ctx.moveTo(firstPoint.x, firstPoint.y);

      others?.forEach((pointer: LinePointer) => {
        ctx.lineTo(pointer.x, pointer.y);
      });
    });
    ctx.stroke();
  }

  /**
   * 播放展示
   */
  play(): void {
    if(this._curTime === 0) this._clearCanvas();
    this._isplaying = true

    // 如果还有剩余未绘制的，则继续绘制
    if(!this._leftPenData) this._leftPenData = Array.from(this._penData);

    const ctx: CanvasRenderingContext2D = this._canvas.getContext("2d");
    let firstPointTimestramp: number = this._penData[0].timelong;
    let prePointer: PenPointer;

    console.log(
      "play time:",
      (this._penData[this._penData.length - 1].timelong -
        this._penData[0].timelong) /
        (1000 * 60)
    );


    // 动画上一次的时间戳
    let preTimestamp: number;
    // 动画当前的时间戳
    let currentTimestamp: number;
    function step(timestamp: number) {
      if (preTimestamp === undefined) {
        preTimestamp = timestamp;
      }
      currentTimestamp = timestamp;
      // 改变的时间
      const changTime = this._rate * (currentTimestamp - preTimestamp);
      // console.log("@@@@@", currentTimestamp,preTimestamp, changTime, self._curTime)

      // 设置当前时间
      this._curTime += changTime;


      if (this._curTime > 0) {
        // 根据时间找到需要绘制出来的点
        const drawPoints: PenPointer[] = this._leftPenData.filter((point: PenPointer) => {
          return point.timelong - firstPointTimestramp <= this._curTime;
        })
        this._leftPenData.splice(0, drawPoints.length);

        // console.log("endIndex", drawPoints, endIndex);
        if (drawPoints.length > 0) {
          // 绘制
          ctx.beginPath();
          if (["PEN_DOWN", "PEN_MOVE"].includes(prePointer?.type)) {
            ctx.moveTo(prePointer.x, prePointer.y);
          }
          drawPoints.forEach((point, index) => {
            if (point.type === "PEN_DOWN") {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
            if (index === drawPoints.length - 1) {
              prePointer = point;
            }
          });
          ctx.stroke();
        } else {
          // console.log("elapsed", elapsed);
          // console.log("arr first", arr[0].timelong - firstPointTimestramp);
        }
      }

      if (this._leftPenData.length > 0) {
        // 继续animation
        this._myRequestAnimationFrame = window.requestAnimationFrame(step.bind(this));
        console.log("继续", this._leftPenData[0].timelong - firstPointTimestramp, this._curTime)
      }
      else {
        console.log("终止")
        // 终止animation
        this._isplaying = false
      }

      // 记录上一次的时间戳
      preTimestamp = currentTimestamp;
    }

    this._myRequestAnimationFrame = window.requestAnimationFrame(step.bind(this));
  }

  /**
   * 获取轨迹总时长，单位毫秒
   */
  get totalTime():number {
    const firstTimestamp = this._penData[0]?.timelong ?? 0
    const lastTimestamp = this._penData[this._penData.length - 1]?.timelong ?? 0
    return lastTimestamp - firstTimestamp;
  }

  /**
   * 获取当前时间
   */
  get currentTime(): number {
    return this._curTime
  }

  set currentTime(value: number) {
    this._curTime = value
  }

  /**
   * 倍速
   */
  get rate(): number {
    return this._rate
  }

  /**
   * 设置倍速
   * @param value 倍速
   */
  set rate(value: number) {
    this._rate = value
  }

  /**
   * 暂停
   */
  pause(): void {
    this._myRequestAnimationFrame && window.cancelAnimationFrame(this._myRequestAnimationFrame)
    this._isplaying = false
  }

  /**
   * 继续添加画笔数据，添加数据会自动触发播放（持续添加的数据在时间上需要是持续的）
   * @param penData 画笔数据
   */
  appendPenData(penData: PenPointer[]):void {
    if(penData?.length > 0) {
      console.log("append", this._leftPenData)
      Array.prototype.push.apply(this._penData, penData)
      Array.prototype.push.apply(this._leftPenData, penData)
      // 继续播放
      if(!this._isplaying) this.play()
    }
  }

  /**
   * 清理画布
   */
  _clearCanvas():void {
    if(this._canvas?.parentNode) {
      this._canvas.getContext('2d')?.clearRect(0, 0, this._canvas.width, this._canvas.height)
      this._leftPenData = null
    }
  }

  /**
   * 销毁
   */
  destroy() {
    this._myRequestAnimationFrame && window.cancelAnimationFrame(this._myRequestAnimationFrame)
    if(this._canvas?.parentNode) {
      this._canvas.getContext('2d')?.clearRect(0, 0, this._canvas.width, this._canvas.height)
    }
    this._canvas = null
  }
}

export default CorrectStringPlayer;
