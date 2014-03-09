//define all projects belong to ecm now
var projectName = "東馬";
var _ = require('underscore');
var Mission = Parse.Object.extend("mission");
var hRequest = Parse.Object.extend("hrRequest");
var nhRequest = Parse.Object.extend("nhrRequest");
var HumanResource = Parse.Object.extend("humanResource");
var Locat = Parse.Object.extend("location");
var nhResource = Parse.Object.extend("nhResource");
var resourceType = Parse.Object.extend("resourceType");



function newMission(body)
{
  var mission = new Mission();
  //add defualt project name to it
  _.extend(body, {project:projectName});
  //change string to int
  body.progress = parseInt(body.progress);
  body.check = parseInt(body.check);
  mission.save(_.pick(body, 'missionName', 'missionContent', 'startGroup', 'starter', 'deadLine', 'progress', 'advisor', 'check', 'note', 'project'));
}

//TODO solve multiple note in one body problem
function newhRequest(body)
{
  var hrequest = new hRequest();
  //add defualt project name to it
  _.extend(body, {project:projectName});
  body.numOfPpl = parseInt(body.numOfPpl);
  //TODO change startTiem & endTime to date type
  body.fullyAssigned = (body.fullyAssigned == "true");
  //TODO deal with file type "document"
  hrequest.save(_.pick(body, 'jobContent', 'numOfPpl', 'startTime', 'endTime', 'wageType', 'fullyAssigned', 'gatherLocation', 'workLocation', 'note', 'document', 'project'));
}