function onRequest(request, response, modules) {
  var collectionAccess = modules.collectionAccess;
  var todosCollection = collectionAccess.collection('todos');
  var requestBody = request.body;
  var logger = modules.logger;
  //logger.info("its me just called ");
  //logger.info(requestBody.requestType);
  if(requestBody.requestType == "get"){
    fetchTodos(requestBody.patientId);
  }else if (requestBody.requestType == "post"){
    addTodos(requestBody.patientId, requestBody.todoInfo);
  }else if(request.requestType == "delete"){
    
  }else {
    response.body = {"message":"unknown request type"}; 
    return response.complete(400);
  }
  
  function addTodos1(_patientId, _todoInfo){
    var patientIdArr = [_patientId];
    todosCollection.find({"_acl.creator":{$in:patientIdArr}}, function(error, respData){
      logger.info("_acl.creator "+error+" , "+respData);
    });
  }
  
  function addTodos(_patientId, _todoInfo){
    var freq = _todoInfo.freq;
    var data = _todoInfo.data;
    //logger.info("data "+updateData(_todoInfo));
    todosCollection.update({"_id" : collectionAccess.objectID(_patientId)},{ "$set": {
    "_acl":{"creator":_patientId}
  }, "$push": updateData(_todoInfo)},{ upsert: true }, function(updateErr, updateRes) {
      if (updateErr) {
        logger.info("updateErr " + updateErr);
        response.body = {"message":updateErr}; 
        return response.complete(400);
      }else if(updateRes){
        response.body = {"updateRes":updateRes}; 
        response.complete(200);
      }
    });
    
  }
  
  
  



  function addTodos2(_patientId, _todoInfo){
    var freq = _todoInfo.freq;
    var data = _todoInfo.data;
    var patientIdArr = [_patientId];
    todosCollection.findOne({"_acl.creator":{$in:patientIdArr}}, function(error, respData){
      if(respData){
        todosCollection.update({"_id" : collectionAccess.objectID(respData._id)},updateData(_todoInfo), function(updateErr, updateRes) {
          if (insertErr) {
            logger.info("updateErr " + updateErr);
            response.body = {"message":updateErr}; 
            return response.complete(400);
          }else if(updateRes){
            response.body = updateRes; 
            response.complete(200);
          }
        });
      }else{
        var todoObj = modules.kinvey.entity({
            "_acl": {
                "creator": _patientId.toString()
            }
        });
        
        todosCollection.insert(modifyData(todoObj,_todoInfo) , function(insertErr, insertRes) {
          if (insertErr) {
            logger.info("insertErr " + insertErr);
            response.body = {"message":insertErr}; 
            return response.complete(400);
          }else if(insertRes){
            response.body = insertRes; 
            response.complete(200);
          }
        });
      }
    });
  }
  
  function modifyData(){
    
  }
  
  function updateData(_updateInfo){
    if(_updateInfo.freq == "Once"){
      return {"Once":_updateInfo.data};
    }else if(_updateInfo.freq == "Weekdays"){
      return {"Weekdays":_updateInfo.data};
    }else if(_updateInfo.freq == "Weekends"){
      return {"Weekends":_updateInfo.data};
    }else if(_updateInfo.freq == "Daily"){
      return {"Daily":_updateInfo.data};
    }else if(_updateInfo.freq == "Weekly"){
      return {"Weekly":_updateInfo.data};
    }else if(_updateInfo.freq == "Bi-weekly"){
      return {"Bi-weekly":_updateInfo.data};
    }else if(_updateInfo.freq == "Monthly"){
      return {"Monthly":_updateInfo.data};
    }
  }

  function fetchTodos(_patientId){
    todosCollection.find({"_acl.creator":{$in:[_patientId]}}, function(error, respData){
      if(error){
        response.body = {"message":"missing user id"}; 
        return response.complete(400);
      }else if(respData.length < 1){
        response.body = {"message":"UserId not found",data:{}};  
         return response.complete(200);
      }else{
        response.body = respData; 
        response.complete(200);
      }
    });
  }

  /*
    {"requestType":"post", "todoInfo":
	{
    "freq":"Once",
    "data":{
      "start":"now", "end":"now", "upcomming":"now", "name":"try1", "description":"nothing"
    }
  },
  "patientId":"59ccbafcb3c21ffd4620bb44"
}
  */
}
