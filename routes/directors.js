var async = require('async');
var { MongoClient } = require('mongodb');
var url = require('url');

var mongoUrl = 'mongodb://localhost:27017/mydatabase';

module.exports = {
	defaultRouter: ( req, res, next ) => {
		async.waterfall( [
			( cb ) => {
				MongoClient.connect( mongoUrl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, db );
				})
			},
			( db, cb ) => {
				db.collection('directors').find( {}, {}).toArray( ( err , data ) => {
					if ( err ) throw err;
					cb( null, data);
					db.close();
				} );
			}
			
		], ( err, result ) => {
			if ( err ) throw err;
//			console.log( result );
			var listLen = result.length;
			res.render('directors', {
				result,
				listLen,
				limitNum: listLen,
				skipNum: 0,
				totalNum: 1
			});
		} );
	},
	pageRouter: ( req, res, next ) => {
		var { limitNum, skipNum } = url.parse( req.url, true ).query;
		limitNum = limitNum*1 || 5;
		skipNum = skipNum*1 || 0;
		async.waterfall( [
			( cb ) => {
				MongoClient.connect( mongoUrl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, db );
				})
			},
			( db, cb ) => {
				/*db.collection('directors').find( {}, {}).limit( limitNum ).skip( skipNum ).toArray( ( err , data ) => {
					//使用数据库中的limit和skip方法的分页只能实现上一页和下一页，
//					当实现首页尾页的时候，会出现一直是同一个页面，因为，查找到的一直是过滤后的数据
					if ( err ) throw err;
					var totalNum = Math.ceil( data.length / limitNum );
					cb( null, {
						data,
						limitNum,
						skipNum,
						totalNum
					});
					db.close();
				} );*/
				
				//使用数组中的新增方法，splice对查询全部的数据，按要求进行截取
				db.collection('directors').find( {}, {}).toArray( ( err , data ) => {
					if ( err ) throw err;
					var totalNum = Math.ceil( data.length / limitNum );
					var data = data.splice( skipNum*limitNum, limitNum );
					cb( null, {
						limitNum,
						skipNum,
						totalNum,
						data
					});
					db.close();
				} );
				
				
			}
			
		], ( err, result ) => {
			if ( err ) throw err;
//			console.log( result );
			var listLen = result.data.length;
			var limitNum = result.limitNum;
			var skipNum = result.skipNum;
			var totalNum = result.totalNum;

			res.render('directors', {
				result: result.data,
				listLen,
				limitNum,
				skipNum,
				totalNum
			});
		} );
	},
	deleteDirectorRouter: ( req, res, next ) => {
		var { id, limitNum, skipNum } = url.parse( req.url, true ).query;
		console.log(id)
		async.waterfall( [
			( cb ) => {
				MongoClient.connect( mongoUrl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, db );
				})
			},
			( db, cb ) => {
				db.collection('directors').deleteOne( { id: id }, ( err, res ) => {
					if ( err ) throw err;
					cb( null, 'ok' );
					db.close();
				});
			}
			
		], ( err, result ) => {
			if ( err ) throw err;
			if ( result == 'ok' ) {
				skipNum = skipNum == 0 ? 0 : skipNum - 1 ;
				res.redirect( '/directorspaging?limitNum='+limitNum+'&skipNum='+skipNum );
			}
			
		})
	},
	addDirectorRoute: ( req, res, next ) => {
		res.render( 'director_add' );
	},
	directorAddAction: ( req, res, next ) => {
//		console.log( req.body );
		var obj = req.body;
		obj.avatars = {
			"small": obj.img,
			"large": obj.img,
			"medium": obj.img
		}
		var insertObj = obj;
		async.waterfall( [
			( cb ) => {
				MongoClient.connect( mongoUrl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, db );
				});
			},
			( db, cb ) => {
				db.collection('directors').insert( insertObj, ( err, res ) => {
					if ( err ) throw err;
					cb( null, 'ok' );
					db.close();
				});
			}
		], ( err, result ) => {
			if ( err ) throw err;
			if ( result == 'ok' ) {
				res.redirect('/directorspaging?limitNum=5&skipNum=0');
			}
		});
	
	},
	updateDirectorRoute: ( req, res, next ) => {
		var { id, limitNum, skipNum } = url.parse( req.url, true ).query;
		async.waterfall( [
			( cb ) => {
				MongoClient.connect( mongoUrl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, db );
				})
			},
			( db, cb ) => {
				db.collection('directors').find( { id: id }, { _id: 0 } ).toArray( ( err, data ) => {
					if ( err ) throw err;
					cb( null, data );
					db.close();
				} );
			}
			
		], ( err, result ) => {
			if ( err ) throw err;
//			console.log( result )
			var { id, name, alt } = result[0];
			var img = result[0].avatars.small;
//			console.log( id );
			res.render( 'director_update', {
				id,
				name,
				alt,
				img,
				skipNum,
				limitNum
			} );
			
		} );
//		res.render( 'director_update' );
	},
	undateDirectorAction : ( req, res, next ) => {
		var obj = req.body;
		obj.avatars = {
			'small': obj.img,
			'large': obj.img,
			'medium': obj.img
		}
		var whereObj = {
			id: obj.id
		}
		var updateObj = {
			$set: {
				id: obj.id,
				name: obj.name,
				alt: obj.alt,
				avatars: obj.avatars
			}
		}
//		console.log( req.body );
		
		async.waterfall( [
			( cb ) => {
				MongoClient.connect( mongoUrl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, db );
				} );
			},
			( db, cb ) => {
				db.collection('directors').updateOne( whereObj, updateObj, ( err, data ) => {
					if ( err ) throw err;
					cb( null, 'ok' );
					db.close();
				} );
			}
		],( err, result ) => {
			if ( err ) throw err;
			if( result == 'ok' ){
				// res.send('<script> history.go(-2); location.reload()</script>')
//              var skipNum = obj.skipNum == 0 ? 0 : obj.skipNum - 1;
                res.redirect('/directorspaging?limitNum='+obj.limitNum+'&skipNum='+obj.skipNum);
			}
		} );
		
	}
	
}
