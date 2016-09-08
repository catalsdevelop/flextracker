/**
 *
 * @description 记录页面上用户的操作信息
 *
 */
var util = require('./util')

function action(config, store) {
  this.data = []
  this.store = store
  if (config.action) {
    this.needRecordClickSelectors = ['a', 'button', 'input[button]', 'input[submit]', 'input[radio]', 'input[checkbox]']
    this.needRecordChangeSelectors = ['input[text]', 'input[password]', 'textarea', 'select']
    this.init()
  }
}

action.prototype = {
  init: function() {
    var clickHandler = util.bind(this.eventHandler, this, 'click', this.needRecordClickSelectors)
    var inputHandler = util.bind(this.eventHandler, this, 'input', this.needRecordChangeSelectors)
    if (window.addEventListener) {
      document.addEventListener('click', clickHandler, true) // 标准浏览器在捕获阶段触发
      document.addEventListener('blur', inputHandler, true)
    }
    else if (window.attachEvent) {
      document.attachEvent('onclick', clickHandler)
      document.attachEvent('onfocusout', inputHandler) // document内部有元素发生blur就会触发
    }
  },
  /**
   * 页面点击或者时区焦点时触发，该函数绑定了动作
   * @param  {String} action 'click' or 'input'
   * @param {String} selectorFilter 要过滤的标签类型
   * @param  {Event} evt    事件对象
   */
  eventHandler: function(action, selectorFilter, evt) {
    var target = evt.target || evt.srcElement
    if (target == document || target == window || target == document.documentElement || target == document.body) {
      return
    }
    var tag = target.tagName.toLowerCase()
    if (this.accept(target, selectorFilter)) {
      this.record(target, tag, action)
    }
  },
  /**
   * 查看某个元素是否在要监控的元素类型列表中
   * @param  {HTMLElement} element  要检测的元素
   * @param  {String} selector      元素列表字符串
   * @return {Boolean}              检测结果
   */
  accept: function(element, selector) {
    var tag = element.tagName.toLowerCase()
    if (tag === 'input' && element.type) {
      tag += '[' + element.type + ']'
    }
    return util.indexOf(selector, tag) > -1
  },

  /**
   * 返回一个元素对应的attributes
   * @param  {HTMLElement} element 要获取元素的属性
   * @return {Object}         key-value形式的对象
   */
  attributes: function(element) {
    var result = {}
    var attributes = element.attributes
    // 在ie6-7下面，会获取到很多内置的attribute，使用specified属性来区分，在版本浏览器下，都会输出正确的属性，同时specified也是true。不保存非checkbox、radio的value属性的信息
    var len = attributes.length
    for (var i = 0; i < len; ++i) {
      var item = attributes[i]
      if (item.specified) {
        if (item.name == 'value' && this.accept(element, ['textarea', 'input[text]', 'input[password]'])) {
          continue
        }
        result[item.name] = item.value
      }
    }
    return result
  },

  /**
   * 根据不同的元素，记录不同的内容，input[password]不记录value，input[text]和textarea只记录文本长度，input[checkbox]、input[radio]需要记录value和checked属性，select记录选中的value和index
   * @param  {HTMLElement} target
   * @param  {String} lowercaseTagName 小写的标签tag
   * @param  {String} action           动作标示，'click','input'
   * @return {String}                  成功返回这个log的guid
   */
  record: function (element, lowercaseTagName, action) {
    var attributes = this.attributes(element)
    var log = {
      tag: lowercaseTagName,
      action: action,
      time: util.isoDate(),
      attribute: attributes,
      extra: {}
    }
    if (lowercaseTagName === 'input') {
      switch (element.type) {
        case 'text':
          log.extra.length = element.value.length
          break
        case 'checkbox':
        case 'radio':
          log.extra.checked = element.checked
          break
      }
    }
    else if (lowercaseTagName === 'textarea') {
      log.extra.length = element.value.length
    }
    else if (lowercaseTagName === 'select') {
      log.extra.selectedIndex = element.selectedIndex
      log.extra.value = element.value
    }
    return this.store.add(log, 'act')
  }
}

module.exports = action
