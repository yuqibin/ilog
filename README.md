## Quick Start

### 1. install  安装 & 打包
- ```npm install myy-ilog```
- ```yarn add myy-ilog```
- 打包：执行```npm run build 或者 yarn run build``` 获取dist/iife/ilog.js 使用
### 2. set configuration  项目初始化配置


需要后端提供一个1x1像素的gif地址
比如：www.xxx.gif 
1让后端把www.xxx.gif做成get+post接口 
2让后端提供真实的www.xxx.gif访问地址 然后抓取日志

```typescript
// main.ts
import {
  ilog,
  initIlogConfig,
  autoAllObserve,
  mutationRun,
  uxObserveRun,
  errorObserveRun,
  perfObserveRun,
  removeObserveOnleave,
  pagehideCallbackCollecter,
  sendBeaconHandler
} from '@doog_boy/ilog'

interface initIlogConfigType {
  a: number | string,        // 【🔥必须】 应用id 一个项目只能设置一个appId
  ilogUrl: string,           // 【🔥必须】 必须是图片资源文件地址 比如：www.xxx.gif 让后端把地址做成get+post接口
  longResourceTime?: number, // 默认100ms 资源加载时间阈值 ms  超过时间就会上报 🔥请谨慎设置
  longApiTime?: number,      // 默认100ms 服务api接口时间阈值 ms 超时会上报 🔥请谨慎设置
  longTaskTime?: number,     // 默认1000ms 长任务时间阈值 ms  当遇到卡顿情况 卡顿时间超过阈值 会上报卡顿 🔥请谨慎设置
  viewAsm?: 'vsm',           // 默认vsm 曝光埋点字段名 默认vsm 比如 <body vsm="a.b.c"></body> 当body曝光就会将a.b.c进行上报
  clickAsm?: 'csm',          // 默认csm 点击埋点字段名 默认csm 比如 <body csm="a.b.c"></body> 当点击body就会将a.b.c进行上报
  mode?: 'dev',              // 默认dev 运行环境 'dev' | 'test' | 'pre' | 'prd'
  threshold?: 0.5,           // [0-1]默认0.5 曝光范围定义 0表示露出1px就算曝光  1表示模块完全暴露才算曝光
  ba?: {                     //  默认空对象 基础信息 每次上报都会携带的参数 比如userId  这类等
    userId: 66666,  
  },
  resendInterval: 10         // 默认10 间隔多久发送一次失败的log  单位分钟 最小1分钟 值为 false 0 '' null 等  等于关闭自动重发功能 
}
// 初始化配置
initIlogConfig({
  ...
})

// 选择开启
mutationRun()                                     // 开启曝光监控
uxObserveRun()                                    // 不传 全部开启
uxObserveRun(['click', 'input', 'pageusetime'])   // 选择开启 用户行为监控 pageusetime click input
errorObserveRun()                                 // 开启错误监控
perfObserveRun()                                  // 不传 全部开启 性能监控
/**
 * @param {String} crux    首屏性能指标
 * @param {String} memory  内存使用情况  打开+关闭 两次上报
 * @param {String} longApi 超长fetch、xhr 请求  
 * @param {String} longTask 长任务（卡顿）
 * @param {String} longResource 超长资源请求
 */
perfObserveRun(['memory', 'crux', 'api', 'task', 'resource']) // 选择开启 性能监控
removeObserveOnleave() // 页面销毁时移除全部监控

// 全部开启（自动移除）
autoAllObserve() 
```

#### 2.1 crux 

```typescript
interface crusType {
  whiteScreen     // 白屏时长
  firstPackage    // 首包耗时
  firstScreen     // 首屏耗时
  htmlLoad        // html加载完成耗时
  firstUx         // 首次交互时间 进入页面后多久可以交互
  pageLoad        // 页面完全加载
  FCP,            // 首次看到网页内容的时间点
  timing          // 原生字段
}

```

### 3. ILogType

```typescript
// ilog参数type
export interface ILogType {
  a: number | string                // 应用id  比如 app1-1001   app2-1002  app3-1003
  asm: string                      // 点位字符串 自行与后端约定即可 比如'a.b.c.d'  a是页面Code  b是模块code c是按钮code  d是操作code
  bt?: number                       // 上报时间戳 默认是上报时间 有值取值
  e?: 'pc' | 'h5' | 'xcx' | string  // 环境  pc h5 小程序 等
  ua?: string                       // userAgent
  ki?: 'app' | 'per' | 'err'        // 埋点类型  app-业务  per-性能监控  err-错误监控
  ba?: object                       // 项目配置信息 比如诊所id userid  等等
  hr?: string                       // 浏览器地址
  ext?: ExtendsType | any           // 扩展数据 传啥存啥  如果是业务埋点内容就是单个埋点需要传的参数 性能埋点 就是性能数据  错误埋点是错误信息
  et?: 'view' | 'click' | 'input' | 'keyboard' | 'timing' | string // 事件类型
  [key in string]: any // 其他字段
}
```

### 4. use 业务端使用  pageCode moduleCode为可选  opCode为必填  'a..c' '..c' '.b.c'

```html
<!-- 当body曝光或者被点击时 进行上报 (vsm上报前提是mutationRun开启 csm上报前提是 uxObserveRun(['click'])) -->
<body vsm="a.b.c" :csm="`a.b.${c}`"></body>
```
```JavaScript
// 代码主动埋点
if(Math.random() > 0.5) {
  ilog({
    a: 123456, // 这里支持跳过项目配置传appId 处理B应用其实是A应用抽离的一个大模块 appId不对应的情况
    asm: 'pageCode.moduleCode.opCode', // 业务埋点基本必传opCode '..opCode'
    ext: {
      a: 'id',
      b: '使用期间点击次数'
      ...
    }
  })
}
```

#### API

- pagehideCallbackCollecter  回调收集器 会在addEventListener pagehide 事件统一执行回调
```typescript
// pagehideCallbackCollecter 收集回调 在pagehide钩子执行
pagehideCallbackCollecter(() => {
  ...
})
```
-  vue错误监控 类似vue这种不会抛出错误的框架 可以在errorHandler里面解析错误并筛选上报
```typescript
const app = createApp(App)
app.config.errorHandler = err => {
  ilog({...})
}
```

- sendBeaconHandler 提供一个在pagehide期间不会被中断的上报方式 且上报为post请求 超长get也可以考虑用这个
```typescript
window.addEventListener('pagehide', (event) => {
  sendBeaconHandler({ ext: 123 })
  // pagehideCallbacks.forEach(cb => cb())
})
```


