/**
 *
 * @description 配置信息模块
 *
 */

/**
 * 内部配置信息
 * @type {Object}
 */
var settings = {
  version: '0.2.0',  // 版本号有助于后端处理不同版本的数据格式，不同版本之前可能会出现数据类型的差异
  maxStackDepth: 10, // 错误堆栈最大深度
  reportPath: 'www.example.com/catch', // 这是服务器提交的地址，根据自己的情况设置
  maxReportCount: 200, // 最大错误数量，超过这个数就不发送了
  maxErrorToleranceAge: 1000 // 最大错误允许间隔（单位：ms），小于这个间隔的同类错误将被抛弃
}

/**
 * 默认的配置信息
 * @type {Object}
 */
var defaults = {
  enabled: true,      // 是否可用，关闭以后不再捕获和发送错误信息
  action: true,       // 是否监控并发送用户操作信息
  hook: true,         // 是否增加hook，把setTimeout/setInterval/requestAnimationFrame和add/removeEventListener给wrap一层
  net: true,          // 是否hook ajax请求
  dependence: true,   // 是否发送页面上的依赖库信息，默认会有几个内置流行库的检测，剩余的通过遍历window对象获取
  compress: true,     // 是否压缩提交的数据，使用https://github.com/pieroxy/lz-string 整体性价比兼容性都比较靠谱
  autoStart: true,    // 自动开始，不想自动开始的话就设置成false，然后手动start
  report: {
    delay: 5000       // 报告发送的延迟时间(单位ms)，如果一个时间段内有很多报告产生，那么就放到一起发送
  },
  ignoreErrors: [],   // 可忽略的错误
  ignoreUrls:[],      // 可忽略的url，那些产生错误的url
  settings: settings
}

module.exports = defaults
