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
