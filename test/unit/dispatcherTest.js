/**
 *
 * @description dispatcher模块测试
 *
 */
var config = require('../../src/config');
config.token  = 'token-123-456-789';

var disp = require('../../src/dispatcher');
var dispatcher = new disp(config);

describe('dispatcher module test', function(){
    describe('.endPoint()', function(){
        it('返回正常的远程接口http/https地址', function(){
            dispatcher.endPoint().should.eql('http://www.example.com/catch?token=token-123-456-789&');
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
