import { ilog, sendBeaconHandler } from './ilog'
import { config } from './config'
import { isNative } from './env'
import { getTargetPathByBubble, onloadCollecter, freeCallback, pagehideCallbackCollecter } from './common'
import { lastClickEvent } from './uxObserver'

const LONG_RESOURCE_TIME = 30 // ms
const LONG_API_TIME = 50
const LONG_TASK_TIME = 50

const isCanUsePerformanceObserver =
  typeof IntersectionObserver !== 'undefined' &&
  (isNative(IntersectionObserver) ||
    IntersectionObserver.toString() ===
    '[object IntersectionObserverConstructor]')

let longApiObserve: any
let longTaskObserve: any
let perfObserver: any // PerformanceObserver 实例

function isCache(entry: any) {
  return (
    entry.transferSize === 0 ||
    (entry.transferSize !== 0 && entry.encodedBodySize === 0)
  )
}



// 交互卡顿
function longTask(data: PerformanceObserverEntryList) {
  data.getEntriesByType('longtask')
    .filter(v => v.duration > (config.longTaskTime || LONG_TASK_TIME))
    .forEach(entry => {
      ilog({
        ki: 'per',
        ext: {
          perType: 'longTask',
          eventType: lastClickEvent?.type,
          duration: Math.round(entry.duration),
          selector: lastClickEvent ? getTargetPathByBubble(lastClickEvent?.target) : ''
        }
      })
    })
}

// long api 超长业务接口  fetch xhr
function longApi(data: PerformanceObserverEntryList) {
  data
    .getEntriesByType('resource')
    .filter((entry: any) => {
      return (
        ['fetch', 'xmlhttprequest'].indexOf(entry.initiatorType) > -1 &&
        entry.duration > (config.longApiTime || LONG_API_TIME)
      )
    })
    .forEach(entry => {
      ilog({
        ki: 'per',
        ext: {
          perType: 'longApi',
          data: {
            duration: Math.round(entry.duration),
            url: encodeURIComponent(entry.name)
          }
        }
      })
    })
}

// long resource
function longResource(data: PerformanceObserverEntryList) {
  let list: any[] = []
  data.getEntriesByType('resource').filter((entry: any) => {
    return (
      ['fetch', 'xmlhttprequest', 'beacon'].indexOf(entry?.initiatorType) ===
      -1 && entry.duration > (config.longResourceTime || LONG_RESOURCE_TIME)
    )
  }).forEach((entry: any) => {
    if (entry.name.includes(config.ilogUrl)) {
      return
    }
    list.push({
      isCache: isCache(entry),
      url: encodeURIComponent(entry.name),
      duration: Math.round(entry.duration),
      initiatorType: entry.initiatorType || ''
    })
  })
  while (list.length) {
    ilog({
      ki: 'per',
      ext: {
        perType: 'longResource',
        data: (list.splice(0, 20))
      }
    })
  }
}

// 首屏 关键指标
// https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceTiming
/**
 * Performance.timing  已弃用
 * PerformanceNavigationTiming  实验中
 * first-paint（⾸次渲染）、first-contentful-paint（⾸次内容渲染）、first-meaningful-paint（⾸次有效渲染）
 *
 * 白屏、首包、首屏(首次内容渲染)、HTML加载完成、首次可交互、页面完全加载
 *
 */

function cruxTarget() {
  if (!performance.timing) {
    return
  }
  const {
    responseStart,
    navigationStart,
    responseEnd,
    domContentLoadedEventEnd,
    domInteractive,
    loadEventEnd
  } = performance.timing
  let FCP = performance.getEntriesByName('first-contentful-paint')[0]
  const crux = {
    whiteScreen: responseStart - navigationStart, // 白屏时长
    firstPackage: responseEnd - navigationStart, // 首包耗时
    firstScreen: FCP?.startTime, // 首屏耗时
    htmlLoad: domContentLoadedEventEnd - navigationStart, // html加载完成耗时
    firstUx: domInteractive - navigationStart, // 首次交互时间 进入页面后多久可以交互
    pageLoad: loadEventEnd - navigationStart, // 页面完全加载
    FCP,
    timing: performance.timing
  }
  // console.log('关键时间(ms)：', crux)
  ilog({
    ki: 'per',
    ua: navigator.userAgent,
    ext: {
      perType: 'crux',
      data: crux,
    }
  })
}

// 内存使用情况  页面打开 关闭各 记录一次 附带ua
function memoryHandler({ sendBeacon }: { sendBeacon?: boolean }) {
  const { memory } = performance as Performance & { memory: any }
  if (memory) {
    const handle = sendBeacon ? sendBeaconHandler : ilog
    handle({
      ki: 'per',
      ua: navigator.userAgent,
      ext: {
        perType: 'memory',
        data: memory,
      }
    })
  }
}

// PerformanceObserver 监控实例
function usePerfObserver(types?: string[]) {
  perfObserver = new PerformanceObserver((list: PerformanceObserverEntryList) => {
    if (!types || types.includes('longApi')) {
      longApi(list)
    }
    if (!types || types.includes('longResource')) {
      longResource(list)
    }
    if (!types || types.includes('longTask')) {
      longTask(list)
    }
  })
  perfObserver.observe({ entryTypes: ['resource', 'longtask'] })
}

// 监控页面性能 首屏性能 资源加载 内存使用  memory  crux longApi longTask longResource
function perfObserveRun(types?: string[]) {
  isCanUsePerformanceObserver && usePerfObserver(types)

  if (!types || types.includes('memory')) {
    onloadCollecter(() => memoryHandler({}))
    pagehideCallbackCollecter(() => memoryHandler({
      sendBeacon: true
    }))
  }
  if (!types || types.includes('crux')) {
    onloadCollecter(() => freeCallback(cruxTarget))
  }
}

function removeObersve() {
  longApiObserve?.disconnect()
  longTaskObserve?.disconnect()
  perfObserver?.disconnect()
}

export { perfObserveRun, removeObersve, perfObserveRun as default }

// const entryHandler = (list) => {
//   for (const entry of list.getEntries()) {
//       if (entry.name === 'first-contentful-paint') {
//           observer.disconnect()
//       }
//       // 计算首次内容绘制时间
//      let FCP = entry.startTime
//   }
// }
// const observer = new PerformanceObserver(entryHandler)
// observer.observe({ type: 'paint', buffered: true })

