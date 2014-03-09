var _ = require('underscore');
var Mission = Parse.Object.extend("mission");
var nhRequest = Parse.Object.extend("nhrRequest");
var nhResource = Parse.Object.extend("nhResource");
//default project name
var projectName = "2014東馬";
//display all nhrequest
exports.index = function(req, res) {
  if(Parse.User.current()){
  	var query = new Parse.Query(nhRequest);  	
    Parse.User.current().fetch().then(function(user) {
      //result amount limit
      query.limit(200);
      //sort
      query.descending('createdAt');
      query.find().then(function(nhrequests) {
        res.render('request/nh_index', { 
          nhrequests: nhrequests        
        });
      },
      function() {
        res.send(500, 'Failed loading your non-human resource requests!');
      });
    });
  }else{
  	res.redirect('/login');
  } 
};
//show creating ui
exports.new = function(req, res) {
  //show all nhResource
  var query = new Parse.Query(nhResource);
  query.limit(200);
  query.descending('createdAt');
  query.find().then(function(resources){
  	var types = [];
  	if(types.indexOf(resources[i].get('type')) == -1) {
      types.push(resources[i].get('type'));
    }
  	res.render('request/nh_new', {
  		types:types,
  		resources:resources
  	});
  });  
};
//create a new nhReauest
//TODO:connect this nhrquest to its own mission
exports.create = function(req, res){
  if(Parse.User.current()){
  	var nhrequest = new nhRequest();
    var mission = new Mission();
    mission.id = req.params.id;
  	//add defualt project name to it
  	_.extend(req.body, {'project':projectName});
  	//change string to int
    if(isNaN(parseInt(req.body.progress)))
      req.body.progress = 0;
    else
      req.body.progress = parseInt(req.body.progress);
  	if(isNaN(parseInt(req.body.amount)))
      req.body.amount = 0;
    else
      req.body.amount = parseInt(req.body.amount);
    nhrequest.save(_.pick(req.body, 'itemName', 'amount', 'personIncharge', 'ownType', 'source', 'location', 'progress', 'note', 'project'), {
      success: function(nhrequest) {      
        alert('New object created with objectId: ' + nhrequest.id);
        nhrequest.set("relatedMission", mission);
        mission.fetch().then(function(mission) {
        	//link thie request to its parent mission        	
          nhrequest.set("group", mission.get("startGroup"));
          console.log("mission group = "+mission.get("startGroup"));
        	nhrequest.save();
        	res.send(nhrequest);
        });        
      },
      error: function(nhrequest, error) {      
        alert('Failed to create new object, with error code: ' + error.description);
        res.send({});
      }
    });    
  }else{
  	res.redirect('/login');
  }
};
//show certain nhrequest
exports.show = function(req, res){	
  if(Parse.User.current()){
  	var nhrequestQuery = new Parse.Query(nhRequest);
  	Parse.User.current().fetch().then(function(user) {
      nhrequestQuery.get(req.params.id).then(function(nhrequest) {
        var relatedMission = nhrequest.get("relatedMission");
        var relatedHrRequest = nhrequest.get("relatedHrRequest");
        res.render('request/nh_show', {
        	mission:relatedMission,
        	hrequest:relatedHrRequest
        });
      },
      function() {
        res.send(500, 'Failed finding the specified resource request to show');
      });
    });  	
  }else{
  	res.redirect('/login');
  }
};
//update a nhrequest
//TODO : update relatedHrRequest not available
exports.update = function(req, res){
  if(Parse.User.current()){
  	var nhrequest = new nhRequest();
  	nhrequest.id = req.body.id;
  	nhrequest.save(_.pick(req.body, 'itemName', 'amount', 'personIncharge', 'ownType', 'source', 'location', 'progress', 'note', 'project'), {
      success: function(nhrequest){
        alert('object update with objectId: ' + nhrequest.id);
        res.send(nhrequest);       
      },
      error: function(nhrequest, error){
        alert('update nhreq object error with err code :'+error.description);
        res.send({});
      }
  	});
  }else{
  	res.redirect('/login');
  }
};
//delete a nhrequest
exports.delete = function(req, res) {
  var nhrequest = new nhRequest();
  nhrequest.id = req.params.id;  
  nhrequest.destroy().then(function(){
    res.redirect('/nhrequest');
  });
};


//for jeasyui 
exports.listNhreq = function(req, res) {
  if(Parse.User.current()){
    var query = new Parse.Query(nhRequest);
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
          res.send(results);
        },
        error: function(results, error){
          alert("get nhrequst list error with err code: "+ error.description);
          res.send({});
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
    var nhresource = new nhResource();
    //add defualt project name to it
    _.extend(req.body, {'project':projectName});
    //change string to int
    if(isNaN(parseInt(req.body.unitPrice)))
      req.body.unitPrice = 0;
    else
      req.body.unitPrice = parseInt(req.body.unitPrice);
    
    nhresource.save(_.pick(req.body, 'itemName', 'note', 'size', 'unit', 'unitPrice', 'source', 'deliverer', 'type', 'project'), {
      success: function(nhresource) {
        alert('New object created with objectId: ' + nhresource.id);        
        res.send(nhresource);    
      },
      error: function(nhresource, error) {      
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
    var nhresource = new nhResource();
    nhresource.id = req.body.objectId;
    nhresource.set("itemName", req.body.itemName);
    nhresource.set("note", req.body.note);
    nhresource.set("size", req.body.size);
    nhresource.set("unit", req.body.unit);
    if(isNaN(parseInt(req.body.unitPrice)))
      req.body.unitPrice = 0
    else
      req.body.unitPrice = parseInt(req.body.unitPrice);
    nhresource.set("unitPrice", req.body.unitPrice);
    nhresource.set("source", req.body.source);
    nhresource.set("deliverer", req.body.deliverer);
    nhresource.set("type", req.body.type);
    nhresource.save(null, {
      success: function(nhresource) {
        res.send(nhresource);
      },
      error: function(nhresource, error) {
        alert("update failed with error code: "+error.description);
        res.send({});
      }
    });
  }else{
    res.redirect('/login');
  }
};
