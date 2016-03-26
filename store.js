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