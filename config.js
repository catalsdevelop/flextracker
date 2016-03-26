/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-07 14:02:07
 * @description 配置信息模块
 *
 */
var util = require('./util.js');
/**
 * 内部配置信息
 * @type {Object}
 */
var settings = {
    version:'0.0.1',//版本号有助于不同版本的数据格式
    maxStackDepth:10,//错误堆栈最大深度
    storeCapacity:20,//存储仓库最大
    reportPath:'nodejs.catals.com/catch',
    maxErrorToleranceAge:1000//最大错误允许间隔（单位：ms），小于这个间隔的同类错误将被抛弃
}
/**
 * 默认的配置信息
 * @type {Object}
 */
var defaults = {
    enabled:true,//是否可用
    windowEnabled:true,//监听window.onerror事件，如果需要完全手动监听，可以设置成false
    action:true,//是否监控并发送用户操作信息
    hook:true,//是否增加hook，把setTimeout/setInterval/requestAnimationFrame和add/removeEventListener给wrap一层
    net:true,//是否hook ajax请求
    ignoreErrors:[],
    ignoreUris:[]
}
/**
 * 设置或者返回配置信息
 * @param  {Mix} params 参数有3种情况，不满足条件的都会被discard
 * 
 * 1.  参数为空，返回所有的配置信息
 * 
 * 2.  {String} params 返回这个key对应的配置信息
 *     or
 *     {Object} params 遍历这个param，并设置key-value到config对应的信息中
 * 
 * 3.  {String} p1 要设置的key
 *     {Mix}    p2 对应的数值
 * 
 * @return {Mix} 根据params的不同，亦有不同的返回值
 */
function config(){
    var tmp = util.extend({},defaults);
    return function(params){
        var argLength = arguments.length;
        switch(argLength){
            case 0:
                return tmp;
            break;
            case 1:
                var arg = arguments[0];
                if (util.isString(arg)) {
                    return tmp[arg] || null;
                }
                else if(util.isObject(arg)){
                    for(var p in arg){
                        if(defaults.hasOwnProperty(p)){
                            tmp[p] = arg[p];
                        }
                    }
                }
            break;
            case 2:
                if(defaults.hasOwnProperty(arguments[0])){
                    tmp[arguments[0]] = arguments[1];
                }
            break;
        }
    }
}

var output = config();

output.defaults = defaults;
output.settings = settings;

module.exports = output;