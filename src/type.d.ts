export interface ExtendsType {
  perType?: 'longTask' | 'longApi' | 'longResource' | 'crux' | 'memory' | string
  startTime?: number | string
  duration?: number | string
  resource?: string
  api?: string
  task?: string
  crux?: string
  // ----------------
  errType?: 'resourceErr' | 'jsErr' | 'vueErr' | string
  stack?: string
  filename?: string // 资源url  或者  文件url
  tagName?: string
  position?: string // 代码行列
  message?: string // 错误信息
  [key in string]?: any
}

export interface ILogType {
  a?: number | string // 应用id  比如 his-1001   总控后台-1002  AI诊疗-1003
  ts?: number // 上报时间戳
  e?: 'pc' | 'h5' | 'xcx' | string // 环境  pc h5 小程序 等
  ua?: string // userAgent
  ki?: 'app' | 'per' | 'err' // 埋点类型  app-业务  per-性能监控  err-错误监控
  ba?: object // 项目配置信息 比如诊所id userid  等等
  asm?: string // 点位字符串  比如'a.b.c.d'  a是页面Code  b是模块code c是按钮code  d是操作code
  hr?: string // 浏览器地址
  ext?: ExtendsType | any // 扩展数据 传啥存啥  如果是业务埋点内容就是单个埋点需要传的参数 性能埋点 就是性能数据  错误埋点是错误信息
  et?: 'view' | 'click' | 'input' | 'keyboard' | 'timing' | string
  [key in string]: any // 其他可能的字段
}

export interface ConfigType {
  a: number | string // 应用id 必须设置
  ba?: any // 每次上报都会携带的基础信息 比如token userId 这类等
  mode: 'dev' | 'test' | 'pre' | 'prd' // 运行环境  默认dev
  longResourceTime?: number // 资源加载时间阈值 ms  超过时间就会上报 🔥请谨慎设置
  longApiTime?: number // 服务api接口时间阈值 ms 超时会上报 🔥请谨慎设置
  longTaskTime?: number // 长任务时间阈值 ms  当遇到卡顿情况 卡顿时间超过阈值 会上报卡顿 🔥请谨慎设置
  viewAsm?: number | string // 曝光埋点字段名  默认vsm
  clickAsm?: number | string // 点击埋点字段名 默认csm
  threshold?: number  // [0-1] 之间的小数 默认0.5 曝光面积设置 0 代表模块露出1px就算曝光  1代表模块整体宽高完全暴露才算曝光
  ilogUrl?: string // 埋点地址 可自定义埋点地址
  resendInterval?: number  // 多少分钟重新发送失败的log  单位分钟
}

