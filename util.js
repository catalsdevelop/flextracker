//基本的辅助函数
var obj={},
    types =["Array", "Boolean", "Date", "Number", "Object", "RegExp", "String", "Error", "Window", "HTMLDocument"];
//增加判断几种类型的方法
for(var i = 0,c; c = types[i ++ ];) { 
    obj['is'+c] = (function(type) {
        return function(obj) { 
            return Object.prototype.toString.call(obj) == "[object " + type + "]"; 
        } 
    })(c); 
}
/**
 * 判断是否简单对象类型对象直接量和new Object初始化的对象
 * @param  {Object}  o 要判断的对象
 * @return {Boolean}
 */
function isPlainObject(o) {
    var ctor,prot;

    if (obj.isObject(o) === false){
        return false;
    }

    //是否函数
    ctor = o.constructor;
    if (typeof ctor !== 'function'){
        return false;
    }
    //原型是否对象
    prot = ctor.prototype;
    if (obj.isObject(prot) === false){
        return false;
    }

    if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
    }

    return true;
};
//增加bind和extend
function bind(method ,self) {
    var slice = Array.prototype.slice;
    var args = slice.call(arguments, 2);
    return function(){
        var innerArgs = slice.call(arguments);
        return method.apply(self, args.concat(innerArgs));
    }
}
function extend(destination, source) {
    if(!isPlainObject(source)){
        return destination;
    }

    for (var property in source)
      destination[property] = source[property];
    return destination;
}

/**
 * 判断是否ie6-8
 * @return {Boolean}
 */
function isOldIE() {
    return !+[1,];
}
/**
 * 判断是否ie浏览器
 * @return {Boolean}
 */
function isIE() {
    // var ua = navigator.userAgent.toLowerCase();
    // return ua.indexOf('msie') >= 0 || ua.indexOf('trident') >= 0;
    return ("ActiveXObject" in window);
}

/**
 * 判断是否ie67
 * @return {Boolean}
 */
function isIE67(){
    var ua = navigator.userAgent;
    var isIE6 = ua.search(/MSIE 6/i) != -1;
    var isIE7 = ua.search(/MSIE 7/i) != -1;
    return isIE6 || isIE7;
}


/**
 * 左侧补零
 * @param  {Integer} num 需要补零的数值
 * @param  {Integer} n   补充的位数
 * @return {String}      补零后的字符串
 */
function pad(num, n) { 
    var len = String(num).length; 
    while(len < n) { 
        num = '0' + num; 
        len++;
    } 
    return num; 
}

/**
 * console.warn的简化版，如果浏览器不支持console，那么无需输出
 * @param {String} message 要输出的警告信息
 */
function cw(message){
    console && console.warn(message);
}

/**
 * 初始化一个namespace，并返回改对象的引用。比如可以ns('EagleEye.Track')，那么会给window对象增加一个window.EagleEye.Track。本函数不做属性的判断，会直接覆盖现有的对象。
 * @param  {String} namespace 符合属性命名标准的字符串
 * @return {Object} 初始化对象引用
 */
function ns(namespace){
    if (!namespace) {
        return;
    }

    if (!obj.isString(namespace)) {
        cw('namespace parameter must be a string');
        return;
    }

    var reg = /^[_a-zA-Z]\w*(\.[_a-zA-Z]\w*)*?$/;
    if(!reg.test(namespace)){
        cw('namespace has an incorrect format');
        return;
    }

    var hasSplit = namespace.indexOf('.') > -1,
        next = null,
        currentName=null;

    function exist(obj){
        return obj != undefined;
    }
    
    if(hasSplit){
        var nameSplits = namespace.split('.');
        // currentName = nameSplits.shift();
        next = window;
        while(currentName = nameSplits.shift()){
            var tmp = next[currentName];
            if(!exist(tmp)){
                next[currentName] = {};
            }
            next = next[currentName];
        }
        return next;
    }
    return window[namespace] = {};
}

/**
 * 返回全局的对象值，有值的话返回。
 * @param  {[type]} namespace 名字空间
 * @return {[type]}           
 */
function globalObjValue(namespace){
    try{
        return eval(namespace);
    }
    catch(e){
        return null;
    }
}

function addEvent(element, type, listener, capture){
    if(windwo.addEventListener){
        element.addEventListener(type, listener, capture || false);
    }
    else if(window.attachEvent){
        element.attachEvent('on'+type, listener);
    }
    //如果还要处理dom1 event类型，需要缓存用户原来设置的事件
}
function removeEvent(element, type, listener, capture){
    if(windwo.removeEventListener){
        element.removeEventListener(type, listener, capture || false);
    }
    else if(window.detachEvent){
        element.detachEvent('on'+type, listener);
    }
}

/**
 * 返回带时区的iso8601格式的utc时间
 * @return {[type]} [description]
 */
function getISODateNow(){
    var now = new Date;
    var timezone = - now.getTimezoneOffset();//这个单位是分钟，值是反的
    var tzStr = timezone >= 0 ? '+' : '-';
    tzStr += pad((timezone/60),2) +':'+ pad((timezone%60),2);
    
    var dateWithTimezone = new Date(now - 0 + timezone * 60 * 1000);
    return dateWithTimezone.getUTCFullYear()
            + '-' + pad( dateWithTimezone.getUTCMonth() + 1, 2)
            + '-' + pad( dateWithTimezone.getUTCDate(), 2)
            + 'T' + pad( dateWithTimezone.getUTCHours(), 2)
            + ':' + pad( dateWithTimezone.getUTCMinutes(), 2)
            + ':' + pad( dateWithTimezone.getUTCSeconds(), 2)
            + tzStr;
}

function indexOf(arr,val){
    if(isOldIE()){
        for(var i = 0;i<arr.length;++i){
            if(arr[i] == val){
                return i;
            }
        }
        return -1;
    }
    else{
        return Array.prototype.indexOf.call(arr, val);
    }
}


/**
 * 返回一个伪随机id参看这里http://www.jb51.net/article/40678.htm，跑了几个不同的实现，采取效率高一些的。
 * @return {String}
 */
function guid() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

var output = extend(obj,{
    isPlainObject:isPlainObject,
    extend:extend,
    bind:bind,
    isOldIE:isOldIE,
    isIE:isIE,
    isIE67:isIE67,
    pad:pad,
    ns:ns,
    cw:cw,
    guid:guid,
    addEvent:addEvent,
    removeEvent:removeEvent,
    indexOf:indexOf,
    isoDate:getISODateNow,
    globalObjValue:globalObjValue
});

module.exports = output;