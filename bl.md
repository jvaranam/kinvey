function onRequest(request, response, modules) {
  var collectionAccess = modules.collectionAccess,
      userCollection = collectionAccess.collection('user'),
      requestBody = request.body,
      logger = modules.logger,
      async = modules.async,
      userIdArr = requestBody.userIdArr?requestBody.userIdArr:null,
      returnData = [];
  if(!userIdArr){
    response.body = {"message":"missing user id"}; 
    response.complete(responseStatusCode.ERROR_BAD_REQUEST);
  }
  userCollection.find({"_acl.creator": {$in : userIdArr}}, function(error, respData){
    if(error){
      response.body = {"message":"missing user id"}; 
    	response.complete(responseStatusCode.ERROR_DATA_NOT_FOUND);
    }
    if(respData && respData.length > 0){
      async.each(respData, function(userData, callback) {
        if(userData.info.phoneNumber && userData.currentLocation){
          returnData.push({id:userData._id, phoneNumber:userData.info.phoneNumber, latLng:userData.currentLocation});
        }
        callback();
      }, function(error){
        if(error){
          response.body = {"message":"missing user id"}; 
          response.complete(responseStatusCode.ERROR_DATA_NOT_FOUND);
        }else{
    			response.body = {"response":returnData}; 
    			response.complete(responseStatusCode.SUCCESS_COMPLETE);
        }
      });
      
    }
  });
  
  /*
  
  userCollection.findOne({"_id":collectionAccess.objectID(userIdArr)}, function(error, respData){
    logger.info("user data "+respData.length+"  "+respData);
  });
  
  
  userCollection.find({ "_id": {$in : userIdArr}}, function(error, dataResp){
    logger.info("hey i am inside "+error+ " response "+dataResp.length);
    if(error){
      response.body = {"message":"missing user id"}; 
    	response.complete(responseStatusCode.ERROR_DATA_NOT_FOUND);
    }
    if(dataResp && dataResp.length > 0){
      async.forEach(dataResp, function(userData, callback) {
        logger.info("user Data "+userData);
      });
      response.body = {"message":"missing user id"}; 
    	response.complete(responseStatusCode.ERROR_DATA_NOT_FOUND);
    }
                      
	});
  */
  
  
  
  
      
      
  
}
