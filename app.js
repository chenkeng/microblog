// 1日志
var fs = require('fs');
var logger = require('morgan');// morgan中间件记录日志
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var moment = require('moment');// 时间格式化（外加模块）



//加载路由控制
var index = require('./routes/index');
// var users = require('./routes/users');
var settings = require('./settings');


//创建项目实例
var app = express();

// 1日志文件
var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});// 1请求日志
var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});// 2错误日志


// 设置模板引擎 和 页面模板的位置
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));//__dirname 当前文件所在目录的完整目录名, 或 __dirname + '/views'


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));//定义icon图标
app.use(logger('dev'));//定义日志和输出级别，将请求信息 -打印在控制台-
app.use(logger('combined', {stream: accessLogfile}));// 1-存在文件中-

//定义数据解析器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//定义cookie解析器
app.use(cookieParser());
//定义静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
//定义session会话
app.use(session({
    resave:false,
    saveUninitialized:true,
    secret: settings.cookieSecret,
    //连接数据库
    store: new MongoStore({
        // db: settings.db
        url: 'mongodb://localhost/' + settings.db
    })
}));
app.use(flash());
//console.log("环境变量=" + process.env.NODE_ENV);

app.use(function(req, res, next){
    console.log('===locals value. start..===');
    res.locals.user = req.session.user;

    var error = req.flash("error");
    console.log("===错误===" + error);
    var success = req.flash('success');
    console.log("===成功===" + success);

    res.locals.error = error.length ? error : null;
    res.locals.success = success.length ? success : null;

    next();
});
//匹配路径和路由
app.use('/', index);//首页
app.use('/u/:user', index);//用户主页
app.use('/post', index);//发表信息
app.use('/reg', index);//用户注册
app.use('/login', index);//用户登录
app.use('/logout', index);//用户登出

/*app.get('/helper', function(req, res){//ok
    res.render('index', { title: 'helpers'});
});*/







//xzl测试用
/*app.use('/hello', index);
app.get('/user/:username', function (req, res, next) {
    console.log("do all request");
    next();//路由控制权转移给后面的路由规则
});
app.get('/user/:username', function (req, res) {
    //res.send("完成新增");
    res.send("user=" + req.params.username);
});*/

//next()方法使用
/*var users = {
  "minimey": {
      name: "xzl",
      website: "http://www.minimey.com"
  }
};
app.all("/user/:username", function(req, res, next){
  if(users[req.params.username]){
    next();
  } else {
    next(new Error(req.params.username + '不存在..'));
  }
});
app.get('/user/:username', function (req, res, next) {
  // 用户一定存在，直接展示
    res.send(JSON.stringify(users[req.params.username]));
});
app.put('/user/:username', function(req, res, next){
  //添加用户信息
    res.send('完成');
});

//include使用
app.get('/list', function(req, res, next){
  res.render('list', {
      title: '数据列表',
      items: ['apple', 'pen', 'applepen']
  });
});*/

//locals对象用于将 数据 传递至所渲染的模板中(4.x).给视图注册全局变量
/*var util = require('util');
app.locals.inspect = function(obj){
    return util.inspect(obj, true);
};
app.use(function(req,res, next){
    res.locals.headers = req.headers;
    next();
});
app.get('/helper', function(req, res){
    res.render('helper', { title: 'helpers'});
});*/






// 开发模式
//404错误处理
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler，500错误处理
/*app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});*/

// 产品模式 错误处理
app.use(function (err, req, res, next) {
    // console.log(" req.app.get('env')=="+ req.app.get('env'));
    var meta = '[' + moment(new Date()).format('YYYY-MM-DD HH:mm:ss') + ']' + req.url + '\n';
    errorLogfile.write(meta + err.stack + '\n');
    next();
});

//输出模板app     
module.exports = app;
