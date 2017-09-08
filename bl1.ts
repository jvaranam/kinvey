function onRequest(request, response, modules) {
  
  var collectionAccess = modules.collectionAccess;
  var userCollection = collectionAccess.collection('user');
  var requestBody = request.body;
  var logger = modules.logger;
  var async = modules.async;
  var userIdArr = requestBody.userIdArr?requestBody.userIdArr:null;
  var returnData = [];
  var associatedPatients = [];
  var associatedCaregivers = [];
  var nonRegisteredUsers = [];
  
  if(!userIdArr){
    response.body = {"message":"missing user id"}; 
    return response.complete(400);
  }
  
  fetchUserInfo(userIdArr);
  
  function fetchUserInfo(_userIdArr){
    userCollection.find({"_acl.creator": {$in : _userIdArr}}, function(error, respData){
      if(error){
        response.body = {"message":"missing user id"}; 
        return response.complete(400);
      }
      if(respData.length < 1){
        response.body = {"message":"UserId not found",data:{}};  
        return response.complete(200);
      }
      async.each(respData, function(userData, callback) {
        if(userData.info.phoneNumber && userData.currentLocation){          
          returnData.push({
            _id:userData._id, 
            name:userData.first_name+" "+userData.lastName, 
            email:userData.email,
            phoneNumber:userData.info.phoneNumber, 
            latLng:userData.currentLocation?userData.currentLocation:null,
            caregivers:userData.caregivers?userData.caregivers:null,
            patients:userData.patients?userData.patients:null
          });
        }
        callback(null);
      }, function(error){
        if(error){
          response.body = {"message":"missing user id"};
          return response.complete(400);
        }else{
          response.body = {"response":returnData}; 
          response.complete(200);
        }
      });
    });
  }
  
  
}
