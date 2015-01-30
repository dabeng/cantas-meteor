Lists = new Meteor.Collection('lists');

Template.board.rendered = function() {
  var _this = this;
  var boardId = _this.data._id;
  Meteor.subscribe('lists-by-boardId', boardId._str, function() {
    var data = function() {
      var lists = Lists.find({ boardId: boardId });
      var clearifyId = function (doc) {
        doc._id = doc._id._str;
        return doc;
      }
      var newLists = lists.map(clearifyId);
      if (_this.data.list_order) {
        var listIds = _this.data.list_order.split(',');
        var finalLists = new Array(listIds.length);
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
    // _this.$('#board-content').append(Blaze.toHTML(Blaze.Each(data, tmpl)));
  });


  var $sortableList = $('#board-content').sortable({
    placeholder: 'list-placeholder',
    stop: function(event, ui) {
      var list_order = $sortableList.sortable('toArray').join(',');
      Boards.update(boardId, { $set: {list_order: list_order, moved_list_id: ui.item[0].id }});
    }
  })
  .disableSelection();


  Tracker.autorun(function (computation) {
    var handle = Meteor.subscribe('current-board-by-id', boardId);
    var currentBoard = Boards.findOne(boardId);

    if (!computation.firstRun && currentBoard) {
      var moved_list_id = currentBoard.moved_list_id;
      var $moved_list = $('#' + moved_list_id);
      // moved-list is existing list
      if ($moved_list.length) {
        var $listItems = $sortableList.find('.list-item');
        var original_index = $listItems.index($moved_list);
        var target_index = $.inArray(moved_list_id, currentBoard.list_order.split(','));
        if (original_index < target_index) {
            $moved_list.insertAfter($listItems.eq(target_index));
          } else if (original_index > target_index) {
            $moved_list.insertBefore($listItems.eq(target_index));
          }
        } // moved-list is newly added list
        else {
          var data = Lists.findOne({_id : new Meteor.Collection.ObjectID(moved_list_id)});
          data._id = data._id._str;
          $sortableList.append(Blaze.toHTMLWithData(Template.list, data));
      }
    }

});


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