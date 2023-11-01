import { config } from './config'
import { iscObserver } from './intersectionObserver'
import { isIE, isNative } from './env'
// import { nextTick } from './next-tick'

function isVisible(node: any) {
  return (
    node?.nodeType === 1 &&
    node?.style?.display !== 'none' &&
    node?.style?.visibility !== 'hidden' &&
    node?.style?.opacity !== '0'
  )
}

function parseNode(el: Element) {
  if (!isVisible(el) || el.getAttribute('ilog_intersectionObserver_tag')) {
    return
  }
  el.setAttribute('ilog_intersectionObserver_tag', '1')
  iscObserver.observe(el)
}

// childList 变化
function collectTargets() {
  const els = Array.from(
    document.querySelectorAll(`[${config.viewAsm}]`)
  ).filter(el => el?.getAttribute(`${config.viewAsm}`))

  if (els.length > 0) {
    els.forEach(el => parseNode(el))
  }
}

declare global {
  interface Window {
    MyyLog0001: any
    WebKitMutationObserver?: MutationObserver
    MozMutationObserver?: MutationObserver
  }
}

const observer = new (window.MutationObserver ||
  window.WebKitMutationObserver ||
  window.MozMutationObserver)(async function (mutations) {
  mutations.forEach(async function (mutation) {
    const { target } = mutation
    if (mutation.type === 'childList' && mutation?.addedNodes?.length) {
      collectTargets()
    } else if (
      mutation.type === 'attributes' &&
      (target as Element)?.getAttribute(`${config.viewAsm}`)
    ) {
      parseNode(target as Element)
    }
  })
})

// 待解决  subtree + childList重复遍历
const options = {
  subtree: true, // 监听所有子元素
  attributes: true, // 监听属性变化
  childList: true,
  attributeFilter: [`${config.viewAsm}`, 'style'] // 监听属性变化的范围
  // characterData: true
}
const isCanUseMutationObserver =
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]')

const isCanUseIntersectionObserver =
  !isIE &&
  typeof IntersectionObserver !== 'undefined' &&
  (isNative(IntersectionObserver) ||
    IntersectionObserver.toString() ===
      '[object IntersectionObserverConstructor]')

function mutationRun() {
  if (isCanUseMutationObserver && isCanUseIntersectionObserver) {
    observer.observe(document.body, options)
  }
}

function removeMutation() {
  if (isCanUseMutationObserver && isCanUseIntersectionObserver) {
    observer.disconnect()
    iscObserver.disconnect()
  }
}

export { mutationRun as default, removeMutation, mutationRun }

