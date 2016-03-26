/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-10 14:55:09
 * @description 处理异常模块
 *
 */

var util = require('./util');
var env = require('./environment');

/**
 * 根据堆栈的长度，截断多余的堆栈信息
 * @param  {String} stack  原始堆栈
 * @param  {Integer} maxDepth 最大堆栈长度
 * @return {String}        截断后的堆栈
 */
function subStack(stack, maxDepth){
    if(!stack){
        return null;
    }
    
    var arr = stack.toString().split('\n');
    var stackDepth =arr.length;
    if(stackDepth > maxDepth)
    {
        return arr.slice(0,maxDepth).join('\n');
    }
    return stack;
}

function getErrorKey(error){
    return [error.message, error.file || 'null', error.line || 'null', error.col || 'null'].join('---');
}

/**
 * 异常信息处理器
 * @param  {Object} cfg        配置信息
 * @param  {Object} store      存储库
 * @param  {Object} dispatcher 发送器
 * @param  {Object} actionMonitor 行为捕捉器
 */
var tracker = function(cfg, store, dispatcher, userdata, actionMonitor){
    this.config = cfg;
    this.store = store;
    this.dispatcher = dispatcher;
    this.userdata = userdata;
    this.action = actionMonitor;
    this.lastError=null;//上一个出错信息，{key:{message}--{file}--{line}--{column},time:}
}

tracker.prototype = {
    /**
     * 捕获某个类型的异常，处理并发送请求
     * @param  {Object} error 错误信息
     * @param  {String} type  异常类型，有window,xhr,catch三种，分别对应window.onerror捕获,hook xhr捕获和主动try,catch捕获
     */
    'catch':function(error,type){
        type = type.toLowerCase();
        var info = {
            source:type,
            environment:env.all(),
            url:location.href,
            time:util.isoDate(),
            token:this.config.token
        };

        switch(type){
            case 'window':
                error.stack = subStack(error.stack, this.config.settings.maxStackDepth);
                info.error = error;
            break;
            case 'xhr'://暂未实现
            break;
            case 'catch'://手动触发
            break;
        }
        this.report(info);
    },
    /**
     * 发送错误报告，对要发送的内容有相应的的筛选规则
     * @param  {Object} info 报告主体
     */
    report:function(info){
        var key = getErrorKey(info.error);
        if(this.lastError && key == this.lastError.key){//对发送的错误做一定的筛选
            var lastErrorReportTime = new Date(this.lastError.time);//todo 查看ie6-7下面是否支持iso格式的时间格式化
            var timespan = new Date() - lastErrorReportTime;
            if(timespan <= this.config.settings.maxErrorToleranceAge){
                this.store.clear();
                return;
            }

            // var errorMessage = info.error.message.toLowerCase();
            // //非同源脚本错误只能得到'Script error'，这种错误如果短时间内获取到很多的话，只发送一定间隔内的。
            // if(errorMessage.indexOf('script error') > -1 && !info.error.file){
            //     var lastTime = new Date(lastError.time);
            //     if(lastTime - new Date){

            //     }
            // }
        }
        //加载额外的信息,verison/userdata必带，operation看配置需求
        info.userdata = this.userdata.get();
        info.version = this.config.settings.version;
        var cfg = this.config();
        if(cfg.action){
            util.extend(info,{operation:this.action.all()})
        }
        this.store.clear();
        // console.dir(this.dispatcher);
        this.dispatcher.sendError(info);
        this.lastError = {
            key:key,
            time:info.time
        };
    }
}
module.exports = tracker;