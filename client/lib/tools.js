refreshDatasource = function(cursor, order) {
      var clearifyId = function (doc) {
        doc._id = doc._id._str;
        return doc;
      }
      var entities = cursor.map(clearifyId);
      if (order) {
        var aId = order.split(',');
        var orderedEntities = [];
        entities.forEach(function(item) {
          orderedEntities[$.inArray(item._id, aId)] = item;
        });

        return orderedEntities;
      } else {
        return entities;
      }
};