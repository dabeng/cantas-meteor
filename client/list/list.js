Cards = new Meteor.Collection('cards');

Template.list.rendered = function() {
  var _this = this;
  var listId = new Meteor.Collection.ObjectID(_this.data._id);
  Meteor.subscribe('cards', function() {
    var data = function() {
      var cards = Cards.find({ listId: listId });
      var clearifyId = function (doc) {
        doc._id = doc._id._str;
        return doc;
      }

      var newCards = cards.map(clearifyId);
      Meteor.subscribe('list-by-id', listId._str);
      var list = Lists.findOne({ _id: listId });
      var cardIds = list.card_order.split(',');
      var finalCards = new Array(cardIds.length);
      newCards.forEach(function(item) {
        var index = $.inArray(item._id, cardIds);
        if (index > -1) {
          finalCards[index] = item;
        } else {
          finalCards[finalCards.length - 1] = item;
        }
      });
      if (newCards.length === cardIds.length - 1) {
        for (var i=0; i< newCards.length; i++) {
          if (!finalCards[i]) {
            break;
          }
        }
        finalCards.splice(i, 1);
      }

      return finalCards;
    };
    var tmpl = function() {
      return Template.cardItem;
    };
    Blaze.render(Blaze.Each(data, tmpl), _this.$('.list-content')[0]);
  });

  var $sortableCard = $('.list-content').sortable({
    placeholder: 'card-placeholder',
    connectWith: '.list-content',
    stop: function (event, ui) {
      var $beginList = $(event.target).closest('.list-item');
      var $endList = $(ui.item).closest('.list-item');
      var end_card_order = $endList.find('.list-content').sortable('toArray').join(',');
      var endListId = new Meteor.Collection.ObjectID($endList[0].id);
      Lists.update(endListId, { $set: {card_order: end_card_order, moved_card_id: ui.item[0].id }});
      if ($beginList[0].id !== $endList[0].id) {
        //
        var sCardId = ui.item[0].id;
        var cardId = new Meteor.Collection.ObjectID(sCardId);
        Meteor.subscribe('card-by-id', sCardId);
        var card = Cards.findOne({ _id: cardId });
        Cards.update(cardId, { $set: { listId: new Meteor.Collection.ObjectID($endList[0].id) } });
        //
        var begin_card_order = $beginList.find('.list-content').sortable('toArray').join(',');
        var beginListId = new Meteor.Collection.ObjectID($beginList[0].id);
        Lists.update(beginListId, { $set: {card_order: begin_card_order, moved_card_id: ui.item[0].id }});
      }
    }
  })
  .disableSelection();


  Tracker.autorun(function () {
    Meteor.subscribe('current-list-by-id', listId);
    var currentList = Lists.findOne(listId);
    var moved_card_id = currentList.moved_card_id;
    var $moved_card_id = $('#' + moved_card_id);
    var $cardItems = $sortableCard.children('card-item');
    var index = $.inArray(moved_card_id, currentList.card_order.split(','));
    if ($cardItems.length) {
      if (index === $cardItems.length) {
        if ($cardItems.last()[0].id !== moved_card_id) {
          $sortableCard.append($moved_card_id);
        }
      } else if (index === -1) {
        $moved_card_id.remove();
      } else {
        if($cardItems.eq(index)[0].id !== moved_card_id) {
          if (index > $moved_card_id.index('.card-item')) {
            $moved_card_id.insertAfter($cardItems.eq(index));
          } else {
            $moved_card_id.insertBefore($cardItems.eq(index));
          }
        }
      }
    }
  });


};