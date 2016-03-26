/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-09 10:02:07
 * @description window.onerror上绑定异常监控
 *
 */
var util = require('./util');
/**
 * 负责绑定window上的全局错误，对于无法处理的异常会自动捕获，但是要注意[跨域问题](http://blog.bugsnag.com/script-error)。
 * @param  {Object} config 配置信息
 * @param  {Object} tracker 错误采集对象
 */
function errorBinder(config, tracker){
    var cfg = config();
    if (cfg.enabled && cfg.windowEnabled) {
        //不使用addEventListener，保证兼容性，但是要确保之前绑定的onerror事件可以正常运行。
        var oldOnError = window.onerror;
        var slice = Array.prototype.slice;
        window.onerror = function(message, file, line, column, innerError){
            //后4个参数，在跨域异常的时候，会有不同的数据。
            //file 在ie系列下面永远有数据，chrome非cors没有数据，ff都有
            //line 非cors都没有，但是ie通过window.event可以获取
            //column ie没有这个参数，其他同上
            //innerRrror ie下没有，chrome只有.name .message .stack三个属性，ff下还包含.fileName .lineNumber .columnNumber额外三个属性，跨域策略同上 
            var args = slice.call(arguments);
            if(oldOnError){
                oldOnError.apply(window,args);
            }
            tracker['catch'](flatError.apply(window,args), 'window');
            return false;//确保控制台可以显示错误
        }
    }
}

/**
 * 抹平不同浏览器下面全局报错的属性值，尽可能多的提供错误信息
 * @param  {[type]} message    [description]
 * @param  {[type]} file       [description]
 * @param  {[type]} line       [description]
 * @param  {[type]} column     [description]
 * @param  {[type]} innerError [description]
 * @return {[type]}            [description]
 */
function flatError(message, file, line , column, innerError){
    //ie10-全部通过window.event获取 todo ie10+需要验证是否和ie10-一样
    var stack=null;

    if (util.isIE()) {
        var evt = window.event;
        message = message || evt.errorMessage;
        file = file || evt.errorUrl;
        line = line || evt.errorLine;
        column = column || evt.errorCharacter;
    }
    else{
        file = file || (innerError && innerError.fileName) || null;
        line = line || (innerError && innerError.lineNumber) || null;
        column = column || (innerError && innerError.columnNumber) || null;
        stack = (innerError && innerError.stack) || null;
    }

    return {
        message:message,
        file:file,
        line:line,
        column:column,
        stack:stack
    };
}

var output = {
    monitor:errorBinder
}

module.exports = output;