import { ILogType } from './type'
import { config, } from './config'
import { freeCallback, getEnv } from './common'
import { pushCacheFaileLog } from './reSend';
import { hasSymbol } from './env'

const env = getEnv()
/**
 *
 * @param {ILogType} params
 * @returns string
 */
function checkPath(params: ILogType & { [key in string]: any }) {
  params.bt = params.bt || Date.now()
  params.ba = config.ba
  // let paramsPath = `?a=${params.a}&bt=${Date.now()}&ba=${JSON.stringify(config.ba)}`

  // for (let key of Object.keys(params)) {
  //   if (typeof params[key] === 'object') {
  //     paramsPath += `&${key}=${JSON.stringify(params[key])}`
  //   } else {
  //     paramsPath += `&${key}=${params[key]}`
  //   }
  // }
  // return paramsPath

  return window.encodeURI(`?data=${JSON.stringify(params)}`)
}
const symbolkey: unique symbol = Symbol()
declare global {
  interface Window {
    [symbolkey]: any
    ['ilog9088jhfahfjaahqwe']: any
  }
}
const ilogkey = hasSymbol ? symbolkey : 'ilog9088jhfahfjaahqwe'

/**
 *
 * 直接new Image().src 弊端 https://blog.csdn.net/weixin_34362991/article/details/90155609
 * 1 可以跨域
 * 2 不需要响应 发出去即可
 * 3 如果ajax请求发送过程中跳转了页面，那么该请求会被取消，但用图片不会有这个问题
 * 4 无阻塞
 * 5 如果是分析日志方式 1x1 gif体积是最小的  43byte
 */
function ilog(params: ILogType) {
  params.a = params.a || config.a
  params.ki = params.ki || 'app'
  if (!params.a) {
    // console.log('%c 未设置ilog a', 'color: red; font-size: 16px;font-weight: bold;')
    // new Error('未设置ilog a')
    pushCacheFaileLog({ ...params, bt: Date.now() })
    return 
  }
  params.e = params.e || env
  freeCallback(() => {
    window[ilogkey] = new Image()
    window[ilogkey].onerror = () => {
      pushCacheFaileLog(params)
    }
    window[ilogkey].src = `${config.ilogUrl}${checkPath(params)}`
  })
}

function sendBeaconHandler(params: ILogType) {
  params.a = params.a || config.a
  params.ki = params.ki || 'app'
  if (!params.a) {
    // console.log('%c 未设置ilog a', 'color: red; font-size: 16px;font-weight: bold;')
    pushCacheFaileLog({ ...params, bt: Date.now() })
    return
  }
  params.e = params.e || env
  freeCallback(() => {
    window?.navigator?.sendBeacon(`${config.ilogUrl}${checkPath(params)}`);
  })
}

export { ilog, sendBeaconHandler, ilog as default }

