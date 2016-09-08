/**
 *
 * @description 错误信息发送
 *
 */

var util = require('./util')

// 加载先检测是否https和是否支持cors xmlhttprequest
var https = window.location.protocol.indexOf('https') > -1 ? true : false

var supportCors = function() {
  if (util.isIE67()) {
    return false
  }
  return 'withCredentials' in new XMLHttpRequest
}()

function dispatcher(config) {
  this.config = config
}

dispatcher.prototype = {
  /**
   * 根据页面协议选择发送到http还是https
   * @return {String} 要发送的地址
   */
  endPoint: function() {
    return (https ? 'https://' : 'http://') + this.config.settings.reportPath + '?token=' + this.config.token + '&'
  },
  sendError: function(info) {
    var endPoint = this.endPoint(this.config.token)
    var xhr = getXHR(endPoint)
    if (util.isString(info)) {
      xhr.send(info)
    }
    else {
      xhr.send(JSON.stringify(info))
    }
  }
}

function getXHR(url) { // todo ie6-7直接用form提交请求实现，并且减少提交的数据
  var xmlHttp
  if (supportCors) { // ie9+, chrome, ff
    xmlHttp = new XMLHttpRequest()
  }
  else if (XDomainRequest) { // ie10-
    xmlHttp = new XDomainRequest()
  }
  else { // ie8-
    xmlHttp = null
  }

  xmlHttp.open('post', url, true)
  // XMLDomainRequest不支持设置setRequestHeader方法
  xmlHttp.setRequestHeader && xmlHttp.setRequestHeader('Content-Type', 'text/plain')
  return xmlHttp
}

module.exports = dispatcher
