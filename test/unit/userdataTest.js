/**
 *
 * @description userdata测试模块
 *
 */

var ud = require('../../src/userdata');
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
