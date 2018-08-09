var async = require('async');
var { MongoClient } = require('mongodb');

var url = require('url');

var mongoUrl = 'mongodb://localhost:27017/mydatabase';

module.exports = {
	defaultRouter: ( req, res, next ) => {
		
		var { areaType, num, min, max } = url.parse( req.url, true ).query;
		
		async.waterfall( [
			( cb ) => {
				MongoClient.connect( mongoUrl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, db );
				});
			},
			( db, cb ) => {
				db.collection('movies').distinct('year', ( err, yearArr ) => {
					if ( err ) throw err;
					cb( null, db, yearArr );
				});
			},
			( db, yearArr, cb ) => {
				db.collection('movies').find( {}, {} ).toArray( ( err, data ) => {
					if ( err ) throw err;
					yearArr = yearArr.sort( (a,b)=>{return b-a} );
					cb( null, {
						data,
						yearArr
					});
					db.close();
				} );
					
			}
		], ( err, result ) => {
			if ( err ) throw err;
//			res.render('movie', {
//				result: result.data,
//				yearArr: result.yearArr,
//				areaType,
//				min,
//				max
//			});
		res.send( result.data );
		});
	},
	sortMovieRouter: ( req, res, next ) => {
		var { areaType, num, min, max } = url.parse( req.url, true ).query;
		var sortObj = {};
		sortObj[areaType] = num*1;
		
		async.waterfall( [
			( cb ) => {
				MongoClient.connect( mongoUrl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, db );
				})
			},
			( db, cb ) => {
				db.collection('movies').distinct('year', ( err, yearArr) => {
					if ( err ) throw err;
//					console.log(yearArr)
					cb( null, yearArr, db );
				})
			},
			( yearArr, db, cb ) => {
				db.collection('movies').find( {}, {} ).sort( sortObj ).toArray( ( err, res ) => {
					if ( err ) throw err;
//					console.log(yearArr)
					cb( null, {
						res, 
						yearArr
					});
					db.close();
				});
			}
			
		], ( err, result ) => {
			if ( err ) throw err;
//			res.render('movie', {
//				yearArr: result.yearArr,
//				result: result.res,
//				areaType,
//				min,
//				max
//			});
		res.send( result )
		});
	},
	getMovie: ( req, res, next ) => {
		var { movieYear, areaType, min, max } = url.parse( req.url, true ).query;
		async.waterfall( [
			( cb ) => {
				MongoClient.connect( mongoUrl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, db );
				})
			},
			( db, cb ) => {
				db.collection('movies').distinct('year', ( err, yearArr ) => {
					if ( err ) throw err;
					cb( null, db, yearArr );
				});
			},
			( db, yearArr, cb ) => {
				db.collection('movies').find({year:movieYear},{}).toArray( ( err, data ) => {
					if ( err ) throw err;
					cb( null, {
						data,
						yearArr
					} );
					db.close();
				});
			}
			
		], ( err, result ) => {
			if ( err ) throw err;
//			res.render('movie',{
//				result: result.data,
//				yearArr: result.yearArr,
//				areaType,
//				min,
//				max
//			});
			res.send( result.data )
		})
	},
	areaQueryMovie: ( req, res, next ) => {
		
		var { areaType, min, max } = url.parse( req.url,true ).query;
		
		var whereObj = {};
		
		min = min*1 < 0 ? 0 : min*1;
		max = max*1 > 10 ? 10 : max*1
		
		whereObj[areaType] = {
			$gte: min,
			$lte: max
		};
		
		
//		console.log( whereObj );
		async.waterfall( [
			( cb ) => {
				MongoClient.connect( mongoUrl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, db );
				})
			},
			( db, cb ) => {
				db.collection('movies').distinct('year', ( err, yearArr ) => {
					if ( err ) throw err;
					cb( null, db, yearArr );
				});
			},
			( db, yearArr, cb ) => {
				db.collection('movies').find(whereObj,{}).toArray( ( err, data ) => {
					if ( err ) throw err;
					console.log(data )
					cb( null, {
						data,
						yearArr
					} );
					db.close();
				});
			}
			
		], ( err, result ) => {
			if ( err ) throw err;
			console.log(result.data);
//			res.render('movie',{
//				result: result.data,
//				yearArr: result.yearArr,
//				areaType,
//				min,
//				max
//			});
			res.send(result.data)
		})
	},
	searchMovie: ( req, res, next ) => {
		
		var { title, areaType, min, max } = url.parse( req.url, true ).query;
		
		async.waterfall( [
			( cb ) => {
					MongoClient.connect( mongoUrl, ( err, db ) => {
						if ( err ) throw err;
						cb( null, db );
					})
				},
				( db, cb ) => {
					db.collection('movies').distinct('year', ( err, yearArr ) => {
						if ( err ) throw err;
						cb( null, db, yearArr );
					});
				},
				( db, yearArr, cb ) => {
					db.collection('movies').find({title:eval('/'+title+'/')},{}).toArray( ( err, data ) => {
						if ( err ) throw err;
						console.log(data )
						cb( null, {
							data,
							yearArr
						} );
						db.close();
					});
				}
				
			], ( err, result ) => {
				if ( err ) throw err;
				console.log(result.data);
//				res.render('movie',{
//					result: result.data,
//					yearArr: result.yearArr,
//					areaType,
//					min,
//					max
//				});
				res.send(result.data)
			})
	}
	
	
	
}
