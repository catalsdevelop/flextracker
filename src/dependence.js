/**
 *
 * @description 增加依赖检测
 *
 */

var util = require('./util')

function popLibVersion() {
  var arr = [], v
  var kvp = [
    ['jQuery', 'jQuery.fn.jquery'],
    ['jQuery ui', 'jQuery.ui.version'],
    ['lodash(underscore)', '_.VERSION'],
    ['Backbone', 'Backbone.VERSION'],
    ['knockout', 'ko.version'],
    ['Angular', 'angular.version.full'],
    ['React', 'React.version'],
    ['Vue', 'Vue.version'],
    ['Ember', 'Ember.VERSION'],
    ['Moment', 'moment.version'],
    ['SeaJS', 'seajs.version']
  ]

  for (var i = 0; i < kvp.length; ++i) {
    var version = util.globalObjValue(kvp[i][1])
    if (version != null) {
      arr.push([kvp[i][0], version])
    }
  }
  return arr
}

module.exports = {
  all: function() {
    var result = []
    var filter = 'jQuery _ Backbone ko angular React Vue Ember moment seajs'
    for (var p in window) {
      if (filter.indexOf(p) === -1) {
        var version = null
        var item = window[p]
        try {
          if (item) {
            version = item.version || item.Version || item.VERSION
          }
          if (version) {
            result.push([p, version])
          }
        }
        catch(e) {}
      }
    }
    return result.concat(popLibVersion())
  }
}
