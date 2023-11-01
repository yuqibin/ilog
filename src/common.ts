import { isAndroid, isIOS, isWx, isXcx } from './env'
import CryptoJS from 'crypto-js';
import { config, resendCacheFaileLog } from './config';

let lastEvent: any
let intervaler: any = null

export const pagehideCallbacks: Function[] = []
export const onloadCallBacks: Function[] = []
// 获取最后一次交互事件
// ['click', 'touchstart', 'mousedown', 'keydown', 'mouseover']
function getLastEvent() {
  ['click', 'input'].forEach(eventType => {
    document.addEventListener(
      eventType,
      event => {
        lastEvent = event
      },
      {
        capture: true, // 是在捕获阶段还是冒泡阶段执行
        passive: true // 默认不阻止默认事件
      }
    )
  })
  return lastEvent
}

// 获取dom冒泡路径 比如页面卡顿埋点 可以参考是否是最后交互引起的卡顿   bubble
function getTargetPathByBubble(target: Element | ParentNode | null) {
  let path = []
  while (target && target?.nodeName?.toLowerCase() !== 'body') {
    path.push(target)
    target = target.parentNode
  }
  // 过滤 + 映射 + 拼接
  return JSON.stringify(
    path
      .filter((element: any) => {
        return element !== document && element !== window
      })
      .map((element: any) => {
        const nodeName = element.nodeName.toLowerCase()
        return element.className && typeof element.className === 'string'
          ? `${nodeName}.${element.className.split(' ').join('.')}`
          : nodeName
      })
  )
}

function onloadCallBacksImplement() {
  onloadCallBacks.forEach(cb => cb())
  onloadCallBacks.length = 0
}

function onloadHandle() {
  if (document.readyState === 'complete') {
    onloadCallBacksImplement()
  } else {
    window.addEventListener('load', onloadCallBacksImplement)
  }
}

// 间隔一段时间尝试发送一次失败的log
function resendIntervaler() {
  window.clearInterval(intervaler)
  if (!config.resendInterval || typeof config.resendInterval !== 'number') {
    return
  }
  config.resendInterval = config.resendInterval < 1 ? 10 : config.resendInterval
  intervaler = setInterval(resendCacheFaileLog, config.resendInterval * 60 * 1000)
}

function onloadCollecter(callback: () => void) {
  typeof callback === 'function' && onloadCallBacks.push(callback)

}

// pagehide 回调收集器 
function pagehideCallbackCollecter(callback: () => void) {
  typeof callback === 'function' && pagehideCallbacks.push(callback)
}

// 页面销毁前情况回调
function pagehideHandle() {
  window.addEventListener('pagehide', (event) => {
    pagehideCallbacks.forEach(cb => cb())
    pagehideCallbacks.length = 0
    onloadCallBacks.length = 0
    window.clearInterval(intervaler)
    intervaler = null
    lastEvent = null
  }, false)
}



function formatTime(time: any) {
  return new Date(time).getTime()
}

function getEnv() {
  switch (true) {
    case isAndroid || isIOS || isWx:
      return 'h5'
    case isXcx:
      return 'xcx'
    default:
      return 'pc'
  }
}

// 要不要使用定时器？？
const freeCallbackFn =
  typeof window.requestIdleCallback === 'function'
    ? window.requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 0)

const freeCallback = (cb: () => void) => freeCallbackFn(cb)

// md5 加密
const cryptoMd5 = (data: any) => {
  return CryptoJS.MD5(data).toString()
}

// aes 加密
const cryptoAes = (data: any) => {
  return CryptoJS.AES.decrypt(data, '').toString()
}

export {
  getLastEvent,
  getTargetPathByBubble,
  onloadCollecter,
  onloadHandle,
  pagehideHandle,
  getEnv,
  formatTime,
  pagehideCallbackCollecter,
  freeCallback,
  cryptoMd5,
  cryptoAes,
  resendIntervaler
}

