var fs = require('fs');

var async = require('async');
var url = require('url');
var { MongoClient } = require('mongodb');

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
				db.collection('banner').find( {}, {}).toArray( ( err, data ) => {
					if ( err ) throw err;
					cb( null, data );
				});
			}
		], ( err, result) => {
			if ( err ) throw err;
			var len = result.length;
			res.render('banner',{
				result,
				len
			});
		});
	},
	addBannerRoute: ( req, res, next ) => {
		res.render('banner_add');
	},
	bannerAddAction: ( req, res, next ) => {
		console.log( req.file );
//		console.log( req.body );
		
		async.waterfall( [
			( cb ) => {
				var imgName = req.file.filename +'.'+ req.file.mimetype.split('/')[1];
				var oldName = './uploads/'+req.file.filename;
				var newName = './uploads/'+ imgName;
				
				fs.rename( oldName, newName, ( err, data ) => {
					if ( err ) throw err;
					cb( null, imgName );
				})
			},
			( imgName, cb ) => {
				MongoClient.connect( mongoUrl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, imgName, db );
				})
			},
			( imgName, db, cb ) => {
				var insertObj = {
					imgName,
					bannerID: req.body.bannerID,
					bannerUrl: req.body.bannerUrl
				}
				console.log( insertObj )
				db.collection('banner').insert( insertObj, ( err, data ) => {
					if ( err ) throw err;
					cb( null, 'ok' );
				} );
			}
		], ( err, result ) => {
			if ( err ) throw err;
			if( result == 'ok' ){
				res.redirect('/banner');
			}
		});
		
	}
	
	
}
