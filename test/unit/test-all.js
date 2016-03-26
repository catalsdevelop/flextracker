(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-07 13:42:02
 * @description 记录页面上用户的操作信息
 *
 */
var util = require('./util');

function action(config, store){
    this.data = [];
    this.store = store;
    if(config().action) {
        this.needRecordClickSelectors = ['a', 'button', 'input[button]', 'input[submit]', 'input[radio]', 'input[checkbox]'];
        this.needRecordChangeSelectors = ['input[text]', 'input[password]', 'textarea', 'select'];
        this.init();
    }
}
action.prototype = {
    init:function (){
        var clickHandler  = util.bind(this.eventHandler, this, 'click', this.needRecordClickSelectors);
        var inputHandler = util.bind(this.eventHandler, this, 'input', this.needRecordChangeSelectors);
        if(window.addEventListener){
            document.addEventListener('click',clickHandler, true);//标准浏览器在捕获阶段触发
            document.addEventListener('blur', inputHandler, true);
        }
        else if (window.attachEvent){
            document.attachEvent('onclick', clickHandler);
            document.attachEvent('onfocusout', inputHandler);//document内部有元素发生blur就会触发
        }
    },

    /**
     * 页面点击或者时区焦点时触发，该函数绑定了动作
     * @param  {String} action 'click' or 'input'
     * @param {String} selectorFilter 要过滤的标签类型
     * @param  {Event} evt    事件对象
     */
    eventHandler:function (action, selectorFilter, evt){
        var target = evt.target || evt.srcElement;
        if(target == document || target == window || target == document.documentElement || target == document.body){
            return;
        }
        var tag = target.tagName.toLowerCase();
        if(this.accept(target, selectorFilter)){
            // console.log(target.id, action);
            this.record(target, tag, action);
        }
    },

    /**
     * 查看某个元素是否在要监控的元素类型列表中
     * @param  {HTMLElement} element  要检测的元素
     * @param  {String} selector      元素列表字符串
     * @return {Boolean}              检测结果
     */
    accept:function(element, selector){
        var tag = element.tagName.toLowerCase();
        if(tag === 'input' && element.type){
            tag += '['+ element.type +']';
        }
        return util.indexOf(selector, tag) > -1;
    },

    /**
     * 返回一个元素对应的attributes
     * @param  {HTMLElement} element 要获取元素的属性
     * @return {Object}         key-value形式的对象
     */
     attributes:function(element){
        var result = {};
        var attributes = element.attributes;
        //在ie6-7下面，会获取到很多内置的attribute，使用specified属性来区分，在版本浏览器下，都会输出正确的属性，同时specified也是true。不保存非checkbox、radio的value属性的信息
        var len = attributes.length;
        for(var i = 0; i < len; ++i){
            var item = attributes[i];
            if(item.specified){
                if(item.name == 'value' && this.accept(element, ['textarea','input[text]','input[password]'])){
                    continue;
                }
                result[item.name] = item.value;
            }
        }
        return result;
    },

    /**
     * 根据不同的元素，记录不同的内容，input[password]不记录value，input[text]和textarea只记录文本长度，input[checkbox]、input[radio]需要记录value和checked属性，select记录选中的value和index
     * @param  {HTMLElement} target
     * @param  {String} lowercaseTagName 小写的标签tag
     * @param  {String} action           动作标示，'click','input'
     * @return {String}                  成功返回这个log的guid
     */
    record:function (element, lowercaseTagName, action){
        var attributes = this.attributes(element);
        var log = {
            tag:lowercaseTagName,
            action:action,
            time:util.isoDate(),
            attribute:attributes,
            extra:{}
        }
        if(lowercaseTagName === 'input'){
            switch(element.type){
                case 'text':
                    log.extra.length = element.value.length;
                break;
                case 'checkbox':
                case 'radio':
                    log.extra.checked = element.checked;
                break;
            }
        }
        else if(lowercaseTagName === 'textarea'){
            log.extra.length = element.value.length;
        }
        else if (lowercaseTagName === 'select'){
            log.extra.selectedIndex = element.selectedIndex;
            log.extra.value = element.value;
        }
        return this.store.add(log, 'a');
    },

    /**
     * 日志输出
     * @return {Array} 所有用户行为信息
     */
     all:function(){
        var actions = this.store.all('a'),result=[];
        for(var i =0; i < actions.length;++i){
            var item = actions[i];
            result.push(item.value);
        }
        return result;
    }
};

module.exports = action;
},{"./util":15}],2:[function(require,module,exports){
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
},{"./util.js":15}],3:[function(require,module,exports){
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
},{"./util":15}],4:[function(require,module,exports){
/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-07 13:32:30
 * @description 记录基本的浏览器版本、停留时间等信息
 *
 */

var landOn = new Date;//尽量早初始化这个函数，确保停留时间准确
var environment = {
    all:function(){
        return {
            vw:(document.documentElement ? document.documentElement.clientWidth : document.body.clientWidth),
            vh:(document.documentElement ? document.documentElement.clientHeight : document.body.clientHeight),
            ua:navigator.userAgent,
            age: new Date - landOn
        };
    }
}

module.exports = environment;
},{}],5:[function(require,module,exports){
            /**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-07 13:12:25
 * @description 存取一些临时数据的仓库
 *
 */

var util = require('./util');
var config = require('./config');

var data = [];

var store = {
    capacity:config.settings.storeCapacity,
    /**
     * 添加数据入库
     * @param {Mix} value 任何类型的数据
     * @param {String} type  任何类型的字符串，用来在all()函数里面做筛选
     */
    add:function(value, type){
        var guid = util.guid();
        data.push({
            id:guid,
            type:type,
            value:value
        });
        this.truncate();
        return guid;
    },
    /**
     * 根据guid返回对应的数据，找不到返回null
     * @param  {String} guid
     * @return {Mix}
     */
    get:function(guid){
        for(var i = 0; i < data.length; ++i){
            var item = data[i];
            if(item.id === guid){
                return {key:item.id,value:item.value};
            }
        }
        return null;
    },
    /**
     * 清空数据，这时获取all()得到的是一个空数组
     * @param {String} type 清空的类型
     */
    clear:function(type){
        var argLength = arguments.length;
        switch(argLength){
            case 0:
                data.length = [];
            return;
            case 1:
                var i = 0, item;
                while(item = data[i++]){
                    if(item.type == type){
                        // console.log(item);
                        data.splice(item,1);
                    }
                }
            return;
        }
    },
    /**
     * 保持库内数组的长度，超出的数据会被删除
     */
    truncate:function(){
        if(data.length <= this.capacity){
            return;
        }
        data.splice(this.capacity);
    },
    /**
     * 根据指定的guid删除数据
     * @param  {String} guid
     * @return {Boolean} 删除成功返回true，失败返回false
     */
    remove:function(guid){
        var len = data.length;
        for(var i = 0; i < len; ++i){
            var item = data[i];
            if(item.id === guid){
                data.splice(i,1);
                return true;
            }
        }
        return false;
    },
    /**
     * 根据type返回对应的数据类型，不存在的类型返回空数组，不提供type的话，返回所有数据
     * @param  {String} type
     * @return {Mix}
     */
    all:function(type){
        var result = [];
        var len = data.length;
        for(var i = 0; i < len; ++i){
            var item = data[i];
            if(!type || item.type === type){
                result.push({
                    key:item.id,
                    value:item.value
                });
            }
        }
        return result;
    }
}

module.exports = store;
},{"./config":2,"./util":15}],6:[function(require,module,exports){
var utilTest = require('./utilTest');
var configTest = require('./configTest');
var userdata = require('./userdataTest');
var storeTest = require('./storeTest');
var dispatcherTest = require('./dispatcherTest');
var trackerTest = require('./trackerTest');
// var windowTest = require('./windowTest');
},{"./configTest":7,"./dispatcherTest":8,"./storeTest":9,"./trackerTest":10,"./userdataTest":11,"./utilTest":12}],7:[function(require,module,exports){
/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-10 14:03:58
 * @description 配置文件测试
 *
 */

var config = require('../../config');

describe('config module test', function(){
    describe('.defaults', function(){
        it('返回默认的用户配置信息', function(){
            config.defaults.should.eql({
                enabled:true,
                windowEnabled:true,
                action:true,
                hook:true,
                net:true,
                ignoreErrors:[],
                ignoreUris:[]
            });
        });
    });

    describe('.settings', function(){
        it('返回默认的系统配置信息', function(){
            config.settings.should.eql({
                version:'0.0.1',
                maxStackDepth:10,
                storeCapacity:20,
                reportPath:'nodejs.catals.com/catch',
                maxErrorToleranceAge:1000
            });
        });
    });

    describe('.config()', function(){
        beforeEach(function(){
            config(config.defaults);
        });

        it('通过key-value的形式给配置赋值', function(){
            config('enabled',false);
            config('hook', false);
            config('net', true);
            config('name', 'liuzhen7');

            config().should.eql({
                enabled:false,
                windowEnabled:true,
                action:true,
                hook:false,
                net:true,
                ignoreErrors:[],
                ignoreUris:[]
            });
        });

        it('直接从一个object对象给配置赋值', function(){
            config({
                hook:true,
                net:false,
                name:'liuzhen7'
            });
            
            config(1234);
            config('name');

            config().should.eql({
                enabled:true,
                windowEnabled:true,
                action:true,
                hook:true,
                net:false,
                ignoreErrors:[],
                ignoreUris:[]
            });
        });

        it('返回给对一个参数时该参数对应的配置信息', function(){
            (config('stack') == null).should.be.true();
            config('hook').should.be.true();
            config('ignoreUris').should.eql([]);
        })

        it('返回所有配置信息', function(){
            config({
                net:false,
                ignoreErrors:[
                    EvalError,
                    'localhost:8000'
                ]
            });
            config().should.eql({
                enabled:true,
                windowEnabled:true,
                action:true,
                hook:true,
                net:false,
                ignoreErrors:[
                    EvalError,
                    'localhost:8000'
                ],
                ignoreUris:[]
            })
        });
    })
});
},{"../../config":2}],8:[function(require,module,exports){
/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-13 17:33:43
 * @description dispatcher模块测试
 *
 */
var config = require('../../config');
config.token  = 'token-123-456-789';

var disp = require('../../dispatcher');
var dispatcher = new disp(config);

describe('dispatcher module test', function(){
    describe('.endPoint()', function(){
        it('返回正常的远程接口http/https地址', function(){
            dispatcher.endPoint().should.eql('http://nodejs.catals.com/catch?token=token-123-456-789&');
        });
    });

    describe('.sendError()', function(){
        var newXhr,requests;
        beforeEach(function(){
            newXhr = sinon.useFakeXMLHttpRequest();
            requests = [];
            newXhr.onCreate = function(xhr){
                requests.push(xhr);
            }
        });

        afterEach(function(){
            sinon.restore();
        });

        it('发送正确的错误信息到服务器', function(){
            var data = {
                name:'liuzhen7',
                age:30,
                detail:{
                    married:true,
                    children:2
                }
            };
            dispatcher.sendError(data);
            requests.length.should.eql(1);
            var request = requests[0];
            request.method.toLowerCase().should.eql('post');
            request.requestBody.should.eql("{\"name\":\"liuzhen7\",\"age\":30,\"detail\":{\"married\":true,\"children\":2}}");
        });
    });
});
},{"../../config":2,"../../dispatcher":3}],9:[function(require,module,exports){
/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-10 14:54:58
 * @description 公共存储功能模块测试 
 *
 */
var store = require('../../store');

describe('store module test', function(){
    var old;
    beforeEach(function(){
        old = Math.random;
    });        

    afterEach(function(){
        Math.random = old;
        store.clear();
    });

    describe('.add()',function () {
        it('添加一项数据，并返回guid', function (){
            Math.random = function(){
                return .1234567;//1f9a1f9a-1f9a-1f9a-1f9a-1f9a1f9a1f9a
            }
            for(var i = 0; i < 8; ++i){
                var id = store.add({action:'input', element:{type:'text', autocomplete:true}, tag:'input',length:24}, 'a');
                id.should.eql('1f9a1f9a-1f9a-1f9a-1f9a-1f9a1f9a1f9a');
            }
            
            Math.random = function(){
                return .7654321;//c3f3c3f3-c3f3-c3f3-c3f3-c3f3c3f3c3f3
            }
            for(i= 0; i < 8; ++i){
                var id = store.add({action:'click', element:{type:'checkbox', checked:true}, tag:'input'}, 'a');
                id.should.eql('c3f3c3f3-c3f3-c3f3-c3f3-c3f3c3f3c3f3');
            }
            
            Math.random = function(){
                return .13579;//22c322c3-22c3-22c3-22c3-22c322c322c3
            }
            for(i= 0; i < 8; ++i){
                var id = store.add({url:'http://localhost:8000', method:'GET', statusCode:200, responseText:'{name:"liuzhen7",id:"777"}'}, 'xhr');
                id.should.eql('22c322c3-22c3-22c3-22c3-22c322c322c3');
            }
            store.all().length.should.eql(store.capacity);
        })
    });

    describe('.get()', function(){
        var id1,id2,id3,id4,id5;

        beforeEach(function(){
            id1 = store.add({action:'input', idx:1, element:{type:'text', autocomplete:true}, tag:'input',length:24}, 'a1');
            id2 = store.add({action:'input', idx:2, element:{type:'text', autocomplete:true}, tag:'input',length:24}, 'a1');//d
            id3 = store.add({action:'input', idx:3, element:{type:'text', autocomplete:true}, tag:'input',length:24}, 'a2');//d
            id4 = store.add({action:'input', idx:4, element:{type:'text', autocomplete:true}, tag:'input',length:24}, 'a2');//d
            id5 = store.add({action:'input', idx:5, element:{type:'text', autocomplete:true}, tag:'input',length:24}, 'a2');
        });

        it('guid存在时，返回对应的项', function(){
            var item2 = store.get(id2);
            item2.should.eql({
                key:id2,
                value:{action:'input', idx:2, element:{type:'text', autocomplete:true}, tag:'input',length:24}
            });
        });

        it('guid不存在时，返回null', function(){
            var itemNull = store.get('notexistname');
            should(itemNull).be.exactly(null);
        });
    });

    describe('.remove()', function(){
        var id1, id2, id3, id4, id5;
        before(function(){
            id1 = store.add({action:'input', idx:1, element:{type:'text', autocomplete:true}, tag:'input',length:24}, 'a1');
            id2 = store.add({action:'input', idx:2, element:{type:'text', autocomplete:true}, tag:'input',length:24}, 'a1');//d
            id3 = store.add({action:'input', idx:3, element:{type:'text', autocomplete:true}, tag:'input',length:24}, 'a2');//d
            id4 = store.add({action:'input', idx:4, element:{type:'text', autocomplete:true}, tag:'input',length:24}, 'a2');//d
            id5 = store.add({action:'input', idx:5, element:{type:'text', autocomplete:true}, tag:'input',length:24}, 'a2');
        });

        it('删除与key对应的项', function(){
            var result1 = store.remove(id2);
            result1.should.be.true();
            store.all().length.should.eql(4);
            store.all('a1').length.should.eql(1);

            var result2 = store.remove(id3);
            result2.should.be.true();
            store.all().length.should.eql(3);
            store.all('a2').length.should.eql(2);
            
            var result3 = store.remove(id4);
            result3.should.be.true();
            var all = store.all();
            all.length.should.eql(2);
            store.all('a2').length.should.eql(1);

            var result4 = store.remove('not-exist-id');
            result4.should.be.false();
            store.all().length.should.eql(2);

            all[0].should.eql({
                key:id1,
                value:{action:'input', idx:1, element:{type:'text', autocomplete:true}, tag:'input',length:24}
            });

            all[1].should.eql({
                key:id5,
                value:{action:'input', idx:5, element:{type:'text', autocomplete:true}, tag:'input',length:24}
            });
        });
    });

    describe('.clear()', function(){
        it('清空所有数据', function(){
            for(var i = 0; i < 10; ++i){
                store.add({action:'input', element:{type:'text', autocomplete:true}, tag:'input',length:24}, 'a1');
            }
            store.clear();
            var all = store.all();
            all.length.should.eql(0);
        });

        it('清空某种类型的数据', function(){
            for(var i = 0; i <= 20; ++i){
                var obj = {action:'input', element:{type:'text', autocomplete:true}, tag:'input',length:24, i:i};
                var type = (i % 4 == 0) ? 'a1' :'a2';
                store.add(obj, type);
            }
            store.clear('a1');
            var all = store.all();
            all.length.should.eql(15);
        })
    });

    describe('.all()', function(){
        //确保每次hookrandom方法，测试完再重置
        beforeEach(function(){
            Math.random = function(){
                return .1234567;//1f9a1f9a-1f9a-1f9a-1f9a-1f9a1f9a1f9a
            }
            for(var i = 0; i < 10; ++i){
                store.add({action:'input', element:{type:'text', autocomplete:true}, tag:'input',length:24}, 'a1');
            }
            
            Math.random = function(){
                return .7654321;//c3f3c3f3-c3f3-c3f3-c3f3-c3f3c3f3c3f3
            }
            for(i= 10; i < 20; ++i){
                store.add({action:'click', element:{type:'checkbox', checked:true}, tag:'input'}, 'a2');
            }
        });

        it('返回一种类型的所有数据，如果没有指定类型，返回所有数据', function(){
            var a1Data = store.all('a1');
            a1Data.length.should.eql(10);
            a1Data.forEach(function(val, idx){
                val.should.eql({
                    key:'1f9a1f9a-1f9a-1f9a-1f9a-1f9a1f9a1f9a',
                    value:{action:'input', element:{type:'text', autocomplete:true}, tag:'input',length:24}
                });
            })

            var a2Data = store.all('a2');
            a2Data.length.should.eql(10);
            a2Data.forEach(function(val, idx){
                val.should.eql({
                    key:'c3f3c3f3-c3f3-c3f3-c3f3-c3f3c3f3c3f3',
                    value:{action:'click', element:{type:'checkbox', checked:true}, tag:'input'}
                });
            });

            var all = store.all();
            all.length.should.eql(20);
            
        });

        it('如果指定类型没有数据，返回空数组', function(){
            var empty = store.all('not-exist-type');
            empty.length.should.eql(0);
        });
    });
})
},{"../../store":5}],10:[function(require,module,exports){
/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-14 11:02:19
 * @description tracker模块测试 
 *
 */
var config = require('../../config');
var store = require('../../store');
var Userdata = require('../../userdata');
var Disptacher =  require('../../dispatcher');
var Tracker = require('../../tracker');
var Action = require('../../action');

var actionMonitor = new Action(config, store);
var userdata = new Userdata();
var dispatcher = new Disptacher(config);
var tracker = new Tracker(config, store, dispatcher, userdata, actionMonitor);

config.token = 'token-123-456-789';

describe('tracker module test', function(){
    var newXhr,clock,report,sendError;
    beforeEach(function(){
        newXhr = sinon.useFakeXMLHttpRequest();
        clock = sinon.useFakeTimers();
        report = sinon.spy(tracker, 'report');//注意这里的用法sinon.spy(tracker.report)是找不到this而无法绑定正确的
        sendError = sinon.spy(dispatcher, 'sendError');
        tracker.lastError = null;
    });

    afterEach(function(){
        sinon.restore();
        clock.restore();
        tracker.report.restore();
        dispatcher.sendError.restore();
    });

    describe('.report()', function(done){//todo 注意这个测试用例和下面.catch的顺序，由于tracker包含一些闭包对象，所以有没有好办法可以设置闭包对象的值来达到测试的目的？
        it('只发送允许间隔范围内的那些错误', function(){
            var start = new Date - 0 ;//1457925878000
            for(var i = 0; i < 10; ++i){
                var error = {message:'this is a test error', file:'trackerTest.js', line:300, column:223};
                error.stack = '@debugger eval code 1:22';
                tracker.catch(error, 'window');
                clock.tick(200);//每200ms触发一次
            }
            report.callCount.should.eql(10);
            sendError.calledTwice.should.be.true();
        });
    });

    describe('.catch()', function(){
        it('捕获普通的错误信息', function(){
            var error = {message:'this is a test error', file:'trackerTest.js', line:300, column:223};
            error.stack = '@debugger eval code 1:22';
            clock.tick(1457925878166);//2016-03-14T11:24:38+08:00
            tracker.catch(error, 'window');
            report.calledOnce.should.be.true();
            report.calledWithMatch({
                version:'0.0.1',
                source:'window',
                error:{
                    message:'this is a test error',
                    file:'trackerTest.js',
                    line:300,
                    column:223,
                    stack:'@debugger eval code 1:22'
                },
                url:location.href,
                time:'2016-03-14T11:24:38+08:00',
                token:'token-123-456-789',
                environment:{
                    vh:document.documentElement.clientHeight,
                    vw:document.documentElement.clientWidth,
                    ua:navigator.userAgent
                }
            }).should.be.true();
        });

        it('捕获错误，自动截断过长的堆栈信息', function(){
            var error = {message:'this is a test error', file:'trackerTest.js', line:300, column:223};
            config.settings.maxStackDepth = 5;
            var stackArr = ['@debugger eval code 1:22','a.js:1:12','b.js:2:3','c.js:3:4','d.js:4:5','e.js:5:6','f:js:6:7'];
            error.stack = stackArr.join('\n');
            clock.tick(1457925878166);//2016-03-14T11:24:38+08:00
            tracker.catch(error, 'window');
            report.calledOnce.should.be.true();
            report.calledWithMatch({
                version:'0.0.1',
                source:'window',
                error:{
                    message:'this is a test error',
                    file:'trackerTest.js',
                    line:300,
                    column:223,
                    stack:stackArr.slice(0,5).join('\n')
                },
                url:location.href,
                time:'2016-03-14T11:24:38+08:00',
                token:'token-123-456-789',
                environment:{
                    vh:document.documentElement.clientHeight,
                    vw:document.documentElement.clientWidth,
                    ua:navigator.userAgent
                }
            }).should.be.true();
        });

        it('默认的config配置发送operation和userdata', function(){
            userdata.set({
                name:'liuzhen7',
                age:30
            });

            var error = {message:'this is a test error', file:'trackerTest.js', line:300, column:223};
            error.stack = '@debugger eval code 1:22';
            clock.tick(1457925878166);//2016-03-14T11:24:38+08:00
            tracker.catch(error, 'window');
            
            sendError.calledOnce.should.be.true();
            sendError.calledWithMatch({
                version:'0.0.1',
                source:'window',
                error:{
                    message:'this is a test error',
                    file:'trackerTest.js',
                    line:300,
                    column:223,
                    stack:'@debugger eval code 1:22'
                },
                operation:[],
                userdata:{
                    name:'liuzhen7',
                    age:30
                },
                url:location.href,
                time:'2016-03-14T11:24:38+08:00',
                token:'token-123-456-789',
                environment:{
                    vh:document.documentElement.clientHeight,
                    vw:document.documentElement.clientWidth,
                    ua:navigator.userAgent
                }
            }).should.be.true();
        });

        it('通过config配置不发送operation', function(){
            userdata.set({
                name:'liuzhen7',
                age:30
            });
            config({
                action:false
            })

            var error = {message:'this is a test error', file:'trackerTest.js', line:300, column:223};
            error.stack = '@debugger eval code 1:22';
            clock.tick(1457925878166);//2016-03-14T11:24:38+08:00
            tracker.catch(error, 'window');
            
            sendError.calledOnce.should.be.true();
            sendError.calledWithMatch({
                version:'0.0.1',
                source:'window',
                error:{
                    message:'this is a test error',
                    file:'trackerTest.js',
                    line:300,
                    column:223,
                    stack:'@debugger eval code 1:22'
                },
                userdata:{
                    name:'liuzhen7',
                    age:30
                },
                url:location.href,
                time:'2016-03-14T11:24:38+08:00',
                token:'token-123-456-789',
                environment:{
                    vh:document.documentElement.clientHeight,
                    vw:document.documentElement.clientWidth,
                    ua:navigator.userAgent
                }
            }).should.be.true();
        })
    });

});

},{"../../action":1,"../../config":2,"../../dispatcher":3,"../../store":5,"../../tracker":13,"../../userdata":14}],11:[function(require,module,exports){
/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-11 16:22:46
 * @description userdata测试模块
 *
 */

var ud = require('../../userdata');
var userdata = new ud();

describe('userdata module test', function(){
    beforeEach(function(){
        userdata.set('name','liuzhen7');
        userdata.set('age',30);
        userdata.set('extra',{p1:1,p2:2});
        userdata.set({
            homework:'read a book',
            done:true
        });
    });

    afterEach(function(){
        userdata.clear();
    });

    describe('.get() and .set()', function(){
        it('设置和获取用户自定义信息', function(){
            
            userdata.set('extra',{p1:2,p2:3,p3:4});

            var v1 = userdata.get('age');
            var v2 = userdata.get('done');
            v1.should.eql(30);
            v2.should.be.true();

            userdata.get().should.eql({
                name:'liuzhen7',
                age:30,
                extra:{p1:2,p2:3,p3:4},
                homework:'read a book',
                done:true
            });
        });
    });

    describe('.remove()', function(){
        it('给定一个key，删除对应的项', function(){
            userdata.remove('age');
            userdata.remove('extra');
            userdata.get().should.eql({
                name:'liuzhen7',
                homework:'read a book',
                done:true
            })
        });
    });

    describe('.clear()', function(){
        it('清空所有的项', function(){
            userdata.clear();
            userdata.get().should.eql({});
        });
    });
});
},{"../../userdata":14}],12:[function(require,module,exports){
/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-09 13:38:13
 * @description util模块，有一些函数没有办法测试，isoDate\guid 
 *
 */
var util = require('../../util');

describe('util module test',function(){
    describe('object real type judgement', function(){
        var a = {};
        var b = null;
        var c = {a:1,b:2};
        var d = true;
        var e = [1,2,3,4,5];
        var f = 'I\'m a boy';
        var g = 12345;
        var h = undefined;
        var i = function(){
            //nop function
        }
        var j = /\w{1,10}/ig;
        var k = new Date;
        var l = new EvalError;
        it('.isPlainObject()', function(){
            util.isPlainObject(a).should.be.true();
            util.isPlainObject(b).should.be.false();
            util.isPlainObject(c).should.be.true();
            util.isPlainObject(d).should.be.false();
            util.isPlainObject(e).should.be.false();
            util.isPlainObject(f).should.be.false();
            util.isPlainObject(g).should.be.false();
            util.isPlainObject(h).should.be.false();
            util.isPlainObject(i).should.be.false();
            util.isPlainObject(j).should.be.false();
            util.isPlainObject(k).should.be.false();
            util.isPlainObject(l).should.be.false();
        });
        it('.isArray()', function(){
            util.isArray(a).should.be.false();
            util.isArray(b).should.be.false();
            util.isArray(c).should.be.false();
            util.isArray(d).should.be.false();
            util.isArray(e).should.be.true();
            util.isArray(f).should.be.false();
            util.isArray(g).should.be.false();
            util.isArray(h).should.be.false();
            util.isArray(i).should.be.false();
            util.isArray(j).should.be.false();
            util.isArray(k).should.be.false();
            util.isArray(l).should.be.false();
        });
        it('.isBoolean()', function(){
            util.isBoolean(a).should.be.false();
            util.isBoolean(b).should.be.false();
            util.isBoolean(c).should.be.false();
            util.isBoolean(d).should.be.true();
            util.isBoolean(e).should.be.false();
            util.isBoolean(f).should.be.false();
            util.isBoolean(g).should.be.false();
            util.isBoolean(h).should.be.false();
            util.isBoolean(i).should.be.false();
            util.isBoolean(j).should.be.false();
            util.isBoolean(k).should.be.false();
            util.isBoolean(l).should.be.false();
        });
        it('.isDate()', function(){
            util.isDate(a).should.be.false();
            util.isDate(b).should.be.false();
            util.isDate(c).should.be.false();
            util.isDate(d).should.be.false();
            util.isDate(e).should.be.false();
            util.isDate(f).should.be.false();
            util.isDate(g).should.be.false();
            util.isDate(h).should.be.false();
            util.isDate(i).should.be.false();
            util.isDate(j).should.be.false();
            util.isDate(k).should.be.true();
            util.isDate(l).should.be.false();
        });
        it('.isNumber()', function(){
            util.isNumber(a).should.be.false();
            util.isNumber(b).should.be.false();
            util.isNumber(c).should.be.false();
            util.isNumber(d).should.be.false();
            util.isNumber(e).should.be.false();
            util.isNumber(f).should.be.false();
            util.isNumber(g).should.be.true();
            util.isNumber(h).should.be.false();
            util.isNumber(i).should.be.false();
            util.isNumber(j).should.be.false();
            util.isNumber(k).should.be.false();
            util.isNumber(l).should.be.false();
        });
        it('.isObject()', function(){
            util.isObject(a).should.be.true();
            util.isObject(b).should.be.false();
            util.isObject(c).should.be.true();
            util.isObject(d).should.be.false();
            util.isObject(e).should.be.false();
            util.isObject(f).should.be.false();
            util.isObject(g).should.be.false();
            util.isObject(h).should.be.false();
            util.isObject(i).should.be.false();
            util.isObject(j).should.be.false();
            util.isObject(k).should.be.false();
            util.isObject(l).should.be.false();
        });
        it('.isRegExp()', function(){
            util.isRegExp(a).should.be.false();
            util.isRegExp(b).should.be.false();
            util.isRegExp(c).should.be.false();
            util.isRegExp(d).should.be.false();
            util.isRegExp(e).should.be.false();
            util.isRegExp(f).should.be.false();
            util.isRegExp(g).should.be.false();
            util.isRegExp(h).should.be.false();
            util.isRegExp(i).should.be.false();
            util.isRegExp(j).should.be.true();
            util.isRegExp(k).should.be.false();
            util.isRegExp(l).should.be.false();
        });
        it('.isString()', function(){
            util.isString(a).should.be.false();
            util.isString(b).should.be.false();
            util.isString(c).should.be.false();
            util.isString(d).should.be.false();
            util.isString(e).should.be.false();
            util.isString(f).should.be.true();
            util.isString(g).should.be.false();
            util.isString(h).should.be.false();
            util.isString(i).should.be.false();
            util.isString(j).should.be.false();
            util.isString(k).should.be.false();
            util.isString(l).should.be.false();
        });

        it('.isError()', function(){
            util.isError(a).should.be.false();
            util.isError(b).should.be.false();
            util.isError(c).should.be.false();
            util.isError(d).should.be.false();
            util.isError(e).should.be.false();
            util.isError(f).should.be.false();
            util.isError(g).should.be.false();
            util.isError(h).should.be.false();
            util.isError(i).should.be.false();
            util.isError(j).should.be.false();
            util.isError(k).should.be.false();
            util.isError(l).should.be.true();
        });
    })

    describe('.extend()', function(){
        it('扩展对象', function(){
            var des = {a:1,b:2};
            var result = util.extend(des, {b:'b',c:3});
            des.should.equal(result);
            des.should.eql({a:1, b:'b', c:3});
        });

        it('如果要扩展的source对象不是简单对象，则直接返回destination对象', function(){
            var des = {name:'liuzhen7',age:30};
            var result1 = util.extend(des, 112233);
            result1.should.eql({name:'liuzhen7',age:30});
            des.should.equal(result1);

            var result2 = util.extend(des, new Date);
            result2.should.eql({name:'liuzhen7',age:30});
            des.should.equal(result2);
        });
    });

    describe('.bind()', function(){
        it('简单bind this', function(){
            var getName = function(){
                return 'hi '+ this.name;
            }

            var wrappedFunc = util.bind(getName, {name:'liuzhen'});
            var val = wrappedFunc();
            val.should.eql('hi liuzhen');
        })

        it('绑定除this以外额外的参数', function(){
            var addNum = function(num1, num2, num3){
                return num1 + num2 + num3;
            }

            var spy = sinon.spy(addNum);
            var wrappedFunc = util.bind(spy, null, 2, 3);
            var result = wrappedFunc(4);
            result.should.eql(9);

            spy.called.should.be.true();
            spy.calledWithExactly(2,3,4).should.be.true();
        });
    });

    describe('.isIE()', function(){
        it('检测是否ie浏览器', function(){
            var ua = navigator.userAgent.toLowerCase();
            util.isIE().should.equal(ua.indexOf('msie') > -1 || ua.indexOf('trident') > -1)
        });
    });

    describe('.pad()', function(){
        var num = 123;

        it('如果数值长度小于要pad的长度，不会pad', function(){
            var r1 = util.pad(num, 1);
            var r2 = util.pad(num, 2);
            r1.should.eql(num);
            r2.should.eql(num);
        })

        it('如果数值长度大于要pad的长度，在左侧pad相应的0', function(){
            var r1 = util.pad(num, 5);
            var r2 = util.pad(num, 10);

            r1.should.eql('00123');
            r2.should.eql('0000000123');
        });
    });

    describe('.ns()', function(){
        var ns = util.ns;

        function f0(){
            ns('123');
            return window['123'];
        }

        function f1(){
            ns('1a.2b');//n
            var initNS = window['1a']['2b'];
        }

        function f2(){
            ns('&ns1.ns2');//n
            var initNS = window['&ns1']['ns2'];
        }

        function f3(){
            ns('ns1.123');//n
            var initNS = window['ns1']['123'];
        }

        function f4(){
            ns('ns1.%ns2');//n
            var initNS = window['ns1']['%ns2'];
        }

        afterEach(function(){
            delete window['ns1'];
            delete window['_123'];
        })

        it('对于不符合命名规范的字符串，不能初始化对应的命名空间', function(){
            (f0()===undefined).should.be.true();
            f1.should.throw();
            f2.should.throw();
            f3.should.throw();
            f4.should.throw();
        });

        it('正确初始化一个命名空间', function(){
            ns('myns');//y
            window['myns'].should.eql({});

            ns('ns1.ns2');//y
            window['ns1'].should.eql({'ns2':{}});
            window['ns1']['ns2'].should.eql({});

            ns('ns1.Ns2');//y
            window['ns1']['ns2'].should.eql({});//won't be override
            window['ns1']['Ns2'].should.eql({});
            
            ns('ns1._123');//y
            window['ns1']['ns2'].should.eql({});//won't be override
            window['ns1']['Ns2'].should.eql({});
            window['ns1']['_123'].should.eql({});

            ns('ns1.ns2.ns3');//y
            window['ns1']['ns2']['ns3'].should.eql({});

            ns('_123._456');//y
            window['_123'].should.eql({'_456':{}});
            window['_123']['_456'].should.eql({});
            ns('_123.ns2');//y
            window['_123']['_456'].should.eql({});
            window['_123']['ns2'].should.eql({});
        });
    });

    describe('.isoDate()', function(){
        var clock;
        
        beforeEach(function(){
            clock = sinon.useFakeTimers();
        });

        afterEach(function(){
            clock.restore();
        });

        it('返回一个iso8601格式的utc时间，并且带相应的timezone信息', function(){
            clock.tick(1457510544000)//2016-03-09T08:02:24Z
            util.isoDate().should.eql('2016-03-09T16:02:24+08:00');
        });
    });

    describe.skip('.isOldIE() .isIE67() .cw() .guid() .addEvent() .removeEvent() .indexOf()', function(){});
});
},{"../../util":15}],13:[function(require,module,exports){
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
},{"./environment":4,"./util":15}],14:[function(require,module,exports){
/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-07 10:39:14
 * @description 保存用户自定义数据类型
 *
 */

var util = require('./util');

function userdata(){
    this.data = {};
}

userdata.prototype = {
    /**
     * 设置配置信息
     * @param  {Mix} params 参数有2种情况，不满足条件的都会被discard
     * 
     * 1.  {Object} params 直接将参数对象合并到配置中
     * 
     * 2.  {String} p1 要设置的key
     *     {Mix}    p2 对应的数值
     */
    set:function(){
        var argLength = arguments.length;
        switch(argLength){
            case 1:
                if (util.isObject(arguments[0])){
                    util.extend(this.data, arguments[0]);
                }
            break;
            case 2:
                this.data[arguments[0]] = arguments[1];
            break;
        }
    },
    /**
     * 根据key返回value值
     * @param  {String} key
     * @return {Mix}    与key对应的配置信息，没有的话返回null
     */
    get:function(key){
        if(arguments.length == 0){
            return this.data;
        }
        return this.data[key] || null;
    },

    /**
     * 删除key对应的数据
     * @param  {String} key
     */
    remove:function(key){
        delete this.data[key];
    },

    /**
     * 清空所有数据
     */
    clear:function(){
        this.data = {};
    }
}
module.exports = userdata;
},{"./util":15}],15:[function(require,module,exports){
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
    isoDate:getISODateNow
});

module.exports = output;
},{}]},{},[6]);
