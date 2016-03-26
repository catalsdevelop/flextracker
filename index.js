/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-11 15:01:36
 * @description 入口文件
 *
 */
var json = require('./json');
var util = require('./util');
var config = require('./config');
var store = require('./store');
var Userdata = require('./userdata');
var Dispatcher = require('./dispatcher');
var Tracker = require('./tracker');
var legacyDispatcher = require('./legacyDispatcher');
var Action = require('./action');
var win = require('./window');

var main = function(token, options, udata){
    config.token = token || null;
    config(options);
    var tracker = new innerTracker(config, udata);
    return {
        run:util.bind(tracker.init, tracker),
        config:config,
        userdata:function(){
            var argLength = arguments.length;
            if(argLength == 0){
                return tracker.userdata.get();
            }
            else if(argLength == 1){
                var arg = arguments[0];
                if(util.isString(arg)){
                    return tracker.userdata.get(arg);
                }
                return tracker.userdata.set(arg);
            }
            else{
                return tracker.userdata.set(arg);
            }
        }
    }
}

function innerTracker(cfg, ud){
    this.config = cfg;
    this.userdata = new Userdata();
    this.userdata.set(ud || null);

    this.actionMonitor = new Action(this.config, store);
    this.dispatcher = util.isIE67() ? new legacyDispatcher(this.config) : new Dispatcher(this.config);
    this.tracker = new Tracker(this.config, store, this.dispatcher, this.userdata, this.actionMonitor);
}

innerTracker.prototype = {
    init:function(){
        win.monitor(this.config, this.tracker);
    },
        /**
     * 立刻执行一个函数，并自动捕获函数中出现的异常。
     * @param  {Function} func 需要执行的函数
     * @param  {Object} self 函数中的this需要指定的对象
     * @param  {Params} params 不定个数的参数，作为要指定函数的实参传递进去，如果func是一个匿名函数或者无参函数，则不需要
     * @return {Mix} func的返回值
     */
    capture:function(func, self, params){
        util.cw('not realized :(');
        return;
        // try{
        //     var argLength = arguments.length;
        //     if(argLength == 1){
        //         return func();
        //     }
        //     else if(argLength == 2){
        //         return func.apply(self);
        //     }
        //     else if(argLength >= 3){
        //         return func.apply(self, Array.prototype.slice.call(arguments,2));
        //     }
        // }
        // catch(e){
        //     track(e);
        // }
    },

    /**
     * 包装一个函数或者对象，主动捕获所有函数或者对象方法的异常
     * @param  {[type]} func [description]
     * @return {[type]}      [description]
     */
    watch:function(func){
        util.cw('not realized :(');
        return;
    }
}

util.ns('eagleeye.tracker');
eagleeye.tracker = main;