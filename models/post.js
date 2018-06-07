/**
 * Created by xzl on 2017/11/29.
 */
var mongodb = require('./db');
var moment = require('moment');

function Post(username, post, time){
    this.user = username;
    this.post = post;
    if (time) {
        this.time = time;
    } else {
        this.time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    }
};
module.exports = Post;

//保存内容到数据库
Post.prototype.save = function save(callback){
    // 存入Mongodbd 的文档(json对象)
    var post = {
        user: this.user,
        post: this.post,
        time: this.time
    };
    //打开数据库
    mongodb.open(function (err, db) {// db为Db对象实例
        if (err) {
            mongodb.close();
            return callback(err);
        } else {
            console.log("数据库打开成功");
        }
        // 读取 posts （表）
        db.collection('posts', function(err, collection){
            if (err) {
                mongodb.close();
                return callback(err);
            }
            // 为user属性添加索引
            collection.ensureIndex('user');
            // 写入 post 文档
            collection.insert(
                post,
                {safe: true},
                function (err, post) {
                    mongodb.close();
                    callback(err, post);
                }
            );
        });
    });
};

// 读取数据
Post.get = function get(username, callback) {
    mongodb.open(function(err, db){
        if (err) {
            return callback(err);
        }
        // 读取 posts(表) db.collection(表名, function(err, collection))
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            // 查找 user属性 =username的文档，如果username=null 则查询全部
            var query = {};
            if (username) {
                query.user = username;
            }
            collection.find(query).sort({time: -1}).toArray(function(err, docs) {
                mongodb.close();
                if (err) {
                    callback(err, null);
                }
                // 封装 posts 为 Post对象
                var posts = [];
                docs.forEach(function (doc, index) {
                   var post = new Post(doc.user, doc.post, doc.time);
                   posts.push(post);
                });
                callback(null, posts);
            });
        });
    });
};


