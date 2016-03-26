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