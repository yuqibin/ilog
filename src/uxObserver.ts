import { config } from './config'
import { ilog, sendBeaconHandler, } from './ilog'
import { onloadCollecter, pagehideCallbackCollecter } from './common'

export let lastClickEvent: any = undefined

// 点击事件
function clickHandler(event: Event & any) {
  lastClickEvent = event
  const { target } = event
  if (target?.getAttribute(`${config.clickAsm}`) === null) {
    return
  }
  ilog({
    ki: 'app',
    et: 'click',
    asm: target?.getAttribute(`${config.clickAsm}`)
  })
}

// 输入事件
function inputHandler(event: Event & any) {
  lastClickEvent = event
}

// 

/**
 * 不用 addEventListener 是因为
 * hash模式下符合条件时调用的实际上是pushState方法，
 * 而pushState和replaceState是无法触发onpopstate事件的，导致无法被监听到
 * history.back()可以被监听到
 *
 */
function routerChangeHandle() {
  ilog({
    ki: 'app',
    et: 'pv',
    hr: encodeURIComponent(location.href)
  })
}

function pv() {
  ilog({
    ki: 'app',
    hr: encodeURIComponent(location.href),
    et: 'pv'
  })
}

function pageStopTime() {
  const now = Date.now()
  onloadCollecter(() => { })
  pagehideCallbackCollecter(() => {
    sendBeaconHandler({
      ki: 'app',
      et: 'timing',
      hr: window.location.origin,
      ext: {
        timing: Date.now() - now
      }
    })
  })
}

const alertBeforeClosePage = (event: any) => {
  event.preventDefault()
  event.returnValue = ''
}

function removeListener() {
  window.removeEventListener('click', clickHandler)
  window.removeEventListener('input', inputHandler)
  lastClickEvent = undefined
}

function uxObserveRun(eventTypes?: string[]) {
  if (!eventTypes || eventTypes.includes('click')) {
    window.addEventListener('click', clickHandler)
  }
  if (!eventTypes || eventTypes.includes('input')) {
    window.addEventListener('input', inputHandler)
  }
  if (!eventTypes || eventTypes.includes('pageusetime')) {
    pageStopTime()
  }
}

export {
  uxObserveRun,
  routerChangeHandle,
  removeListener,
  clickHandler,
  uxObserveRun as default
}



