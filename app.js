
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer();
var port = (process.env.VMC_APP_PORT || 3001);
var host = (process.env.VCAP_APP_HOST || 'localhost');

if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
  var mongo = {
    "hostname":"localhost",
    "port":27017,
    "username":"",
    "password":"",
    "name":"",
    "db":"db"
  }
}

var generate_mongo_url = function(obj){
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'test');

  if(obj.username && obj.password){
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
  else{
    return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
}

var mongourl = generate_mongo_url(mongo);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'Fv0rV8Ux8j' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);

// creates a location
app.post('/v.1/locations', function(req, res){
	require('mongodb').connect(mongourl, function(err, conn){
	  conn.collection('locations', function(err, coll){
	    coll.insert( req.body, {safe:true}, function(err){
			res.writeHead(200, {
			  "Content-Type": "application/json",
			  "Access-Control-Allow-Origin": "*"
			});
			res.end(JSON.stringify(req.body));
	    });
	  });
	});
 });

// returns list of locations
app.get('/v.1/locations', function(req, res){

	require('mongodb').connect(mongourl, function(err, conn){
	  conn.collection('locations', function(err, coll){
	    coll.find(function(err, cursor) {
			cursor.toArray(function(err, items) {
				res.writeHead(200, {
				  "Content-Type": "application/json",
				  "Access-Control-Allow-Origin": "*"
				});
				res.end(JSON.stringify(items));
			});
	    });
	  });
	});

 });

// returns list of favorite locations for a user
app.get('/v.1/locations/favorites', function(req, res){

	res.writeHead(200, {
	  "Content-Type": "application/json",
	  "Access-Control-Allow-Origin": "*"
	});

	res.end(JSON.stringify({"results":"todo"}));

 });

// creates a new favorite for a user
app.post('/v.1/locations/favorites', function(req, res){

	res.writeHead(200, {
	  "Content-Type": "application/json",
	  "Access-Control-Allow-Origin": "*"
	});

	res.end(JSON.stringify({"results":"todo"}));

 });

// returns a location
app.get('/v.1/locations/:location_id', function(req, res){

	var ObjectID = require('mongodb').ObjectID;
	
	require('mongodb').connect(mongourl, function(err, conn){
	  conn.collection('locations', function(err, coll){
	    coll.findOne({'_id':new ObjectID(req.params.location_id)}, function(err, document) {
			res.writeHead(200, {
			  "Content-Type": "application/json",
			  "Access-Control-Allow-Origin": "*"
			});
			res.end(JSON.stringify(document));
	    });
	  });
	});
	
 });

// creates a new facility for a location
app.post('/v.1/locations/:location_id/facilities', function(req, res){
	
	// add the location id to the json
	var facility = req.body;
	facility['location'] = req.params.location_id;

	require('mongodb').connect(mongourl, function(err, conn){
	  conn.collection('facilities', function(err, coll){
	    coll.insert( facility, {safe:true}, function(err){
			res.writeHead(200, {
			  "Content-Type": "application/json",
			  "Access-Control-Allow-Origin": "*"
			});
			res.end(JSON.stringify(facility));
	    });
	  });
	});

 });

// returns a list of facilities for a location
app.get('/v.1/locations/:location_id/facilities', function(req, res){

	require('mongodb').connect(mongourl, function(err, conn){
	  conn.collection('facilities', function(err, coll){
	    coll.find({location:req.params.location_id}, function(err, cursor) {
			cursor.toArray(function(err, items) {
				res.writeHead(200, {
				  "Content-Type": "application/json",
				  "Access-Control-Allow-Origin": "*"
				});
				res.end(JSON.stringify(items));
			});
	    });
	  });
	});

 });

// returns a facility
app.get('/v.1/locations/:location_id/facilities/:facility_id', function(req, res){

	var ObjectID = require('mongodb').ObjectID;
	
	require('mongodb').connect(mongourl, function(err, conn){
	  conn.collection('facilities', function(err, coll){
	    coll.findOne({'_id':new ObjectID(req.params.facility_id)}, function(err, document) {
			res.writeHead(200, {
			  "Content-Type": "application/json",
			  "Access-Control-Allow-Origin": "*"
			});
			res.end(JSON.stringify(document));
	    });
	  });
	});

 });

// updates a facility
app.put('/v.1/locations/:location_id/facilities/:facility_id', function(req, res){

	var ObjectID = require('mongodb').ObjectID;
	
	require('mongodb').connect(mongourl, function(err, conn){
	  conn.collection('facilities', function(err, coll){
	    coll.findAndModify({'_id':new ObjectID(req.params.facility_id)}, [['name','asc']], { $set: req.body }, {}, function(err, document) {
			res.writeHead(200, {
			  "Content-Type": "application/json",
			  "Access-Control-Allow-Origin": "*"
			});
			res.end(JSON.stringify(document));
	    });
	  });
	});

 });

app.listen(port, host);
console.log("Express server listening on port %d in %s mode", port, app.settings.env);
console.log("Mongodb listening on port %d", mongo['port']);
