/**
 *
 * @description window模块测试
 *
 */
var config = require('../../src/config');
var store = require('../../src/store');
var Dispatcher = require('../../src/dispatcher');
var Tracker = require('../../src/tracker');

var tracker = new Tracker(config, store, new Dispatcher(config));
var win = require('../../src/window');


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
