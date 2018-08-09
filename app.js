var createError = require('http-errors');
var express = require('express');  //引入express模块
var path = require('path');   //路径模块
var cookieParser = require('cookie-parser');  //cookie
var logger = require('morgan');  //日志



//引入路由模块

var indexRouter = require('./routes/index');
var apiIndex = require('./api/index');


var app = express();   //创建服务器

// view engine setup   //设置视图格式

//__dirname是当前文件的绝对路径（），找到该文件主要进行路径的合并，然后设置第二个参数使用欧冠第一个参数代替
app.set('views', path.join(__dirname, 'views'));  
app.set('view engine', 'ejs');  //设置视图文件的后缀名

// uncomment after placing your favicon in /public  ---  图标  -- 将图标放在public文件夹下之后打开此注释语句
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//静态资源地址，在当前目录下（根目录以及根目录中的任意一个文件中）可以直接访问指定目录下的文件
app.use(express.static(path.join(__dirname, 'public'))); //设置静态资源路径，使用public文件夹下的文件时，不用写public,可以查看index.ejs
app.use(express.static(path.join(__dirname, 'uploads'))); //设置静态资源路径，使用public文件夹下的文件时，不用写public,可以查看index.ejs


app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

//注册路由  必不可少
app.use('/', indexRouter); 
app.use('/api', apiIndex); 


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
