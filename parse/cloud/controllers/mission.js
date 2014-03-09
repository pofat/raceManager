var _ = require('underscore');
var Mission = Parse.Object.extend("mission");
var hRequest = Parse.Object.extend("hrRequest");
var nhRequest = Parse.Object.extend("nhrRequest");
//default project name
var projectName = "2014東馬";
//display all corresponding mission
exports.index = function(req, res) {
  if(Parse.User.current()){
  	var query = new Parse.Query(Mission);  	
    Parse.User.current().fetch().then(function(user) {
      group = user.get("group");      
      //only select related missions
      query.equalTo("startGroup", group);
      //result amount limit
      query.limit(200);
      //sort
      query.descending('createdAt');
      query.find().then(function(missions) {
        res.render('mission/index', { 
          missions: missions        
        });
      },
      function() {
        res.send(500, 'Failed loading your missions');
      });
    });
  }else{
  	res.redirect('/login');
  } 
};
//create a new mission
exports.create = function(req, res){
  if(Parse.User.current()){
  	var mission = new Mission();
  	//add defualt project name to it
  	_.extend(req.body, {'project':projectName});
  	//change string to int
    if(isNaN(parseInt(req.body.progress)))
      req.body.progress = 0;
    else
      req.body.progress = parseInt(req.body.progress);
    //change check to int
  	if(isNaN(parseInt(req.body.check)))
      req.body.check = 0;
    else
  	  req.body.check = parseInt(req.body.check);
    //change deadLine to date type
    var date = new Date();
    var post_date = req.body.deadLine.split('.');
    if(post_date.length == 3){
      date.setFullYear(post_date[2]);
      date.setMonth(post_date[1]-1);
      date.setDate(post_date[0]);
    }else
      date = null;
    req.body.deadLine = date;
    mission.save(_.pick(req.body, 'missionName', 'missionContent', 'startGroup', 'starter', 'deadLine', 'progress', 'note', 'project'), {
    //mission.save(_.pick(req.body, 'missionName', 'missionContent', 'startGroup', 'starter', 'progress', 'advisor', 'check', 'note', 'project'), {
      success: function(mission) {      
      alert('New object created with objectId: ' + mission.id);
      res.redirect('/mission/'+mission.id);
    },
    error: function(mission, error) {      
      alert('Failed to create new object, with error code: ' + error.description);
      res.redirect('/');
    }
    });
    /*
  	mission.save(_.pick(req.body, 'missionName', 'missionContent', 'startGroup', 'starter', 'deadLine', 'progress', 'advisor', 'check', 'note', 'project')).then(function() {
  	  //res.redirect('/mission/'+mission.id);
      res.redirect('/');
  	});
*/
  }else{
  	res.redirect('/login');
  }
};
//show certain mission
exports.show = function(req, res){
  if(Parse.User.current()){
  	var missionQuery = new Parse.Query(Mission);
  	var foundMission;
    Parse.User.current().fetch().then(function(user) {
      missionQuery.get(req.params.id).then(function(mission) {
        if (mission) {
          foundMission = mission;        
          var hrequestQuery = new Parse.Query(hRequest);
          var nhrequestQuery = new Parse.Query(nhRequest);
          hrequestQuery.equalTo('relatedMission', mission);
          nhrequestQuery.equalTo('relatedMission', mission);
          hrequestQuery.descending('createdAt');
          nhrequestQuery.descending('createdAt');
          return [hrequestQuery.find(), nhrequestQuery.find()];
        } else {
          return [];
        }
      }).then(function(results) {
        res.render('mission/show', {
          mission: foundMission,
          hrequest: results[0],
          nhrequest: results[1]
        });
      },
      function() {
        res.send(500, 'Failed finding the specified mission to show');
      });
    });  	
  }else{
  	res.redirect('/login');
  }
};
//update a mission
exports.update = function(req, res){
  if(Parse.User.current()){
  	var mission = new Mission();
  	mission.id = req.params.id;
    //for easyui
    //mission.id = req.body.id;
  	//mission.save(_.pick(req.body, 'missionName', 'missionContent', 'startGroup', 'starter', 'deadLine', 'progress', 'advisor', 'check', 'note')).then(function() {
      mission.save(_.pick(req.body, 'missionName', 'missionContent', 'deadLine', 'note')).then(function() {
  	  res.redirect('/mission/'+mission.id);
  	});
  }else{
  	res.redirect('/login');
  }
};
exports.updateContent = function(req, res){
  if(Parse.User.current()){
    var mission = new Mission();
    mission.id = req.params.id;
    mission.set("missionContent", req.body.missionContent);
      mission.save(null, {
        success: function(results){
          alert("successfully updated object : "+results.id);
          res.send({"success":true});
        },
        error: function(results, error){
          alert("update failed with error code: "+ error.description);
          res.send({"success":false});
        }
      });
  }else{
    res.redirect('/login');
  }
};
//delete a mission 
exports.delete = function(req, res) {
  var mission = new Mission();
  mission.id = req.params.id;
  //mission.id = req.body.id;
  // Also delete mission's corresponding nhrequest and hrequest - and hrquests' corresponding human resource  
  var hrequestQuery = new Parse.Query(hRequest);
  var nhrequestQuery = new Parse.Query(nhRequest);
  hrequestQuery.equalTo('relatedMission', mission);
  nhrequestQuery.equalTo('relatedMission', mission);  
  //TODO: delete all nhrequest and hrequst then delete the mission itself
  mission.destroy({
    success: function(mission) {      
      alert('New object created with objectId: ' + mission.id);
      res.redirect('/mission');
    },
    error: function(mission, error) {      
      alert('Failed to create new object, with error code: ' + error.description);
      res.redirect('/mission');
    }
  });
};
/* version for jirong jeasyui module

exports.delete = function(req, res) {
  var mission = new Mission();
  //mission.id = req.params.id;
  mission.id = req.body.id;
  // Also delete mission's corresponding nhrequest and hrequest - and hrquests' corresponding human resource  
  var hrequestQuery = new Parse.Query(hRequest);
  var nhrequestQuery = new Parse.Query(nhRequest);
  hrequestQuery.equalTo('relatedMission', mission);
  nhrequestQuery.equalTo('relatedMission', mission);  
  //TODO: delete all nhrequest and hrequst then delete the mission itself
  mission.destroy({
    success: function(mission) {      
      alert('New object created with objectId: ' + mission.id);
      res.send({"success":true});
    },
    error: function(mission, error) {      
      alert('Failed to create new object, with error code: ' + error.description);
      res.send({"msg":error.description});
    }
  });
};
*/
//show certain mission for jeasyui, only send json
exports.showMission = function(req, res){
  if(Parse.User.current()){
    var missionQuery = new Parse.Query(Mission);
    var foundMission;
    Parse.User.current().fetch().then(function(user) {
      missionQuery.descending('createdAt');
      missionQuery.find({
        success: function(results){
          res.send(results);
        }
      });
    });   
  }else{
    
  }
};

