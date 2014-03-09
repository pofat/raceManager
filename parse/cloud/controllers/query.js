var _ = require('underscore');
var Mission = Parse.Object.extend("mission");
var hRequest = Parse.Object.extend("hrRequest");
var nhRequest = Parse.Object.extend("nhrRequest");
var humanResource = Parse.Object.extend("humanResource");
var nhResource = Parse.Object.extend("nhResource");

exports.index = function(req, res) {
  if(Parse.User.current()){
  	var resources = Parse.Object.extend("Resources");
    var query = new Parse.Query(resources);    
    var locs = [], groups = [], types = [];
    var real_list =[];    
    var username;    
    //query amount limit
    query.limit(500);
    // TODO sort query 
    //query.ascending("location");   
    query.find({
      success: function(results) {
        console.log("Successfully retrieved " + results.length + " resources.");
        for(var i = 0; i < results.length; i++) {
          if(locs.indexOf(results[i].get('location')) == -1) {
            locs.push(results[i].get('location'));
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
        res.render('nhr', { results:results, locs:locs, groups:groups, requirer:"", types:types });            
      },
      error: function(error) {
        console.error("Error: " + error.code + " " + error.message);
      }
    });    
  }else{
  	res.redirect('/login');
  } 
};