## Fetching the data based on the date range

``` 
    <collectionName>.find({<attributeName>:{"$lte":<'2019-05-24'>, "$gte":<'2019-03-24'>}},
    {"fields":[<fieldName>, <fieldName>],"sort":{ "<attributeName>": 1 }},  function(error, response) {
      if (error) {
        response.body = { "message": error };
        return response.complete(400);
      }
        response.body = { "data": response };
        response.complete();
    });
    
    Attribute name can be <parentName>.<childName>.<grandChildName> 
