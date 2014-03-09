var _ = require('underscore');
var Mission = Parse.Object.extend("mission");
var hRequest = Parse.Object.extend("hrRequest");
var nhRequest = Parse.Object.extend("nhrRequest");
var HumanResource = Parse.Object.extend("humanResource");
//default project name
var projectName = "2014東馬";
//display all hrequest
exports.index = function(req, res) {
  if(Parse.User.current()){
  	var query = new Parse.Query(hRequest);  	
    Parse.User.current().fetch().then(function(user) {
      //result amount limit
      query.limit(200);
      //sort
      query.descending('createdAt');
      query.find().then(function(hrequests) {
        res.render('request/h_index', { 
          hrequests: hrequests        
        });
      },
      function() {
        res.send(500, 'Failed loading your human resource requests!');
      });
    });
  }else{
  	res.redirect('/login');
  } 
};
//show creating ui
exports.new = function(req, res) {
    
};
//create a new nhReauest
//TODO:connect this hrquest to its own mission
exports.create = function(req, res){
  if(Parse.User.current()){
  	var hrequest = new hRequest();
  	//add defualt project name to it
  	_.extend(req.body, {'project':projectName});
  	//change string to int
    if(isNaN(parseInt(req.body.numOfPpl)))
      req.body.numOfPpl = 0;
    else
      req.body.numOfPpl = parseInt(req.body.numOfPpl);
  	req.body.fullyAssigned = false;
  	//TODO transfer startTime and endTime to date type
    hrequest.save(_.pick(req.body, 'jobContent', 'numOfPpl', 'startTime', 'endTime', 'wageType', 'fullyAssigned', 'gatherLocation', 'workLoaction', 'project'), {
      success: function(hrequest) {      
        alert('New object created with objectId: ' + hrequest.id);
        var missionQuery = new Parse.Query(Mission);
        missionQuery.get(req.params.mission_id).then(function(mission) {
        	//link thie request to its parent mission
        	hrequest.set("relatedMission", mission);
        	hrequest.save().then(function(){
        		//TODO need discuss
        		res.redirect('/hrequest');
        	});
        });        
      },
      error: function(hrequest, error) {      
        alert('Failed to create new object, with error code: ' + error.description);
        res.redirect('/hrequest');
      }
    });    
  }else{
  	res.redirect('/login');
  }
};
//show certain nhrequest
exports.show = function(req, res){	
  if(Parse.User.current()){
  	var hrequestQuery = new Parse.Query(hRequest);
  	Parse.User.current().fetch().then(function(user) {
      hrequestQuery.get(req.params.id).then(function(hrequest) {
        var relatedMission = hrequest.get("relatedMission");        
        res.render('request/h_show', {
        	mission:relatedMission
        });
      },
      function() {
        res.send(500, 'Failed finding the specified human request to show');
      });
    });  	
  }else{
  	res.redirect('/login');
  }
};
//update a hrequest
//TODO : update relatedHR not available
exports.update = function(req, res){
  if(Parse.User.current()){
  	var hrequest = new hRequest();
  	hrequest.id = req.params.id;
  	hrequest.save(_.pick(req.body, 'jobContent', 'numOfPpl', 'startTime', 'endTime', 'wageType', 'fullyAssigned', 'gatherLocation', 'workLoaction', 'project')).then(function() {
  	  res.redirect('/hrequest/'+hrequest.id);
  	});
  }else{
  	res.redirect('/login');
  }
};
//delete a hrequest
exports.delete = function(req, res) {
  var hrequest = new hRequest();
  hrequest.id = req.params.id;  
  hrequest.destroy().then(function(){
    res.redirect('/hrequest');
  });
};

//create a human resource
exports.createResource = function(req, res) {  
  if(Parse.User.current()){
  	var hresource = new HumanResource();
  	//add defualt project name to it
  	_.extend(req.body, {'project':projectName});
  	//change string to int
    if(isNaN(parseInt(req.body.unitWage)))
      req.body.unitWage = 0;
    else
      req.body.unitWage = parseInt(req.body.unitWage);
  	if(req.body.vegetarian == 'true')
  		req.body.vegetarian = true;
  	else
  		req.body.vegetarian = false;
  	
    hresource.save(_.pick(req.body, 'name', 'wageType', 'department', 'unitWage', 'wageUnit', 'idNumber', 'tel', 'email', 'tshirtSize', 'gender', 'vegetarian', 'project'), {
      success: function(hrequest) {
        alert('New object created with objectId: ' + hrequest.id);
        res.redirect('/hresource');        
      },
      error: function(hrequest, error) {      
        alert('Failed to create new object, with error code: ' + error.description);
        res.redirect('/hresource');
      }
    });    
  }else{
  	res.redirect('/login');
  }
};

//show human resource
//TODO may select filter condition
exports.show = function(req, res){	
  if(Parse.User.current()){
  	var hresourceQuery = new Parse.Query(HumanResource);
  	Parse.User.current().fetch().then(function(user) {
      hresourceQuery.get(req.params.id).then(function(hresource) {        
        res.render('request/h_show', {
        	hresource:hresource
        });
      },
      function() {
        res.send(500, 'Failed finding the specified human request to show');
      });
    });  	
  }else{
  	res.redirect('/login');
  }
};

//list human resource:test
exports.listResource = function(req, res) {
  if(Parse.User.current()){
    var hresourceQuery = new Parse.Query(HumanResource);
    hresourceQuery.limit(500);
    Parse.User.current().fetch().then(function(user) {
      hresourceQuery.find({
        success: function(results) {
          res.render('resource/h_list', {
            list:results
          });
        }
      });
    });   
  }else{
    res.redirect('/login');
  }
};
//create a resource
exports.createResource = function(req, res) {  
  if(Parse.User.current()){
    var hresource = new HumanResource();
    //add defualt project name to it
    _.extend(req.body, {'project':projectName});
    //change string to int
    if(isNaN(parseInt(req.body.unitPrice)))
      req.body.unitPrice = 0;
    else
      req.body.unitPrice = parseInt(req.body.unitPrice);
    
    hresource.save(_.pick(req.body, 'name', 'type', 'office', 'department', 'tel', 'email', 'group', 'project'), {
      success: function(hresource) {
        alert('New object created with objectId: ' + hresource.id);
        res.send(hresource);    
      },
      error: function(hresource, error) {      
        alert('Failed to create new object, with error code: ' + error.description);
        res.send({"success":false});
      }
    });    
  }else{
    res.redirect('/login');
  }
};
exports.updateResource = function(req, res){
  if(Parse.User.current()){
    var hresource = new HumanResource();
    hresource.id = req.body.objectId;
    hresource.set("name", req.body.name);
    hresource.set("type", req.body.type);
    hresource.set("office", req.body.office);
    hresource.set("department", req.body.department);
    hresource.set("tel", req.body.tel);
    hresource.set("email", req.body.email);
    hresource.set("group", req.body.group);
    hresource.save(null, {
      success: function(hresource) {
        res.send(hresource);
      },
      error: function(hresource, error) {
        alert("update failed with error code: "+error.description);
        res.send({});
      }
    });
  }else{
    res.redirect('/login');
  }
};
