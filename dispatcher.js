/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-11 12:47:42
 * @description 错误发送模块
 *
 */

var util = require('./util');

//加载先检测是否支持https和cors xmlhttprequest
var https = window.location.protocol.indexOf('https') > -1 ? true : false;
var supportCors = function(){
    if(util.isIE67()){
        return false;
    }
    return 'withCredentials' in new XMLHttpRequest;
}();

function dispatcher(config){
    this.config = config;
}

dispatcher.prototype = {
    /**
     * 根据页面协议选择发送到http还是https
     * @return {String} 要发送的地址
     */
    endPoint:function(){
        return (https ? 'https://' : 'http://') + this.config.settings.reportPath + '?token='+ this.config.token +'&';
    },
    sendError:function(info){
        if(!this.config.token){
            util.cw('tracker can not report error without a token');
            return;
        }
        var endPoint = this.endPoint(this.config.token);
        var xhr = getXHR(endPoint);
        // xhr.onreadystatechange = function(){
        // }
        xhr.send(JSON.stringify(info));
    }
}

function getXHR(url){//todo ie6-7直接用form提交请求实现，并且减少提交的数据
    var xmlHttp;
    if(supportCors){//ie9+,chrome,ff
        xmlHttp = new XMLHttpRequest();
    }
    else if(XDomainRequest){//ie10-
        xmlHttp = new XDomainRequest();
    }
    else{//ie8-
        xmlhttp = null;
    }

    xmlHttp.open('post', url, true);
    //XMLDomainRequest不支持设置setRequestHeader方法
    xmlHttp.setRequestHeader && xmlHttp.setRequestHeader("Content-Type", "text/plain");
    return xmlHttp;
}

function object2Query(obj){
    var data = [];
    for(var p in obj){
        if(object.hasOwnProperty(p)){
            data.push(encodeURIComponent(p) +'='+ encodeURIComponent(object[p]));
        }
    }
    return data.join('&')+'&';
}

module.exports = dispatcher;