/**
 *
 * @description 记录基本的浏览器版本、停留时间等信息
 *
 */

var landOn = new Date() // 尽量早初始化这个函数，确保停留时间准确
var environment = {
  all: function() {
    return {
      vw: (document.documentElement ? document.documentElement.clientWidth : document.body.clientWidth),
      vh: (document.documentElement ? document.documentElement.clientHeight : document.body.clientHeight),
      // ua: navigator.userAgent,
      age: new Date() - landOn
    }
  }
}

module.exports = environment
