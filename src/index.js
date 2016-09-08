/**
 *
 * @description 入口文件
 *
 */
require('json-js/json2.js')

var util = require('./util')
var defaultSettings = require('./config')
var store = require('./store')
var Userdata = require('./userdata')
var Net = require('./net')
var Dispatcher = require('./dispatcher')
var Tracker = require('./tracker')
var LegacyDispatcher = require('./legacyDispatcher')
var Action = require('./action')
var win = require('./window')

function main(config) {
  var tracker = new ShadowTracker(config)
  var started = false
  var obj = {
    start: function() {
      if (started) {
        util.cw('tracker has started')
        return
      }
      if (config.enabled) {
        tracker.init()
        started = true
      }
    },
    config: config,
    /**
     * 一个简单的设置和获取userdata的方法
     * userdata()是获取所有的userdata
     * userdata(key) 获取某个key对应的data
     * userdata(key, val) 设置某个key对应的data
     *
     */
    userdata: function() {
      var argLength = arguments.length
      if (argLength == 0) {
        return tracker.userdata.get()
      }
      else if (argLength == 1) {
        var arg = arguments[0]
        if (util.isString(arg)) {
          return tracker.userdata.get(arg)
        }
      }
      else {
        tracker.userdata.set(arguments[0], arguments[1])
      }
    }
  }

  if (config.autoStart) {
    obj.start()
  }

  return obj
}

function ShadowTracker(cfg) {
  this.config = cfg
  this.userdata = new Userdata(cfg.userdata)

  this.actionMonitor = new Action(this.config, store)
  // 初始化不同的上报机制，主要是解决低版本浏览器不支持ajax跨域提交的问题
  this.dispatcher = util.isIE67() ? new LegacyDispatcher(this.config) : new Dispatcher(this.config)
  this.tracker = new Tracker(this.config, store, this.dispatcher, this.userdata, this.actionMonitor)
}

ShadowTracker.prototype = {
  init: function() {
    win.monitor(this.tracker)
    new Net(this.config, store, this.tracker)
  },

  /**
   * 立刻执行一个函数，并自动捕获函数中出现的异常。
   * @param  {Function} func 需要执行的函数
   * @param  {Object} self 函数中的this需要指定的对象
   * @param  {Params} params 不定个数的参数，作为要指定函数的实参传递进去，如果func是一个匿名函数或者无参函数，则不需要
   * @return {Mix} func的返回值
   */
  capture: function(func, self, params) { //eslint-disable-line
    util.cw('not realized :(')
    return
  },

  /**
   * 包装一个函数或者对象，主动捕获所有函数或者对象方法的异常
   * @param  {[type]} func [description]
   * @return {[type]}      [description]
   */
  watch: function(func) {
    util.cw('not realized :(')
    return
  }
}

// 需要先提供一个全局变量window.flexTracker = {}, 对象内容是配置信息
// window.flexTracker = {
//   token: 'token123-456-789',
//   net: true,
//   userdata: {
//     platform: 'desktop',
//     release: 12
//   },
//   compress: false
// }
if (util.isPlainObject(window.flexTracker)) {
  var userConfig = window.flexTracker
  if (!userConfig.token) {
    util.cw('token is must needed')
  }
  else {
    var config = Object.assign(defaultSettings, userConfig)
    window.flexTracker = main(config)
  }
}
