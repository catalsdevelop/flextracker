/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-17 15:10:09
 * @description 针对不支持ajax 跨域提交的dispatcher
 *
 */

var util = require('./util');
var dispatcher = require('./dispatcher');

function object(o) {
    var F = function () {};
    F.prototype = o;
    return new F();
}

function legacyDispacther(config){
    dispatcher.call(this, config);
}
legacyDispacther.prototype = object(dispatcher.prototype);
legacyDispacther.prototype.constructor = legacyDispacther;


var queue = [];
function autoSend(url, method){
    if(!!document.body){
        var item;
        while(item = queue.shift()){
            iframePost(url, method, item);
        }
    }
    else{
        setTimeout(util.bind(autoSend, null, url, method), 20);
    }
}

function iframePost(url, method, data){
    var iframe = document.createElement('iframe');
    iframe.name = 'framePost-'+ util.guid();
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.contentWindow.name = iframe.name;

    var form =document.createElement('form');
    // form.id = 'eagleeye_tracker_form';
    form.enctype= 'application/x-www-form-urlencoded';
    form.action = url;
    form.method = method;
    form.target = iframe.name;
    var input = document.createElement('input');
    input.name='info';
    input.type='hidden';
    input.value = JSON.stringify(data);
    form.appendChild(input);
    document.body.appendChild(form);

    iframe.attachEvent('onload', function(){
        iframe.detachEvent('onload', arguments.callee);
        document.body.removeChild(form);//todo 这里会有leak么？
        form = null;
        document.body.removeChild(iframe);
        iframe = null;
    });

    form.submit();
}

legacyDispacther.prototype.sendError = function(info){
        if(!this.config.token){
            util.cw('tracker can not report error without a token');
            return;
        }
        var endPoint = this.endPoint(this.config.token);
        queue.push(info);
        autoSend(endPoint, 'post');
}

module.exports = legacyDispacther;