/**
 *
 * @description 保存用户自定义数据类型
 *
 */

var util = require('./util')

function userdata(data) {
  this.data = data || {}
}

userdata.prototype = {
  /**
   * 设置配置信息
   * @param  {Mix} params 参数有2种情况，不满足条件的都会被discard
   *
   * 1.  {Object} params 直接将参数对象合并到配置中
   *
   * 2.  {String} p1 要设置的key
   *     {Mix}    p2 对应的数值
   */
  set: function() {
    var argLength = arguments.length

    switch (argLength) {
      case 1:
        if (util.isObject(arguments[0])) {
          Object.assign(this.data, arguments[0])
        }
        break
      case 2:
        this.data[arguments[0]] = arguments[1]
        break
    }
  },

  /**
   * 根据key返回value值
   * @param  {String} key
   * @return {Mix}    与key对应的配置信息，没有的话返回null
   */
  get: function(key) {
    if (arguments.length == 0) {
      return this.data
    }
    return this.data[key] || null
  },

  /**
   * 删除key对应的数据
   * @param  {String} key
   */
  remove: function(key) {
    delete this.data[key]
  },

  /**
   * 清空所有数据
   */
  clear: function() {
    this.data = {}
  }
}

module.exports = userdata
