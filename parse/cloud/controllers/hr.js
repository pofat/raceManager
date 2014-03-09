var _ = require('underscore');
var Mission = Parse.Object.extend("mission");
var hRequest = Parse.Object.extend("hrRequest");
var nhRequest = Parse.Object.extend("nhrRequest");
var nhResource = Parse.Object.extend('nhResource');
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
exports.listHreq = function(req, res) {
  if(Parse.User.current()){
    var query = new Parse.Query(hRequest);
    var mission = new Mission();
    mission.id = req.params.id;    
    Parse.User.current().fetch().then(function(user) {
      //result amount limit
      query.limit(500);
      query.equalTo("relatedMission", mission);
      //sort
      query.descending('createdAt');
      query.find({
        success: function(results){
          for(var i = 0; i < results.length; i++){
            if(typeof results[i].startTime != 'undefined')
              results[i].startTime = results[i].startTime.toLocaleString();
            if(typeof results[i].endTime != 'undefined')
              results[i].endTime = results[i].startTime.toLocaleString();
          }
          res.send(results);
        },
        error: function(results){
          res.send({});
        }
      });
    });
  }else{
    res.redirect('/login');
  } 
};
//create a new nhReauest
//TODO deal with date type
exports.create = function(req, res){
  if(Parse.User.current()){
  	var hrequest = new hRequest();
    var mission = new Mission();
    //find parent mission
    mission.id = req.params.id;
  	//add defualt project name to it
  	_.extend(req.body, {'project':projectName});
  	//change string to int
    if(isNaN(parseInt(req.body.numOfPpl)))
      req.body.numOfPpl = 0;
    else
      req.body.numOfPpl = parseInt(req.body.numOfPpl);
  	req.body.fullyAssigned = false;
  	//TODO transfer startTime and endTime to date type

    //hrequest.save(_.pick(req.body, 'jobContent', 'numOfPpl', 'startTime', 'endTime', 'wageType', 'fullyAssigned', 'gatherLocation', 'workLoaction', 'project'), {
    hrequest.save(_.pick(req.body, 'jobContent', 'numOfPpl', 'wageType', 'gatherLocation', 'workLoaction', 'project', 'note'), {
      success: function(hrequest) {
        alert('New object created with objectId: ' + hrequest.id);
        hrequest.set("relatedMission", mission);
        mission.fetch().then(function(mission){
          hrequest.set("group", mission.get("startGroup"));
          console.log("mission group = "+mission.get("startGroup"));
          hrequest.save();
          res.send(hrequest);
        });
      },
      error: function(hrequest, error) {      
        alert('Failed to create new object, with error code: ' + error.description);
        res.send({"success":false});
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
exports.update = function(req, res){
  if(Parse.User.current()){
  	var hrequest = new hRequest();
  	hrequest.id = req.body.id;
  	//hrequest.save(_.pick(req.body, 'jobContent', 'numOfPpl', 'startTime', 'endTime', 'wageType', 'fullyAssigned', 'gatherLocation', 'workLoaction', 'project')).then(function() {
      hrequest.save(_.pick(req.body, 'jobContent', 'numOfPpl', 'wageType', 'gatherLocation', 'workLoaction', 'note'), {
  	  success: function(hrequest) {
        alert('object update with objectId: ' + hrequest.id);
        res.send(hrequest);        
      },
      error: function(hrequest, error) {      
        alert('Failed to update object, with error code: ' + error.description);
        res.send({"success":false});
      }
  	});
  }else{
  	res.redirect('/login');
  }
};
//delete a hrequest
//TODO also delete nhrequest point to this one
exports.delete = function(req, res) {
  if(Parse.User.current()){
    var hrequest = new hRequest();
    hrequest.id = req.body.id;
    hrequest.destroy({
      success: function(hrequest) {
        alert("Success to delete object : "+hrequest.id);
        res.send({'success':true});
      },
      error: function(hrequest, error) {
        alert("fail to delete object , with error code : "+error.description);
        res.send({'success':false});
      }
    });
  }else{
    
  }
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

//link hreq to nhreq
exports.linkReq = function(req, res) {
  if(Parse.User.current()){
    var hrequest = new hRequest();
    var itemQuery = new Parse.Query(nhResource);
    itemQuery.limit(200);
    itemQuery.descending('createdAt');
    hrequest.id = req.query.reqId;
    Parse.User.current().fetch().then(function(user) {
    hrequest.fetch().then(function(result){
      itemQuery.find().then(function(item) {
        res.render("request/linkReq", {
          result:result,
          item:item
        });
      });
    });
    });
  }else{
    res.redirect('/login');
  }
};
//create nhrequest and then update link relation
//TODO nhrequest must point to its parent mission
exports.updateReqlink = function(req, res) {
  if(Parse.User.current()){
    var hrequest = new hRequest();
    hrequest.id = req.params.id;
    for(var i = 0; i < req.body.itemName.length; i++){
      var nhrequest = new nhRequest();
      if(isNaN(parseInt(req.body.amount[i]))){
        req.body.amount[i] = 0;
      }else{
        req.body.amount[i] = parseInt(req.body.amount[i]);
      }
        
      nhrequest.save({"itemName":req.body.itemName[i], "amount":req.body.amount[i], "location":req.body.location[i], "note":req.body.note[i]}, {
        success: function(nhrequest){
          alert("create new object with id : "+nhrequest.id);
          hrequest.set("relatedNhReq", nhrequest);
          hrequest.save();
        },
        error: function(nhrequest, error){
          alert("fail to creat object with error code: "+ error.description);
        }
      });
    }
    //todo need better redirection
    res.redirect('/mission');
  }else{
    res.redirect('/login');
  }
};
//ui for link hreq and hres
exports.linkRes = function(req, res) {
  if(Parse.User.current()){
    var hrequest = new hRequest();
    var hresQuery = new Parse.Query(HumanResource);
    hrequest.id = req.body.assignId;
    Parse.User.current().fetch().then(function(user) {
      res.send("yest");
    });
  }else{
    res.redirect('/login');
  }
};

