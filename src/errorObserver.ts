import { freeCallback } from './common'
import { ilog } from './ilog'
/**
 * try catch 只能捕获代码常规的运行错误，语法错误和异步错误不能捕获到
 * window.onerror 可以捕获常规错误、异步错误，但不能捕获资源错误
 * addEventListener error  捕获静态资源加载错误
 * unhandledrejection  promise 错误
 * vue react 错误
 */

/**
 * @param { string } message 错误信息
 * @param { string } source 发生错误的脚本URL
 * @param { number } lineno 发生错误的行号
 * @param { number } colno 发生错误的列号
 * @param { object } error Error对象
 * message, source, lineno, colno, error
 */
function onerrorFn() {
  // stack
  window.onerror = function (message, source, lineno, colno, error) {
    // console.log('onerror 捕获错误：', { error }, typeof message)
    ilog({
      ki: 'err',
      ext: {
        errType: 'jsErr',
        filename: source, // 需要结合source map 定位编译前文件位置
        position: `${lineno}.${colno}`,
        message: typeof message === 'string' ? message : '',
        stack: error?.stack?.slice(0, 100)
      }
    })
  }
}

/**
 * isTrusted  是否有用户引起
 * path 路径
 * target Element
 */
function resourceErrListener(error: any) {
  const { target } = error
  // 资源错误
  if (target?.src || target?.href) {
    ilog({
      ki: 'err',
      ext: {
        errType: 'resourceErr',
        filename: target?.src || target?.href,
        tagName: target?.tagName.toLowerCase()
      }
    })
  }
}

// promise 错误  没什么暖用
function unhandledrejectionFn(e: any) {
  // console.log('捕获到异常', { e })
  // preventDefault阻止传播，不会在控制台打印
  e.preventDefault()
}

function errorObserveRun() {
  onerrorFn()
  window.addEventListener('error', resourceErrListener)
  window.addEventListener('unhandledrejection', unhandledrejectionFn)
}

function vueErrorHandle(err: any) {
  ilog({
    ki: 'err',
    ext: {
      errType: 'jsErr',
      message: err?.message,
      stack: err?.stack
    }
  })
}

function removeListener() {
  window.removeEventListener('unhandledrejection', unhandledrejectionFn)
  window.removeEventListener('error', resourceErrListener)
}

export { errorObserveRun, vueErrorHandle, removeListener, errorObserveRun as default }

