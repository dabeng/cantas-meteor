Cards = new Meteor.Collection('cards');

Template.list.rendered = function() {
  var _this = this;
  var sListId = _this.data._id;
  var listId = new Meteor.Collection.ObjectID(sListId);

  Meteor.subscribe('cards-by-listId', sListId, function() {
    var data = function() {
      var clearifyId = function (doc) {
        doc._id = doc._id._str;
        return doc;
      };
      // we just wanna re-render cards when list's card_order changed rather than card's listId changed
      Deps.nonreactive(function () {
        var cards = Cards.find({ listId: listId });
        newCards = cards.map(clearifyId);
      });

      var list = Lists.findOne({ _id: listId });
      if (list.card_order) {
        var cardIds = list.card_order.split(',');
        var finalCards = [];
        newCards.forEach(function(item) {
          finalCards[$.inArray(item._id, cardIds)] = item;
        });
        return finalCards;
      } else {
        return newCards;
      }
    };
    var tmpl = function() { return Template.cardItem;};
    Blaze.render(Blaze.Each(data, tmpl), _this.$('.list-content')[0]);
  });

  var $sortableCard = $('.list-content').sortable({
    placeholder: 'card-placeholder',
    connectWith: '.list-content',
    stop: function (event, ui) {
      var sCardId = ui.item[0].id;
      var $beginList = $(event.target).closest('.list-item');
      var $endList = $(ui.item).closest('.list-item');
      var end_card_order = $endList.find('.list-content').sortable('toArray').join(',');
      var endListId = new Meteor.Collection.ObjectID($endList[0].id);

      // if you move the card inside the same list
      if ($beginList[0].id === $endList[0].id) {
        Lists.update(endListId, { $set: {card_order: end_card_order, moved_card_id: sCardId }});
      } else { // if you move the card into the other list
        var cardId = new Meteor.Collection.ObjectID(sCardId);
        var begin_card_order = $beginList.find('.list-content').sortable('toArray').join(',');
        var beginListId = new Meteor.Collection.ObjectID($beginList[0].id);
        Cards.update(cardId, { $set: { listId: new Meteor.Collection.ObjectID($endList[0].id) }}, function() {
          /* The following line is very important, it's used to avoid this error --
          Exception from Tracker recompute function: Error: Failed to execute 'insertBefore' on 'Node':
          The node before which the new node is to be inserted is not a child of this node. 
          */
          $('#' + sCardId).remove();
          Lists.update(endListId, { $set: {card_order: end_card_order, moved_card_id: ui.item[0].id }}, function() {
            Lists.update(beginListId, { $set: {card_order: begin_card_order, moved_card_id: ui.item[0].id }});
          });
        });
      }
    }
  })
  .disableSelection();

};

var finishEditListName = function(event, template) {
  $(event.target).closest('.editable-region')
    .find('.edit-view').hide()
    .siblings('.static-view').show();
};

var finishAddCard = function(event, template) {
  var increment = 90;
  var $listFooter = template.$('.list-footer');
  var $listContent = template.$('.list-content');
  var footerHeight = $listFooter.height();
  var contentHeight = $listContent.height();
  $listContent.animate({ height: contentHeight + increment }, 200);
  $listFooter.animate({ height: footerHeight - increment }, 200, function() {
    template.$('.list-footer .edit-view').hide().siblings('.static-view').show();
  });
};

Template.list.events({
  'click .list-caption .static-view span': function(event, template) {
    template.$('.list-caption .static-view').hide().siblings('.edit-view').show();
    template.$('.list-caption .edit-view textarea').val(event.target.textContent).select();
  },
  'blur .list-caption .edit-view textarea': finishEditListName,
  'mousedown .list-caption .edit-view .btn-save': function(event, template) {
    var listId = new Meteor.Collection.ObjectID(this._id);
    Lists.update(listId, {$set: { name: template.$('.list-caption .edit-view textarea').val().trim() }});
  },
  'click .list-footer .static-view span': function(event, template) {
    if ($('.list-footer .edit-view').filter(':visible').length) {
      $('.list-footer .btn-cancel').click();
    }
    var $listFooter = template.$('.list-footer');
    var $listContent = template.$('.list-content');
    if ($listFooter.find('.edit-view').is(':hidden')) {
      var increment = 90;
      var footerHeight = $listFooter.height();
      var contentHeight  =  $listContent.height();
      $listContent.animate({ height: contentHeight - increment }, 200);
      $listFooter.animate({ height: footerHeight + increment}, 200, function() {
        template.$('.list-footer .static-view').hide().siblings('.edit-view').show();
        template.$('.list-footer .edit-view textarea').focus();
      });
    }
  },
  'click .list-footer .btn-cancel': finishAddCard,
  'mousedown .list-footer .btn-save': function(event, template) {
    var _this = this;
    var newCard = template.find('.list-footer textarea');
    if (newCard.value.trim().length) {
      var listId = new Meteor.Collection.ObjectID(this._id);
      Cards.insert({
        _id: new Meteor.Collection.ObjectID(),
        name: newCard.value.trim(),
        listId: listId,
        boardId: this.boardId
      }, function(error, _id) {
        if (error) {
          // TODO: exception handling
        } else {
          Meteor.subscribe('list-by-id', _this._id, function() {
            var list = Lists.findOne({ _id: listId });
            var new_card_order = !!(list.card_order) ? list.card_order + ',' +_id._str : _id._str;
            Lists.update(listId, { $set: {card_order: new_card_order, moved_card_id: _id._str }});
          });
        }
      });
      newCard.value = '';
    }
  }
});