var _ = require('underscore');
var Mission = Parse.Object.extend("mission");
var hRequest = Parse.Object.extend("hrRequest");
var nhRequest = Parse.Object.extend("nhrRequest");
var humanResource = Parse.Object.extend("humanResource");
var nhResource = Parse.Object.extend("nhResource");

exports.index = function(req, res) {
  if(Parse.User.current()){
  	Parse.User.current().fetch().then(function(user){
  	  if(user.get("privilege") > 1){
  	  	res.render('401');//TODO a unauthority page
  	  }else{
  	  	res.render('admin/index', {
  	  	  user:user
  	  	});
  	  }
  	});
  }else{
  	res.redirect('/login');
  } 
};
//for jeasyui, show all nhResource in json
exports.showNhResource = function(req, res){
  if(Parse.User.current()){
    var query = new Parse.Query(nhResource);
    query.limit(300);
    query.descending('createdAt');
    query.find({
      success: function(results){
      	for(var item in results){
      		_.extend(item, {"id":item.id});
      	}
      	for(var item in results){
      		console.log(" id = "+item.id);
      	}
        res.send(results);
      }
    });
  }else{
    
  }
};
//show all hresource in json
exports.showHResource = function(req, res){
  if(Parse.User.current()){
    var query = new Parse.Query(humanResource);
    query.limit(700);
    query.descending('group');
    query.find({
      success: function(results){
        res.send(results);
      }
    });
  }else{
    
  }
};
//delete certain nhresource by id in jeasyui
exports.delNhResource = function(req, res){
  if(Parse.User.current()){
    var nhresource = new nhResource();
    nhresource.id = req.body.id;
    console.log("object id " + req.body.id);  
    nhresource.destroy({
      success: function(nhresource) {
    	alert("Success to delete object : "+nhresource.id);
    	res.send({'success':true});
      },
      error: function(nhresource, error) {
    	alert("fail to delete object , with error code : "+error.description);
    	res.send({'success':false});
      }
    });
  }else{
    
  }
};
//delete certain hresource by id in jeasyui
exports.delHresource = function(req, res){
  if(Parse.User.current()){
    var hresource = new humanResource();
    hresource.id = req.body.id;
    hresource.destroy({
      success: function(hresource) {
    	alert("Success to delete object : "+hresource.id);
    	res.send({'success':true});
      },
      error: function(hresource, error) {
    	alert("fail to delete object , with error code : "+error.description);
    	res.send({'success':false});
      }
    });
  }else{
    
  }
};
