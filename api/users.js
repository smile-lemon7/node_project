var fs = require('fs');

var async = require('async');
var url = require('url');
var { MongoClient } = require('mongodb');

var mongoUrl = 'mongodb://localhost:27017/mydatabase';

var { sendCode } = require('./mycode.js');//获取mycode.js中暴露的的sendCode方法

module.exports = {
	defaultRouter: ( req, res, next ) => {
		res.render('users');
	},
    getPhoneCode( req, res, next ){
        var { phoneNum } = url.parse( req.url, true ).query;
        async.waterfall( [
            ( cb ) => {
                MongoClient.connect( mongoUrl,( err, db ) => {
                    if( err ) throw err;
                    cb( null, db);
                })
            },
            ( db, cb ) => {
                db.collection('users').find({phoneNum},{_id:0}).toArray( ( err, res ) => {
                    if( err ) throw err;  //根据传递过来的手机号，在数据库中查找是否存在
                    if( res.length == 0){
                        cb( null, 1);
                    }else{
                        cb( null, 0);
                    }
                    db.close();
                });
            }
            ], ( err, result )=>{
                if( err ) throw err;
                if( result == 1 ){  //标识手机号可以使用，在数据库中不存在
                    sendCode({
                        phoneNum,
                        code: '3458',
                        success: function( data ){
                            if( data == 'ok' ){  //表示发送验证码成功
                                res.send({
                                    state: 1,  //返回前端一个状态值和验证码（判断输入的验证码的合法性）
                                    code: '3458'
                                })
                            }else {
                                res.send('0') //表示发送验证码失败
                            }
                        }
                    });
                }
           });
        },
    registerUserAction( req, res, next ){
        var { phoneNum, password } = req.body;
        async.waterfall( [
        	( cb ) => {
        		MongoClient.connect( mongoUrl,( err, db ) => {
        			if( err ) throw err;
        			cb( null, db);
        		})
        	},
        	( db, cb ) => {
        		db.collection('users').insert({phoneNum,password},( err, res )=>{
                    if( err ) throw err;
                    cb( null,'ok' );
                    db.close();
                })
        	}
        	], ( err, result )=>{
        		if( err ) throw err;
        		if( result == 'ok' ){
                    res.send('1');
                }else{
                    res.send('0');
                }
        });
    }
}
