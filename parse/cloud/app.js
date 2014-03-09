
// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var expressLayouts = require('cloud/express-layouts'); //ADD
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var parseExpressCookieSession = require('parse-express-cookie-session');
//my endpoint
var missionController = require('cloud/controllers/mission.js');
var nhrController = require('cloud/controllers/nhr.js');
var hrController = require('cloud/controllers/hr.js');
var adminController = require('cloud/controllers/admin.js');
var queryController = require('cloud/controllers/query.js')

var app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(expressLayouts);          // Use the layout engine for express
app.use(parseExpressHttpsRedirect());  // Require user to be on HTTPS.
app.use(express.bodyParser());
app.use(express.cookieParser('YOUR_SIGNING_SECRET'));
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 * 24 } }));
app.use(express.methodOverride());

//local information which can be accessible from each template
app.locals._ = require('underscore');
app.locals.test = "pofattt";//this can't be used in /profile

//main control page(show mission)
/*
app.get('/', function(req, res){
  if(Parse.User.current()){
    //app.locals.actName = Parse.User.current().get("username");
    var mission = Parse.Object.extend("mission");
    var query = new Parse.Query(mission);
    query.find({
      success: function(missions) {
        res.render('main', { missions:missions });
      },
      error: function(error) {
        console.error("Error: " + error.code + " " + error.message);
        // TODO an error page
      }
    });
  }else{
    res.redirect('/login');
  }
 

});
*/
//Homepage
app.get('/backup', function(req, res){
  if(Parse.User.current()){
    var resources = Parse.Object.extend("Resources");
    var query = new Parse.Query(resources);    
    var locs = [], groups = [], types = [];
    var req_group = req.query.group;
    var real_list =[];    
    var username;
    //query condition
    query.equalTo("progress", 0);
    //query amount limit
    query.limit(300);
    // TODO sort query 
    //query.ascending("location");   
    query.find({
      success: function(results) {
        console.log("Successfully retrieved " + results.length + " resources.");
        for(var i = 0; i < results.length; i++) {
          //filtered by require group
          if(req_group != "" && req_group != undefined) {
            if(req_group == results[i].get('requirer')) {
              real_list.push(results[i]);
              if(locs.indexOf(results[i].get('location')) == -1) {
                locs.push(results[i].get('location'));
              }
            }
            
          } else {//show all 
            if(locs.indexOf(results[i].get('location')) == -1) {
                locs.push(results[i].get('location'));
              }
          }
          //get requirer groups
          if(groups.indexOf(results[i].get('requirer')) == -1) {
            if(results[i].get('requirer') != "" && results[i].get('requirer') != undefined) {
              groups.push(results[i].get('requirer'));
            }
          }
          if(types.indexOf(results[i].get('type')) == -1) {
            types.push(results[i].get('type'));
          }
          
        }
        locs.sort();
        //show group result
        if(req_group != "" && req_group != undefined) {
          res.render('nhr', { results:real_list, locs:locs, groups:groups, requirer:req_group, types:types });
        } else {
          res.render('nhr', { results:results, locs:locs, groups:groups, requirer:"", types:types });            
        }        
      },
      error: function(error) {
        console.error("Error: " + error.code + " " + error.message);
      }
    });    
  }else {
    res.redirect('/login')
  }
});


//add new resource
app.post('/add', function(req, res) {
  //TODO need check same item
  if(Parse.User.current()){
    var Resources = Parse.Object.extend("Resources");
    var resource = new Resources();
    /* get full url paths
    var fullURL = req.protocol + "://" + req.get('host') + req.url;
    console.log("url is :"+fullURL);
    */
    resource.set("deadline", req.body.deadline);
    resource.set("type",req.body.type);
    resource.set("resource_name", req.body.resource_name);
    resource.set("location", req.body.location);
    resource.set("quantity", parseInt(req.body.quantity));
    resource.set("unit", req.body.unit);
    resource.set("unit_price", parseInt(req.body.unit_price));
    resource.set("person_incharge", req.body.person_incharge);
    resource.set("requirer", req.body.requirer);
    resource.set("source", req.body.source);
    resource.set("progress",0);
    resource.set("note", req.body.note);

    resource.save(null, {
    success: function(resource) {
      // Execute any logic that should take place after the object is saved.
      alert('New object created with objectId: ' + resource.id);
      res.redirect('/');
    },
    error: function(resource, error) {
      // Execute any logic that should take place if the save fails.
      // error is a Parse.Error with an error code and description.
      alert('Failed to create new object, with error code: ' + error.description);
      res.redirect('/');
    }
  });
} else {
  res.redirect('/login');
}
  
});


// User endpoints
app.use('/', require('cloud/user'));

//routes for missions
app.get('/', missionController.index);
app.get('/mission', missionController.index);
app.post('/mission', missionController.create);
app.get('/mission/:id', missionController.show);
app.put('/mission/:id', missionController.update);
app.post('/mission/updateContent/:id', missionController.updateContent);
//app.post('/mission/edit', missionController.update);
app.del('/mission/:id', missionController.delete);
//app.post('/mission/del', missionController.delete);
app.get('/getMission', missionController.showMission);//for easyui

//routes for reqeusts
app.get('/nhrequest', nhrController.index);
app.get('/nhrequest/edit', nhrController.new);//return type and itemName
app.post('/mission/:mission_id/nhrequest', nhrController.create);
app.get('/nhrequest/:id', nhrController.show);
app.put('/nhrequest/:id', nhrController.update);
app.del('/nhrequest/:id', nhrController.delete);
//app.post('/mission/:mission_id/nhrequest', nhrController.newLink);
//app.put('/nhrequest/:id/link', nhrController.updateLink);

app.get('/hrequest', hrController.index);
app.get('/hrequest/edit', hrController.new);//hrqeust create ui page
app.post('/mission/:mission_id/hrequest', hrController.create);
app.get('/hrequest/:id', hrController.show);
app.put('/hrequest/:id', hrController.update);
app.del('/hrequest/:id', hrController.delete);

//routes for human resource
app.post('/hr', hrController.createResource);
//app.get('/hr/:id', hrController.showResource);
//app.put('/hr/:id', hrController.updateResource);
//app.del('/hr/:id', hrController.deleteResource);
app.get('/hresource', hrController.listResource); //test usage, show all list

//routes for resource
app.post('/nhr', nhrController.createResource);
app.post('/nhrUpdate', nhrController.updateResource);
app.post('/hr', hrController.createResource);
app.post('/hrUpdate', hrController.updateResource);
//routes for admin
app.get('/admin', adminController.index);
app.post('/admin/showNhres', adminController.showNhResource);
app.post('/admin/delNhres', adminController.delNhResource);
app.post('/admin/showHres', adminController.showHResource);
app.post('/admin/delHres', adminController.delHresource);
//routes for querys
app.get('/query', queryController.index);

//app.post('/query/hresource', hrController.queryResource);

//endpoints
//app.get('/test', db.index);
// // Example reading from the request query string of an HTTP get request.
//app.get('/test', function(req, res) {
//   // GET http://example.parseapp.com/test?message=hello
//   res.send(req.query.message);
// });


// // Example reading from the request body of an HTTP post request.
// app.post('/test', function(req, res) {
//   // POST http://example.parseapp.com/test (with request body "message=hello")
//   res.send(req.body.message);
// });

// Attach the Express app to Cloud Code.
app.listen();
