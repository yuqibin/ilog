# myy-ilog
## 功能一览

- 业务端自定义埋点
- 监控错误信息
- 监控性能信息
- 监控用户行为

## Quick Start

### 1. install  安装 & 打包
- ```npm install myy-ilog``` (暂未开放)
- ```<script type="module" src="./xx/ilog.js"></script>```
- 打包：执行```npm run build 或者 yarn run build``` 获取dist/ilog.js 使用
### 2. set configuration  项目初始化配置

```typescript
// main.ts
import ilog from '@yqb/ilog'

// 初始化配置
ilog.initIlogConfig({
  a: number | string,   // 应用id 【🔥必须】一个项目只能设置一个appId
  ilogUrl: string,  // 必须 如果不想使用默认接口 可自定义埋点接口地址 🔥必须是图片资源文件地址
  longResourceTime: number, // 资源加载时间阈值 ms  超过时间就会上报 🔥请谨慎设置
  longApiTime: number,      // 服务api接口时间阈值 ms 超时会上报 🔥请谨慎设置
  longTaskTime: number,    // 长任务时间阈值 ms  当遇到卡顿情况 卡顿时间超过阈值 会上报卡顿 🔥请谨慎设置
  viewAsm: 'vsm',     // 曝光埋点字段名 默认vsm 比如 <body vsm="a.b.c"></body> 当body曝光就会将a.b.c进行上报
  clickAsm: 'csm',   // 点击埋点字段名 默认csm 比如 <body csm="a.b.c"></body> 当点击body就会将a.b.c进行上报
  mode: 'dev',           // 运行环境 'dev' | 'test' | 'pre' | 'prd'
  threshold: 0.5,        // [0-1]默认0.5 曝光范围定义 0表示露出1px就算曝光  1表示模块完全暴露才算曝光
  ba: {                // 基础信息 每次上报都会携带的参数 比如token userId  personId 这类等
    personId: 10086,  
    clinicId: 279
  },
  resendInterval: 60 // 间隔多久发送一次失败的log  单位分钟 最小1分钟 值为 false 0 '' null 等  等于关闭自动重发功能 
})

// 选择开启
ilog.mutationRun()          // 开启曝光监控
ilog.uxObserveRun(['click', 'input'])  // 开启用户行为监控 pageusetime click input
ilog.errorObserveRun()      // 开启错误监控
ilog.perfObserveRun()       // 开启性能监控
ilog.removeObserveOnleave() // 页面销毁时移除全部监控

// 全部开启（自动移除）
ilog.autoAllObserve() 
```

### 3. use 业务端使用  pageCode moduleCode为可选  opCode为必填  'a..c' '..c' '.b.c'

```html
<!-- 当body曝光或者被点击时 进行埋点 (csm上报必须开启 uxObserveRun的click) -->
<body vsm="a.b.c" :csm="`a.b.${c}`"></body>
```
```JavaScript
// 代码主动埋点
if(x > 1) {
  ilog({
    a: 123456, // 这里支持跳过项目配置传appId 处理B应用其实是A应用抽离的一个大模块 appId不对应 的情况
    asm: 'pageCode.moduleCode.opCode', // 业务埋点基本必传opCode '..opCode'
    ext: {
      a: '影像id',
      b: '使用期间模块点击次数'
      ...
    }
  })
}
```

#### API

- cryptoMd5  md5数据加密 一般是initIlogConfig配置项目的时候 base里 userId这类数据加密 需要对接后端做解密
```typescript
// 数据加密  md5
ilog.cryptoMd5('123') // '202cb962ac59075b964b07152d234b70'
ilog.cryptoAes('123')
```

- pagehideCallbackCollecter  回调收集器 会在addEventListener pagehide 事件统一执行回调
```typescript
// pagehideCallbackCollecter 收集回调 在pagehide钩子执行
ilog.pagehideCallbackCollecter(() => {
  ...
})
```
- vueErrorHandle  vue错误监控
```typescript
// vue错误监控
const app = createApp(App)
app.config.errorHandler = err => {
  ilog.vueErrorHandle(err)
}
```
- routerChangeHandle  路由变化埋点
```typescript
// 路由监控  由于Vue router 实现方式  addEventListener    hashchange   popstate  无法监测
const app = createApp(App)
router.afterEach(() => {
  ilog.routerChangeHandle()
})
```
- sendBeaconHandler 提供一个在pagehide期间不会被中断的上报方式 且上报为post请求 超长get也可以考虑用这个
```typescript
window.addEventListener('pagehide', (event) => {
  sendBeaconHandler({ ext: 123 })
  // pagehideCallbacks.forEach(cb => cb())
})
```


### 4. ILogType

```typescript
// ilog参数type
export interface ILogType {
  a?: number | string // 应用id  比如 his-1001   总控后台-1002  AI诊疗-1003
  bt?: number // 上报时间戳
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
```
