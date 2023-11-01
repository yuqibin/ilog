import type { ConfigType } from './type'
export const VIEW_ASM = 'vsm'
export const CLICK_ASM = 'csm'
import { ilog, sendBeaconHandler } from './ilog';
import { resendIntervaler } from './common';

const URL_MAP = {
  'dev': 'https://dev-api-operation.myyun.com/point/point.gif',
  'test': 'https://qa-api-operation.myyun.com/point/point.gif',
  'pre': 'https://pre-api-operation.myyun.com/point/point.gif',
  'prd': 'https://api-operation.myyun.com/point/point.gif',
}

// 未设置appid 上报失败的集合
const cacheFaileLog: any[] = []

let config: ConfigType = {
  a: '',
  longResourceTime: 30,
  longApiTime: 5,
  longTaskTime: 50,
  viewAsm: VIEW_ASM,
  clickAsm: CLICK_ASM,
  mode: 'dev',
  threshold: 0.5,
  ilogUrl: URL_MAP.dev,
  ba: '',
  resendInterval: 10 // 分钟m
}

// 重发失败的log
function resendCacheFaileLog() {
  const list = JSON.parse(JSON.stringify(cacheFaileLog))
  cacheFaileLog.length = 0
  // 清空发送失败的 ilog
  list.forEach((params: any) => {
    ilog(params)
  })
}
// 重发失败的log beacon方式
function resendCacheFaileLogByBeacon() {
  const list = JSON.parse(JSON.stringify(cacheFaileLog))
  cacheFaileLog.length = 0
  list.forEach((params: any) => {
    sendBeaconHandler(params)
  })
  cacheFaileLog.length = 0
}

function initIlogConfig(params: ConfigType) {
  config = { ...config, ...params }
  // for (let key of Object.keys(params)) {
  //   if (params[key] && Object.keys(params).indexOf(key) > -1) {
  //     config[key] = params[key]
  //   }
  // }
  if (!params.ilogUrl) {
    config.ilogUrl = URL_MAP[config.mode] || URL_MAP.dev
  }
  resendCacheFaileLog()
  // 开启定时重新发送失败的log
  resendIntervaler()
}

function getIlogConfig() {
  return { ...config }
}

function pushCacheFaileLog(data: any) {
  cacheFaileLog.push(JSON.parse(JSON.stringify(data)))
}

function clearCacheFaileLog() {
  cacheFaileLog.length = 0
}

function getCacheFaileLog() {
  return cacheFaileLog
}


export { getCacheFaileLog, clearCacheFaileLog, initIlogConfig, getIlogConfig, pushCacheFaileLog, resendCacheFaileLogByBeacon, resendCacheFaileLog, config, initIlogConfig as default }


