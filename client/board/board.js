Lists = new Meteor.Collection('lists');

Template.board.rendered = function() {
  var _this = this;
  var boardId = _this.data._id;
  Meteor.subscribe('lists', function() {
    var data = function() {
      var clearifyId = function (doc) {
        doc._id = doc._id._str;
        return doc;
      };
      var lists = Lists.find({ boardId: boardId });
      var newLists = lists.map(clearifyId);
      var board = Boards.findOne({ _id: boardId });
      if (board.list_order) {
        var listIds = board.list_order.split(',');
        var finalLists = [];
        newLists.forEach(function(item) {
          finalLists[$.inArray(item._id, listIds)] = item;
        });
        return finalLists;
      } else {
        return newLists;
      }
    };
    var tmpl = function() {
      return Template.list;
    };

    Blaze.render(Blaze.Each(data, tmpl), _this.$('#board-content')[0]);
  });

  var $sortableList = $('#board-content').sortable({
    tolerance: 'pointer',
    placeholder: 'list-placeholder',
    start: function(event, ui) { $('#' + ui.item[0].id).css('cursor', 'move'); },
    stop: function(event, ui) {
      var sListId = ui.item[0].id;
      $('#' + sListId).css('cursor', '');
      var list_order = $sortableList.sortable('toArray').join(',');
      Boards.update(boardId, { $set: {list_order: list_order, moved_list_id: sListId }});
    }
  })
  .disableSelection();

};

Template.board.events({
  'click #board-caption .static-view span': openEditView,
  'mousedown #board-caption .edit-view .btn-save': function(event, template) {
    Boards.update(this._id, {
      $set: { name: template.$('#board-caption .edit-view textarea').val().trim() }
    });
  },
  'blur #board-caption .edit-view textarea': finishEditName,
  'click #add-list-option': function (event, template) {
    var $boardFooter = $('#board-footer');
    var $boardContent = $('#board-content');
    if ($boardFooter.is(':hidden')) {
      if (!$('#ta-addList').length) {
        Blaze.renderWithData(Template.addList, {boardId: this._id}, $boardFooter[0]);
      }
      showFooterView($boardFooter, $boardContent, 70);
    }
  }
});