/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-09 13:22:09
 * @description 入口函数
 *
 */

var util = require('./util');
var config = require('./config');

;(function(){

    var tracker;//内部的tracker变量
    function init(){
        tracker = ns('EagleEye.Tracker');
    }

    /**
     * 
     * @return {[type]} [description]
     */
    function bindOnErrorEvent(){
        var oldOnError = window.onerror;
        if (oldOnError) {
            window.onerror = function(){
                oldOnError.apply(window,arguments);
                holdError.apply(null, arguments);//todo 此处this需要再确定一下
                return false;//确保控制台可以继续显示错误
            }
        }
    }

    function holdError(message, file, line, column, error){

    }

    /**
     * 直接监控一个异常
     * @param  {Error} error 要求必须使用try...catch...语句里面catch到的异常对象
     */
    function track(error){
        if(tc.isError(error)){
            throw error;//直接交给onerror处理，由于这个error对象在不同平台上差异太大，而且在ie9-无法获取到行列号，在chrome平台只能获取到message和stack
        }
        else{
            cw('param error is not an Error type');
        }
    }

    /**
     * 立刻执行一个函数，并自动捕获函数中出现的异常。
     * @param  {Function} func 需要执行的函数
     * @param  {Object} self 函数中的this需要指定的对象
     * @param  {Params} params 不定个数的参数，作为要指定函数的实参传递进去，如果func是一个匿名函数或者无参函数，则不需要
     * @return {Mix} func的返回值
     */
    function capture(func, self, params){
        try{
            var argLength = arguments.length;
            if(argLength == 1){
                return func();
            }
            else if(argLength == 2){
                return func.apply(self);
            }
            else if(argLength >= 3){
                return func.apply(self, Array.prototype.slice.call(arguments,2));
            }
        }
        catch(e){
            track(e);
        }
    }

    /**
     * 包装一个函数返回
     * @param  {[type]} func [description]
     * @return {[type]}      [description]
     */
    function watch(func){}
})();