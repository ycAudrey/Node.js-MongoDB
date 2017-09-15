var express = require("express");
var bodyParser = require('body-parser'); //用于post请求,.解析参数
var ObjectId = require('mongodb').ObjectID;
var app = express();

var post = 3002;
var hostName = 'localhost';

app.all("*",function(req,res,next){
	res.header('Access-Control-Allow-Origin', '*');
	res.header("Access-Control-Allow-Headers", "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name");
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Credentials', true);
	next();
});	

//解析表单数据,针对POST请求
app.use(bodyParser.urlencoded({ extended: true })); 

//查询学生信息
app.get('/queryStudents',function(req,res){
	var query = req.query ;
	var search = null;
	if( !query.name && query.age ){ search = {"age":query.age} }
	//i不区分大小写,动态查询指定条件时，要用eval()动态解析指定的条件
	else if( query.name && !query.age ){ search = { name:eval("/"+query.name+"/i")}; }
	else{ search = query; }
	var mongoClient = require('mongodb').MongoClient;
	mongoClient.connect('mongodb://127.0.0.1:27017/test',function(err,db){
		if(err) throw err;
		var dd = db.collection('students').find(search).toArray(function(err,result){
			if(err) throw err;
			if(result.length>0){
				res.send(result);
			}else{
				res.send({});
			}
			db.close();
		})
	})	
})

//修改学生信息
app.post('/updateStudents',function(req,res){
	var mongoClient = require('mongodb').MongoClient;
	mongoClient.connect('mongodb://127.0.0.1:27017/test',function(err,db){
		if(err) throw err;
		db.collection('students').save(
			{
				"_id":ObjectId(req.body["_id"]),
				"name":req.body.name,
				"age":req.body.age
			}
			,
			function(err,result){
				if(err) throw err;
				res.send(result);
				db.close();
			}
		)
	})
})

//增加学生信息
app.post('/insertStudents',function(req,res){
	var mongoClient = require('mongodb').MongoClient;
	mongoClient.connect('mongodb://127.0.0.1:27017/test',function(err,db){
		db.collection('students').insert({
			"name":req.body.name,
			"age":req.body.age
		},function(err,result){
			if(err) throw err;
			res.send(result.result);
			db.close();
		})
	})
})

//删除学生信息
app.get('/deleteStudents',function(req,res){
	var mongoClient = require('mongodb').MongoClient;
	mongoClient.connect('mongodb://127.0.0.1:27017/test',function(err,db){
		db.collection('students').remove({
			"_id" : ObjectId(req.query["_id"])
			// "name" : req.query.name,
			// "age" : req.query.age
		}
		,function(err,result){
			if(err) throw err;
			res.send(result);
			db.close();
		})
		
	})
})

app.get('/',function(req,res){
	res.end();
})

app.listen(post,function(){
	console.log('Listening on post:',post,"...");
})
