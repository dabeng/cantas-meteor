Lists = new Meteor.Collection('lists');

Template.board.rendered = function() {
  var _this = this;
  var boardId = _this.data._id;
  Meteor.subscribe('lists', function() {
    var data = function() {
    // return Lists.find({ boardId: boardId });
    var lists = Lists.find({ boardId: boardId });
      var clearifyId = function (doc) {
        doc._id = doc._id._str;
        return doc;
      }
      var newLists = lists.map(clearifyId);
      Meteor.subscribe('board-by-id', boardId._str);
      var board = Boards.findOne({ _id: boardId });
      var listIds = board.list_order.split(',');
      var finalLists = new Array(listIds.length);
      newLists.forEach(function(item) {
        var index = $.inArray(item._id, listIds);
        if (index > -1) {
          finalLists[index] = item;
        } else {
          finalLists[finalLists.length - 1] = item;
        }
      });
      if (newLists.length === listIds.length - 1) {
        for (var i=0; i< newLists.length; i++) {
          if (!finalLists[i]) {
            break;
          }
        }
        finalLists.splice(i, 1);
      }

      return finalLists;
    };
    var tmpl = function() {
      return Template.list;
    };

    Blaze.render(Blaze.Each(data, tmpl), _this.$('#board-content')[0]);
  });


  var $sortableList = $('#board-content').sortable({
    axis: 'x',
    placeholder: 'list-placeholder',
    tolerance: 'pointer',
    stop: function(event, ui) {
      var list_order = $sortableList.sortable('toArray').join(',');
      Boards.update(boardId, { $set: {list_order: list_order, moved_list_id: ui.item[0].id }});
    }
  })
  .disableSelection();


  Tracker.autorun(function () {
    Meteor.subscribe('current-board-by-id', boardId);
    var currentBoard = Boards.findOne(boardId);
    var moved_list_id = currentBoard.moved_list_id;
    var $moved_list_id = $('#' + moved_list_id);
    // note: here, we need to exclude placeholder element for the normal order
    var $lists = $sortableList.children('.list-item');
    var index = $.inArray(moved_list_id, currentBoard.list_order.split(','));
    if ($lists.length) {
      if (index === $lists.length) {
        if ($lists.last()[0].id !== moved_list_id) {
          $sortableList.append($moved_list_id);
        }
      } else if (index === -1) {
        $moved_list_id.remove();
      } else {
        if($lists.eq(index)[0].id !== moved_list_id) {
          if (index > $moved_list_id.index('.checklistItem')) {
            $moved_list_id.insertAfter($lists.eq(index));
          } else {
            $moved_list_id.insertBefore($lists.eq(index));
          }
        }
      }
    }
  });


};