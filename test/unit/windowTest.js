/**
 * 
 * @authors liuzhen7 (liuzhen7@jd.com)
 * @date    2016-03-14 17:20:44
 * @description window模块测试
 *
 */
var config = require('../../config');
var store = require('../../store');
var Dispatcher = require('../../dispatcher');
var Tracker = require('../../tracker');

var tracker = new Tracker(config, store, new Dispatcher(config));
var win = require('../../window');


describe.skip('window module test', function(){
    describe('catch error 没想到好的办法测试', function(){
        var globalError,catchError;
        beforeEach(function(){
            win.monitor(config, tracker);
            globalError = sinon.spy(window, 'onerror');
            catchError = sinon.stub(tracker, 'catch', function(err, type){
                console.log(err, type);
            });
        });

        afterEach(function(){
            window.onerror.restore();
            tracker.catch.restore();
        });

        it('全局捕获错误', function(){
            var callback = sinon.stub();
            // callback.withArgs(1).throws("TypeError");
            // callback(1);
            // globalError.called.should.be.true();
        });
    });
});