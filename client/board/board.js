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

var finishEditBoardName = function(event, template) {
  $(event.target).closest('.editable-region')
    .find('.edit-view').hide()
    .siblings('.static-view').show();
};

Template.board.events({
  'click #board-caption .static-view span': function(event, template) {
    template.$('#board-caption .static-view').hide().siblings('.edit-view').show();
    template.$('#board-caption .edit-view textarea').val(event.target.textContent).select();
  },
  'mousedown #board-caption .edit-view .btn-save': function(event, template) {
    Boards.update(this._id, {
      $set: { name: template.$('#board-caption .edit-view textarea').val().trim() }
    });
  },
  'blur #board-caption .edit-view textarea': finishEditBoardName,
  'click #add-list-option': function (event, template) {
    var $boardFooter = $('#board-footer');
    var $boardContent = $('#board-content');
    if ($boardFooter.is(':hidden')) {
      if (!$('#ta-addList').length) {
        Blaze.renderWithData(Template.addList, {boardId: this._id}, $boardFooter[0]);
      }
      var footerHeight = 70;
      var contentHeight  =  $('#board-content').outerHeight();
      $boardContent.animate({ height: contentHeight - footerHeight }, 300);
      $boardFooter.show().animate({ height: footerHeight }, 300);
    }
  },
  'mouseenter .close-btn': function(evnet) {
    $(evnet.target).removeClass('fa-times-circle').addClass('fa-times-circle-o');
  },
  'mouseleave .close-btn': function(evnet) {
    $(evnet.target).removeClass('fa-times-circle-o').addClass('fa-times-circle');
  },
  'click .close-btn': function(evnet, template) {
    var $boardFooter = $('#board-footer');
    var $boardContent = $('#board-content');
    var footerHeight = 70;
    var contentHeight = $('#board-content').outerHeight();
    $boardContent.animate({ height: contentHeight + footerHeight }, 300);
    $boardFooter.animate({ height: 0 }, 300, function() {
      $(this).hide();
    });
  }
});