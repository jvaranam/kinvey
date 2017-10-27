function onRequest(request, response, modules) {
  var collectionAccess = modules.collectionAccess;
  var todosCollection = collectionAccess.collection('todos');
  var nextNotificationCollection = collectionAccess.collection('nextNotification');
  var requestBody = request.body;
  var logger = modules.logger;
  if(requestBody.requestType == "get"){  // To get the todos
    fetchTodos(requestBody.patientId);
  }else if (requestBody.requestType == "post"){  // add a new todos
    addTodos(requestBody.patientId, requestBody.todoInfo);
  }else if(requestBody.requestType == "update"){  // edit the todos
    editTodo(requestBody.patientId, requestBody.todoInfo);
  }else if(requestBody.requestType == "delete"){ // delete the todos
    deleteTodo(requestBody.patientId, requestBody.todoInfo);
  }else {
    response.body = {"message":"unknown request type"}; 
    return response.complete(400);
  }
  
  function addTodos(_patientId, _todoInfo){
    todosCollection.update(
    	{"_acl.creator" : _patientId},
     	{"$push":updateData(_todoInfo)},
      {upsert: true,new:true},
    function(updateErr, updateRes) {
      if (updateErr) {
        logger.info("updateErr " + updateErr);
        response.body = {"message":updateErr}; 
        return response.complete(400);
      }else if(updateRes){
        nextNotificationCollection.update(
          {"_acl.creator" : _patientId},
          {"$push":updateNotificationData(_todoInfo)},
          {upsert: true,new:true},
        function(notiErr, notiRes) {
          if (notiErr) {
            logger.info("updateErr " + notiErr);
            response.body = {"message":notiErr}; 
            return response.complete(400);
          } 
          response.body = {"updateRes":notiRes}; 
          response.complete(200);
        });
      }
    }); 
  }
  
  function editTodo(_patientId, _todoInfo){
    logger.info(_todoInfo);
    todosCollection.update(
      {"once.todoID":"12345"},
      {$set:{"once.$":{
       "frequency":_todoInfo.data.frequency,
       "createdTS":_todoInfo.data.createdTS,
       "upcomingTS":_todoInfo.data.upcomingTS,
       "name":_todoInfo.data.name,
       "description":_todoInfo.data.description,
       "todoID":_todoInfo.data.todoID
     }}},{multi:true,new:true},
    function(notiErr, notiRes) {
      if (notiErr) {
        logger.info("updateErr " + notiErr);
        response.body = {"message":notiErr}; 
        return response.complete(400);
      } 
      response.body = {"updateRes":notiRes}; 
      response.complete(200);
    });
  }
  
  function editTodo1(_patientId, _todoInfo){
    todosCollection.update(queryParam(_patientId, _todoInfo), { "$set": updateEditedData(_todoInfo) }, 									function(error, success){
      if(error){
        logger.info("updateErr " + error);
            response.body = {"message":error}; 
            return response.complete(400);
      }
        response.body = {"updateRes":"notiRes"}; 
          response.complete(200);
    });
    
    
    
    
      
  }
  
  function updateEditedData(_updateInfo){
    if(_updateInfo.freq == "Once"){
      return {"once.$.": _updateInfo.data};
    }else if(_updateInfo.freq == "Weekdays"){
      return  {"weekdays.$.": _updateInfo.data};
    }else if(_updateInfo.freq == "Weekends"){
      return {"weekends.$.":_updateInfo.data};
    }else if(_updateInfo.freq == "Daily"){
      return {"daily.$.":_updateInfo.data};
    }else if(_updateInfo.freq == "Weekly"){
      return {"weekly.$.":_updateInfo.data};
    }else if(_updateInfo.freq == "Bi-weekly"){
      return {"biWeekly.$.":_updateInfo.data};
    }else if(_updateInfo.freq == "Monthly"){
      return {"monthly.$.":_updateInfo.data};
    }
  }
  
  function queryParam(_patientId, _todoInfo){
    if(_todoInfo.freq == "Once"){
      return {"_acl.creator":_patientId, "once": {todoID:_todoInfo.data.todoID}};
    }else if(_todoInfo.freq == "Weekdays"){
      return  {"_acl.creator":_patientId, "weekdays": {todoID:_todoInfo.data.todoID}};
    }else if(_todoInfo.freq == "Weekends"){
      return {"_acl.creator":_patientId, "weekends": {todoID:_todoInfo.data.todoID}};
    }else if(_todoInfo.freq == "Daily"){
      return {"_acl.creator":_patientId, "daily": {todoID:_todoInfo.data.todoID}};
    }else if(_todoInfo.freq == "Weekly"){
      return {"_acl.creator":_patientId, "weekly": {todoID:_todoInfo.data.todoID}};
    }else if(_todoInfo.freq == "Bi-weekly"){
      return {"_acl.creator":_patientId, "biWeekly": {todoID:_todoInfo.data.todoID}};
    }else if(_todoInfo.freq == "Monthly"){
      return {"_acl.creator":_patientId, "monthly": {todoID:_todoInfo.data.todoID}};
    }
  }
  
  function deleteTodo(_patientId, _todoInfo){
    todosCollection.update(
    {"_acl.creator":_patientId},
    { $pull: modifyData(_todoInfo)}, function(error, respData){
      if(error){
        response.body = {"message":error}; 
        return response.complete(400);
      }
			response.body = {"updateRes":respData};
      response.complete(200);
    });
  }
  
  function modifyData(_updateInfo){
    if(_updateInfo.freq == "Once"){
      return {"once": {todoID:_updateInfo.data.todoID}};
    }else if(_updateInfo.freq == "Weekdays"){
      return  {"weekdays": {todoID:_updateInfo.data.todoID}};
    }else if(_updateInfo.freq == "Weekends"){
      return {"weekends": {todoID:_updateInfo.data.todoID}};
    }else if(_updateInfo.freq == "Daily"){
      return {"daily": {todoID:_updateInfo.data.todoID}};
    }else if(_updateInfo.freq == "Weekly"){
      return {"weekly": {todoID:_updateInfo.data.todoID}};
    }else if(_updateInfo.freq == "Bi-weekly"){
      return {"biWeekly": {todoID:_updateInfo.data.todoID}};
    }else if(_updateInfo.freq == "Monthly"){
      return {"monthly": {todoID:_updateInfo.data.todoID}};
    }
  }
  
  function fetchTodos(_patientId){
    todosCollection.find({"_acl.creator":{$in:[_patientId]}}, function(error, respData){
      if(error){
        response.body = {"message":"missing user id"}; 
        return response.complete(400);
      }else if(respData.length < 1){
        response.body = {"message":"UserId not found",data:{}};  
       	return response.complete(400);
      }else{
        response.body = respData[0]; 
        response.complete(200);
      }
    });
  }
  
  function updateData(_updateInfo){
    if(_updateInfo.freq == "Once"){
      return {"once": _updateInfo.data};
    }else if(_updateInfo.freq == "Weekdays"){
      return  {"weekdays": _updateInfo.data};
    }else if(_updateInfo.freq == "Weekends"){
      return {"weekends":_updateInfo.data};
    }else if(_updateInfo.freq == "Daily"){
      return {"daily":_updateInfo.data};
    }else if(_updateInfo.freq == "Weekly"){
      return {"weekly":_updateInfo.data};
    }else if(_updateInfo.freq == "Bi-weekly"){
      return {"biWeekly":_updateInfo.data};
    }else if(_updateInfo.freq == "Monthly"){
      return {"monthly":_updateInfo.data};
    }
  }
  
  function updateNotificationData(_updateInfo){
    var returnData = {};
    returnData.todoID = _updateInfo.data.todoID;
    returnData.frequency = _updateInfo.data.frequency;
    returnData.upcomingTS = _updateInfo.data.upcomingTS;
    returnData.createdTS = _updateInfo.data.createdTS;
    returnData.completeTS = _updateInfo.data.completeTS;
    returnData.name = _updateInfo.data.name;
    returnData.description = _updateInfo.data.description;
    
    if(_updateInfo.freq == "Once"){
      return {"todo_once": returnData};
    }else if(_updateInfo.freq == "Weekdays"){
      return  {"todo_weekdays": returnData};
    }else if(_updateInfo.freq == "Weekends"){
      return {"todo_weekends":returnData};
    }else if(_updateInfo.freq == "Daily"){
      return {"todo_daily":returnData};
    }else if(_updateInfo.freq == "Weekly"){
      return {"todo_weekly":returnData};
    }else if(_updateInfo.freq == "Bi-weekly"){
      return {"todo_biWeekly":returnData};
    }else if(_updateInfo.freq == "Monthly"){
      return {"todo_monthly":returnData};
    }
  }

  /*
    {
  "requestType":"delete",
    "todoInfo":{
      "freq":"Once",
        "data":{
          "todoID":"MFm0x"
        }
    },
      "patientId":"59c9fb9bb8cf350a46fd7b72"}
  
  {
  "requestType":"edit",
    "todoInfo":{
      {
        "todoID": "x9dIo",
        "frequency": "Once",
        "time": {
          "hh": 10,
          "mm": 0,
          "am": "PM"
        },
        "date": {
          "date": "18",
          "month": "10",
          "year": "2017"
        },
        "createdTS": 1508344200,
        "dispDate": 1508344200,
        "pastTS": 1508344200,
        "upcomingTS": 1508344200,
        "name": "Once Wednesday 10 AM",
        "description": "Adding"
      }
    },
      "patientId":"59c9fb9bb8cf350a46fd7b72"}
      ==================================
      
      {
  "requestType": "post",
  "todoInfo": {
    "freq": "Once",
    "data": {
      "todoID": "W4Xkn",
      "frequency": "Once",
      "time": {
        "hh": 11,
        "mm": 28,
        "am": "AM"
      },
      "date": {
        "date": "26",
        "month": "10",
        "year": "2017"
      },
      "createdTS": 1509083880,
      "dispDate": 1509083880,
      "pastTS": 1509083880,
      "upcomingTS": 1509083880,
      "name": "Once _ 1",
      "description": "Once 11 28 am"
    }
  },
  "patientId": "59c9fb9bb8cf350a46fd7b72"
}
  
  
  */
  
  
}
