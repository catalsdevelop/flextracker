/**
 * 捕获ajax请求中的参数
 */

var util = require('./util')

var Net = function(config, store, tracker) {
  this.config = config
  this.store = store
  this.tracker = tracker
  if (this.config.net) {
    this.init()
  }
}

Net.prototype = {
  init: function() {
    if (window.XMLHttpRequest) {
      this.hook(window.XMLHttpRequest)
    }
    if (window.XDomainRequest) {
      this.hook(window.XDomainRequest)
    }
  },
  hook: function(klass) {
    var open = klass.prototype.open
    var send = klass.prototype.send
    var self = this
    // 重写open和send，获取需要的参数
    klass.prototype.open = function(method, url) {
      this._track = { //直接绑到xhr上
        method: method.toLowerCase(),
        url: url
      }
      return open.apply(this, arguments)
    }

    klass.prototype.send = function() {
      this._track.id = self.store.add({
        start: util.isoDate(),
        method: this._track.method,
        url: this._track.url
      }, 'net')

      self.registerComplete(this) // this = xhr
      return send.apply(this, arguments)
    }
  },
  registerComplete: function(xhr) {
    var self = this

    if (xhr.addEventListener) {
      xhr.addEventListener('readystatechange', function() {
        if (xhr.readyState == 4) {
          self.checkComplete(xhr)
        }
      }, true)
    }
    else {
      setTimeout(function() {
        var onload = xhr.onload
        xhr.onload = function () {
          self.checkComplete(xhr)
          return onload.apply(xhr, arguments)
        }

        var onerror = xhr.onerror
        xhr.onerror = function () {
          self.checkComplete(xhr)
          return onerror.apply(xhr, arguments)
        }
      }, 0)
    }
  },
  checkComplete: function(xhr) {
    if (xhr._track) {
      var track = this.store.get(xhr._track.id)
      if (track) {
        var info = track.value
        info.finish = util.isoDate()
        // http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
        info.statusCode = (xhr.status == 1223 ? 204 : xhr.status)
        info.statusText = (xhr.status == 1223 ? 'No Content' : xhr.statusText)

        if (xhr.status >= 400 && xhr.status != 1223) { // 如果发现的xhr的错误，就上报，但是这条数据不出现在日志中，只作为错误上报
          this.store.remove(xhr._track.id)
          this.tracker['catch'](info, 'xhr')
        }
      }
    }
  }
}

module.exports = Net
