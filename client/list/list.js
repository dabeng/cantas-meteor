Cards = new Meteor.Collection('cards');

Template.list.rendered = function() {
  var _this = this;
  var sListId = _this.data._id;
  var listId = new Meteor.Collection.ObjectID(sListId);
  Meteor.subscribe('cards-by-listId', sListId, function() {
    var data = function() {
      var cards = Cards.find({ listId: listId });

      var clearifyId = function (doc) {
        doc._id = doc._id._str;
        return doc;
      }

      var newCards = cards.map(clearifyId);
      if (_this.data.card_order) {
        var cardIds = _this.data.card_order.split(',');
        var finalCards = new Array(cardIds.length);
        newCards.forEach(function(item) {
            finalCards[$.inArray(item._id, cardIds)] = item;
        });

        return finalCards;
      } else {
        return newCards;
      }
    };
    var tmpl = function() {
      return Template.cardItem;
    };
    _this.$('.list-content').html(Blaze.toHTML(Blaze.Each(data, tmpl)));
  });

  var $sortableCard = $('.list-content').sortable({
    placeholder: 'card-placeholder',
    connectWith: '.list-content',
    stop: function (event, ui) {
      var $beginList = $(event.target).closest('.list-item');
      var $endList = $(ui.item).closest('.list-item');
      var end_card_order = $endList.find('.list-content').sortable('toArray').join(',');
      var endListId = new Meteor.Collection.ObjectID($endList[0].id);

      // if you move the card inside the same list
      if ($beginList[0].id === $endList[0].id) {
        Lists.update(endListId, { $set: {card_order: end_card_order, moved_card_id: ui.item[0].id }});
      } else { // if you move the card into the other list
        var sCardId = ui.item[0].id;
        var cardId = new Meteor.Collection.ObjectID(sCardId);
        var begin_card_order = $beginList.find('.list-content').sortable('toArray').join(',');
        var beginListId = new Meteor.Collection.ObjectID($beginList[0].id);
        Lists.update(endListId, { $set: {card_order: end_card_order, moved_card_id: ui.item[0].id }}, function() {
          Lists.update(beginListId, { $set: {card_order: begin_card_order, moved_card_id: ui.item[0].id }}, function() {
            Cards.update(cardId, { $set: { listId: new Meteor.Collection.ObjectID($endList[0].id) } });
          });
        });
      }
    }
  })
  .disableSelection();

  Tracker.autorun(function (computation) {
    Meteor.subscribe('current-list-by-id', listId);
    var currentList = Lists.findOne(listId);
    var moved_card_id = currentList.moved_card_id;
    var $moved_card = $('#' + moved_card_id);
    if (!computation.firstRun) {
      // moved-card is existing card
      if ($moved_card.length) {
        var $cardItems = $('#' + sListId).find('.card-item');
        var original_index = $cardItems.index($moved_card);
        var target_index = $.inArray(moved_card_id, currentList.card_order.split(','));
        // moved-card is being dragged/dropped  in the same list
        if (target_index !== -1 && original_index > -1) {
          if (original_index < target_index) {
            $moved_card.insertAfter($cardItems.eq(target_index));
          } else if (original_index > target_index) {
            $moved_card.insertBefore($cardItems.eq(target_index));
          }
        } // moved-card is being dragged/dropped  into the other list 
        else if (target_index !== -1 && original_index === -1) {
          if (target_index === 0) {
            $('#' + sListId).find('.list-content').prepend($moved_card);
          } else if (target_index === $cardItems.length) {
            $('#' + sListId).find('.list-content').append($moved_card);
          } else {
            $moved_card.insertBefore($cardItems.eq(target_index));
          }
        }
      } // moved-card is newly added card
      else {
        var data = Cards.findOne({_id : new Meteor.Collection.ObjectID(moved_card_id)});
        data._id = data._id._str;
        $('#' + sListId).find('.list-content').append(Blaze.toHTMLWithData(Template.cardItem, data));
      }
    }
  });

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