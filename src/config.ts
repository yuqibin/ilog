import type { ConfigType } from './type'
export const VIEW_ASM = 'vsm'
export const CLICK_ASM = 'csm'
import { resendIntervaler } from './common';


let config: ConfigType = {
  a: '',
  longResourceTime: 100,
  longApiTime: 100,
  longTaskTime: 1000,
  viewAsm: VIEW_ASM,
  clickAsm: CLICK_ASM,
  mode: 'dev',
  threshold: 0.5,
  ilogUrl: '',
  ba: '',
  resendInterval: 10 // 分钟m
}

function initIlogConfig(params: ConfigType) {
  config = { ...config, ...params }
  // for (let key of Object.keys(params)) {
  //   if (params[key] && Object.keys(params).indexOf(key) > -1) {
  //     config[key] = params[key]
  //   }
  // }
  if (!params.ilogUrl) {
    console.error('ilogUrl is must !')
    return
  }

  // 开启定时重新发送失败的log
  resendIntervaler()
}

function getIlogConfig() {
  return { ...config }
}



export { initIlogConfig, getIlogConfig, config, initIlogConfig as default }


