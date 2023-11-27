import { initIlogConfig } from './config'
import { resendCacheFaileLogByBeacon } from './reSend'
import { ilog, sendBeaconHandler } from './ilog'
// import { routerChangeHandle } from './uxObserver'
import { mutationRun, removeMutation } from './mutationObserver'
import {
  perfObserveRun,
  removeObersve as removePerObersve
} from './performanceObserver'
import {
  errorObserveRun,
  removeListener as removeErrListener
} from './errorObserver'
import { uxObserveRun, removeListener as removeUxListener } from './uxObserver'
// import { vueErrorHandle } from './errorObserver'
import {
  pagehideHandle,
  onloadHandle,
  pagehideCallbackCollecter
} from './common'

// 页面加载完成 注册的回调执行
onloadHandle()

// 页面离开前 pagehide 把注册的callbacks 执行
pagehideHandle()

// pagehide页面离开前 使用Beacon把失败log重新尝试一次发送
pagehideCallbackCollecter(resendCacheFaileLogByBeacon)

// 页面离开时 移除全部监控
function removeObserveOnleave() {
  pagehideCallbackCollecter(() => {
    removeMutation()
    removeErrListener()
    removePerObersve()
    removeUxListener()
  })
}
// 开启全部监控  [错误,曝光,用户行为,性能]  并在页面离开时全部关闭
function autoAllObserve() {
  errorObserveRun()
  mutationRun()
  perfObserveRun()
  uxObserveRun()
  removeObserveOnleave()
}

// const funcMap: any = {
//   initIlogConfig, // 初始化项目配置信息
//   autoAllObserve, // 自动开启全部监控 并在页面离开时全部关闭
//   mutationRun, // 开启曝光监控
//   uxObserveRun, // 开启用户行为监控
//   errorObserveRun, // 开启错误监控
//   perfObserveRun, // 开启性能监控
//   removeObserveOnleave,  // 移除全部监控
//   pagehideCallbackCollecter, // 提供一个页面离开的回调收集 在页面离开时会全部执行回调
//   sendBeaconHandler, // sendBeacon（post请求）解决页面离开时发送上报请求被中断  实测这个不会中断
//   // vueErrorHandle, // 捕获vue错误hanlder
//   // routerChangeHandle, // vue react 等框架的路由变化时  上报埋点 router.afterEach 回调函数内调用
// }

// Object.keys(funcMap).forEach((key: string) => {
//   (ilog as any)[key] = funcMap[key]
// })

export {
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
}

// export default ilog