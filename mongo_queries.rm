#Fetching the data based on the date range#

```<collectionName>.find({<attributeName>:{"$lte":<endDate>, "$gte":<startDate>}},{"fields":[<fieldName>, <fieldName>]}, function(error, response) {
      if (error) {
        response.body = { "message": error };
        return response.complete(400);
      }
        response.body = { "data": response };
        response.complete();
    });
    ```
