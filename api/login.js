var url = require('url');
var async = require('async');
var { MongoClient } = require('mongodb');

var mongoUrl = 'mongodb://localhost:27017/mydatabase';

module.exports = {
	defaultRouter: ( req, res, next ) => {
		 res.render('login');
	},
	adminLoginRouter: ( req, res, next ) => {
		var { username, password } = req.body;
		async.waterfall( [
			( cb ) => {
				MongoClient.connect( mongoUrl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, db );
				});
			},
			( db, cb ) => {
				db.collection('admin').find( { username, password }, {} ).toArray( ( err, data ) => {
					if ( err ) throw err;
					if ( data.length > 0 ) {
						cb( null, 1 );
					} else {
						cb( null, 0 );
					}
					db.close();
				});
			}
			
		], ( err, result ) => {
			if ( err ) throw err;
			if( result == 1 ) {
				res.cookie('loginState','1');
				res.redirect('/');
			} else {
				res.cookie('loginState','0');
				res.redirect('/');
			}
		});
	},
	adminLoginOut: ( req, res, next ) => {
		res.cookie('loginState','0');
		res.redirect('/');
	}
	
	
}
