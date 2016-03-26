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