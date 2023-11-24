import { ilog, sendBeaconHandler } from './ilog';

// 未设置appid 上报失败的集合
const cacheFaileLog: any[] = []
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

function pushCacheFaileLog(data: any) {
  cacheFaileLog.push(JSON.parse(JSON.stringify(data)))
}

function clearCacheFaileLog() {
  cacheFaileLog.length = 0
}

function getCacheFaileLog() {
  return cacheFaileLog
}
export { getCacheFaileLog, clearCacheFaileLog, pushCacheFaileLog, resendCacheFaileLogByBeacon, resendCacheFaileLog, }
export default {}

