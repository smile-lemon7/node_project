var express = require('express');

var router = express.Router(); //创建一个新的路由

var multer = require('multer');
var upload = multer({ dest: 'uploads/' });



var defaultRouter = ( req, res, next ) => {
	if ( req.cookies.loginState == '1' ) {
		res.render('index');
	} else {
		res.render('login');
	}
};

var casts = require('./casts');
var directors = require('./directors');
var users = require('./users');
var banner = require('./banner');
var movie = require('./movie');
var login = require('./login');


//router.method(url,callback)
/* GET home page. */

router.get('/', defaultRouter);   

router.get('/casts', casts.defaultRouter);

router.get('/directors', directors.defaultRouter);
router.get('/directorspaging', directors.pageRouter);
router.get('/deleteDirectorRouter', directors.deleteDirectorRouter);
router.get('/addDirectorRoute', directors.addDirectorRoute);
router.post('/directorAddAction', directors.directorAddAction);
router.get('/updateDirectorRoute', directors.updateDirectorRoute);
router.post('/undateDirectorAction', directors.undateDirectorAction);



router.get('/movie', movie.defaultRouter);
router.get('/sortMovie', movie.sortMovieRouter);
router.get('/getMovie', movie.getMovie);
router.get('/areaQueryMovie', movie.areaQueryMovie);
router.get('/searchMovie', movie.searchMovie);

router.get('/users', users.defaultRouter);

router.get('/banner', banner.defaultRouter);
router.get('/addBannerRoute', banner.addBannerRoute);
router.post('/bannerAddAction',upload.single('bannerImg'), banner.bannerAddAction);


router.post('/adminLoginRouter', login.adminLoginRouter);
router.get('/adminLoginOut', login.adminLoginOut);



module.exports = router;