/**
 *
 * @description 针对不支持ajax 跨域提交的dispatcher
 *
 */

var util = require('./util')
var dispatcher = require('./dispatcher')

function object(o) {
  var F = function () {}
  F.prototype = o
  return new F()
}

function LegacyDispacther(config) {
  dispatcher.call(this, config)
}
LegacyDispacther.prototype = object(dispatcher.prototype)
LegacyDispacther.prototype.constructor = LegacyDispacther


var queue = []
function autoSend(url, method) {
  if (!!document.body) {
    var item
    while (item = queue.shift()) {
      iframePost(url, method, item)
    }
  }
  else {
    setTimeout(util.bind(autoSend, null, url, method), 20)
  }
}

function iframePost(url, method, data) {
  var iframe = document.createElement('iframe')
  iframe.name = 'framePost-' + util.guid()
  iframe.style.display = 'none'
  document.body.appendChild(iframe)
  iframe.contentWindow.name = iframe.name

  var form = document.createElement('form')
  form.enctype = 'application/x-www-form-urlencoded'
  form.action = url
  form.method = method
  form.target = iframe.name
  var input = document.createElement('input')
  input.name = 'info'
  input.type = 'hidden'
  if (util.isString(data)) {
    input.value = data
  }
  else {
    input.value = JSON.stringify(data)
  }
  form.appendChild(input)
  document.body.appendChild(form)

  iframe.attachEvent('onload', function() {
    iframe.detachEvent('onload', arguments.callee)
    document.body.removeChild(form)//todo 这里会有leak么？
    form = null
    document.body.removeChild(iframe)
    iframe = null
  })

  form.submit()
}

LegacyDispacther.prototype.sendError = function(info) {
  var endPoint = this.endPoint(this.config.token)
  queue.push(info)
  autoSend(endPoint, 'post')
}

module.exports = LegacyDispacther
