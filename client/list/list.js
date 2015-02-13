Cards = new Meteor.Collection('cards');

Template.list.rendered = function() {
  var _this = this;
  var sListId = _this.data._id;
  var listId = new Meteor.Collection.ObjectID(sListId);

  Meteor.subscribe('cards', { 'listId': listId }, function() {
    var data = function() {
      var clearifyId = function (doc) {
        doc._id = doc._id._str;
        return doc;
      };
      // we just wanna re-render cards when list's card_order changed rather than card's listId changed
      Deps.nonreactive(function () {
        newCards = Cards.find({ listId: listId }).map(clearifyId);
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
    var tmpl = function() { return Template.cardItem; };
    Blaze.render(Blaze.Each(data, tmpl), _this.$('.list-content')[0]);
  });

  var $sortableCard = $('.list-content').sortable({
    placeholder: 'card-placeholder',
    connectWith: '.list-content',
    start: function(event, ui) { $('#' + ui.item[0].id).find('a').css('cursor', 'move'); },
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
          The node before which the new node is to be inserted is not a child of this node. */
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

Template.list.events({
  'click .list-caption .static-view span': showEditCaptionView,
  'blur .list-caption .edit-view textarea': hideEditCaptionView,
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
      showFooterView($listFooter, $listContent, 90, true);
    }
  },
  'click .list-footer .btn-cancel': hideFooterView,
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
          var list = Lists.findOne({ _id: listId });
          var new_card_order = !!(list.card_order) ? list.card_order + ',' +_id._str : _id._str;
          Lists.update(listId, { $set: {card_order: new_card_order, moved_card_id: _id._str }});
        }
      });
      newCard.value = '';
    }
  }
});