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

    describe('.globalObjValue()', function(){
        it('返回一个全局对象的值，如果不存在返回null',function(){
            var v1 = util.ns('a.b.c.d');
            a.b.c.d.e = 1;
            util.globalObjValue('a.b.c.d.e').should.eql(1);
            should(util.globalObjValue('h.i.j.k')).be.exactly(null);
        })
    })

    describe.skip('.isOldIE() .isIE67() .cw() .guid() .addEvent() .removeEvent() .indexOf()', function(){});
});