import { config } from './config'
import { ilog } from './ilog'
// import { nextTick } from './next-tick'
const { threshold } = config
const THRESHOLD = typeof threshold === 'number' && threshold >= 0 && threshold <= 1 ? threshold : 0.5
const options = {
  root: null,
  rootMargin: '0px',
  threshold: THRESHOLD
}

interface entryType {
  entry: any
  target: any
  ob: any
}
function observeHandler({ entry, target, ob }: entryType) {
  // console.log('intersection', target, entry.intersectionRatio)
  if (entry.intersectionRatio >= THRESHOLD) {
    const code = target.getAttribute(config.viewAsm)
    // target.style.boxShadow = 'red 20px 0px 20px 0px'
    ilog({
      asm: code,
      et: 'view',
      ki: 'app'
    })
    // 曝光后移除监听 移除属性
    ob.unobserve(target)
    target.removeAttribute(`${config.viewAsm}`)
  }
}

// img处理器 times 重复尝试次数 超过次数将不在处理该图片埋点
function imgCompleteHandler({ entry, target, ob }: entryType, times: number = 1) {
  if (target?.complete) {
    observeHandler({
      entry,
      target,
      ob
    })
    return
  }
  if (times > 0) {
    times--
    setTimeout(() => {
      // ob.observe(target)
      imgCompleteHandler({ entry, target, ob }, times)
    }, 500)
    return
  }
  // ob.disconnect()
  ob.unobserve(target)
}

const iscObserver = new IntersectionObserver(async function (entries, ob) {
  // await nextTick()
  entries.forEach(async function (entry: any) {
    const { target } = entry

    if (target?.tagName.toLowerCase() === 'img') {
      imgCompleteHandler({ entry, target, ob }, 1)
      return
    }
    observeHandler({
      entry,
      target,
      ob
    })
  })
}, options)

export { iscObserver as default, iscObserver }


