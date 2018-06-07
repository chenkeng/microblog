var express = require('express');
var router = express.Router();
var crypto = require('crypto');//加密模块
var User = require("../models/user");//获得User对象
var Post = require('../models/post');//获取Post对象模型

/* GET home page. */
// 首页
router.get('/', function(req, res, next) {
    // 调用模板引擎，res.render(模板不带后缀名的文件名称, 传递给模板的数据对象);
  // res.render('index', { title: '首页' });
    //throw new Error('发生一个错误啦...');// 500异常测试
     Post.get(null, function (err, posts) {
         if(err){
             posts = [];
         }
         res.render('index', {
             title: '首页',
             posts: posts
         })
     })
});

// 注册
router.get("/reg", checkNotLogin);// 2
router.get('/reg', function (req, res) {
    res.render('reg', { title: '用户注册' });
});
router.post('/reg', function(req, res){
    // 检验用户两次输入口令是否一致
    if(req.body['password-repeat'] != req.body['password']){
        req.flash('error', '两次输入口令不一致');
        return res.redirect('/reg');
    }
    // 口令加密
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    var newUser = new User({
        name: req.body.username,
        password: password
    });

    //检查用户名是否已经存在
    User.get(newUser.name, function(err, user){
        if(user){
            err = '用户已经存在.';
        }
        if(err){
            req.flash('error', err);
            return res.redirect('/reg');
        }
        //如果不存在，则新增用户，保存到数据库
        newUser.save(function (err) {
            if(err){
                req.flash('error', err);
                return res.redirect('/reg');//注册页
            }
            req.session.user = newUser;
            req.flash('success', '注册成功');
            res.redirect('/');//回到首页
        });
    });
});

// 登录
router.get("/login", checkNotLogin);// 2
router.get('/login', function (req, res) {
    res.render("login", {title: "用户登录"})
});
router.post('/login', function(req, res){
    var username = req.body.username;
    var pwd = req.body.password;
  // 口令加密
    var md5 = crypto.createHash('md5');
    var password = md5.update(pwd).digest('base64');

    User.get(username, function(err, user){
        if (!user) {
            req.flash('error', "用户不存在.");
            return res.redirect("/login");
        }
        if(user.password != password){
            req.flash('error', "用户密码错误.");
            return res.redirect("/login");
        }
        req.session.user = user;
        req.flash('success', "登录成功.");
        res.redirect("/");// 跳转到首页
    });
});

// 登出
router.get('/logout', checkLogin);// 1
router.get('/logout', function (req, res) {
    req.session.user = null;// 清空session
    req.flash("success", "登出成功.");
    res.redirect("/");
});


// 发表微博
router.post('/post', checkLogin);// 1
router.post('/post', function(req, res){
    var currentUser = req.session.user;
    var post = new Post(currentUser.name, req.body.post);
    post.save(function (err) {
        if (err) {
            req.flash("error", err);
            res.redirect("/");
        }
        req.flash('success', '发表成功');
        res.redirect('/u/' + currentUser.name);
    })
});

// 某个用户页面
router.get('/u/:user', function(req, res){
    // 判断该用户是否存在
    User.get(req.params.user, function (err, user) {
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/');
        }
        Post.get(user.name, function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('user', {
                title: user.name,
                posts: posts
            });
        });
    });
});


// 1未登录，没有权限访问登出页面和功能
function checkLogin(req, res, next){
    if (!req.session.user) {
        req.flash("error", '未登录');
        return res.redirect("/");
    }
    next();
}

// 2已登录，没有权限访问注册和登录页面和功能
function checkNotLogin(req, res, next) {
    if(req.session.user){
        req.flash("error", "已登录");
        return res.redirect("/");
    }
    next();
}

module.exports = router;
