/**
 * Created by xzl on 2017/11/22.
 */
var settings = require('../settings');
var mongo = require('mongodb');

//var Connection = mongo.Collection;
var Server = mongo.Server;
var Db = Db = mongo.Db;

//var port = Connection.DEFAULT_PORT;//端口默认27017
var server = new Server(settings.host, 27017, {auto_reconnect:true});
var db = new Db(settings.db, server, {safe: true});//数据库对象

module.exports = db;

