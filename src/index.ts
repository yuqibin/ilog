import { initIlogConfig, } from './config'
import { resendCacheFaileLogByBeacon } from './reSend';
import { ilog, sendBeaconHandler } from './ilog'
import { routerChangeHandle } from './uxObserver'
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
import { vueErrorHandle } from './errorObserver'
import { cryptoMd5, cryptoAes, pagehideHandle, onloadHandle, pagehideCallbackCollecter } from './common';

// 页面加载完成 注册的回调清空
onloadHandle()

// 页面离开前  把注册的beforeunload callbacks 清空  pagehide  beforeunload
pagehideHandle()

// 把清空失败log放入 pagehide回调  关闭页面前再尝试发送一次
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
  uxObserveRun(['click', 'input'])
  removeObserveOnleave()
}

const funcMap: any = {
  cryptoMd5,  // 加密方法
  cryptoAes,  // 加密方法
  initIlogConfig, // 初始化项目配置信息
  autoAllObserve, // 自动开启全部监控 并在页面离开时全部关闭
  mutationRun, // 开启曝光配置
  vueErrorHandle, // 开启捕获vue错误
  uxObserveRun, // 开启用户行为监控
  errorObserveRun, // 开启错误监控
  perfObserveRun, // 开启性能监控
  routerChangeHandle, // vue react 等框架的路由变化时  上报埋点 router.afterEach 回调函数内调用
  removeObserveOnleave,  // 移除全部监控
  pagehideCallbackCollecter, // 提供一个页面离开的回调收集 在页面离开时会全部执行回调
  sendBeaconHandler, // sendBeacon解决页面离开时发送上报请求被中断  实测这个不会中断 
}


Object.keys(funcMap).forEach((key: string) => {
  (ilog as any)[key] = funcMap[key]
})

export default ilog
