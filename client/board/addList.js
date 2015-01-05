Template.addList.events({
  'click #btn-addList': function (event, template) {
    var newList = template.find('textarea');
    if (newList.value.trim().length) {
      Meteor.subscribe('lists', function() {
        var boardId = template.data.boardId;
        Lists.insert({ name: newList.value, boardId: boardId,
            _id: new Meteor.Collection.ObjectID() }, function(error, _id) {
              Meteor.subscribe('list-by-id', boardId._str, function() {
                var board = Boards.findOne({ _id: boardId });
                var new_list_order = board.list_order === '' ? _id._str : board.list_order + ',' +_id._str;
                Boards.update(boardId, { $set: {list_order: new_list_order, moved_list_id: _id._str }});
              });
            });
        newList.value = '';
      });
    }
  }
});