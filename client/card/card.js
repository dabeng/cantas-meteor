ChecklistItems = new Meteor.Collection('checklistItems');

Template.card.rendered = function() {
  var _this = this;
  var cardId = _this.data._id;

  Meteor.subscribe('checklistItems', function() {
    var data = function() {
      var clItems = ChecklistItems.find({ cardId: cardId });
      var clearifyId = function (doc) {
        doc._id = doc._id._str;
        return doc;
      }
      // remove the string "ObjectId()" to simplify _id
      var newClItems = clItems.map(clearifyId);
      Meteor.subscribe('card-by-id', cardId._str);
      var card = Cards.findOne({ _id: cardId });
      if (card.cli_order) {
        var clItemIds = card.cli_order.split(',');
        var finalClItems = new Array(clItemIds.length);
        newClItems.forEach(function(item) {
          var index = $.inArray(item._id, clItemIds);
          if (index > -1) {
            finalClItems[index] = item;
          } else {
            // because checklistItem collection updating is priority to card collection(fields: cli_order
            // and moved_cli_id) updating, if index === -1, then we just now insert a new checklist item
            // into checklistItem collection while, at this point, card collection hasn't been updated 
            // correspondingly. So we need to put it in the end.
            finalClItems[finalClItems.length - 1] = item;
          }
        });
        // if newClItems is smaller than clItemIds, is says that we just now delete one checklist item
        // from checklistItem collection. We need to remove one meaningless null value from finalClItems.
        if (newClItems.length === clItemIds.length - 1) {
          for (var i=0; i< newClItems.length; i++) {
            if (!finalClItems[i]) {
              break;
            }
          }
          finalClItems.splice(i, 1);
        }

        return finalClItems;
      } else {
        return newClItems;
      }
    };
    var tmpl = function() {
      return Template.checklistItem;
    };
    Blaze.render(Blaze.Each(data, tmpl), _this.$('.checklist')[0]);
  });

  var $sortableCL = $('#card-content .checklist').sortable({
    placeholder: 'ui-state-highlight',
    stop: function(event, ui) {
      var cli_order = $sortableCL.sortable('toArray').join(',');
      Cards.update(_this.data._id, { $set: {cli_order: cli_order, moved_cli_id: ui.item[0].id }});
    }
  })
  .disableSelection();

  // resort the checklist items of non-current client when the cli_order field of card collection
  // is updated
  Tracker.autorun(function () {
    Meteor.subscribe('current-card-by-id', cardId);
    var currentCard = Cards.findOne(cardId);
    if (currentCard && currentCard.moved_cli_id) {
      var moved_cli_id = currentCard.moved_cli_id;
      var $moved_cli_id = $('#' + moved_cli_id);
      var $clItems = $sortableCL.children('checklistItem');
      var index = $.inArray(moved_cli_id, currentCard.cli_order.split(','));
      // if checklist items of current client is empty, there is no need to ajust order for other client
      if ($clItems.length) {
        // insert a new checklist item
        if (index === $clItems.length) {
          // juse need to resort checklist item in non-current client, because
          // cheklist item is in order already.
          if ($clItems.last()[0].id !== moved_cli_id) {
            $sortableCL.append($moved_cli_id);
          }
        } else if (index === -1) { // delete the checklist item with id moved_cli_id
          $moved_cli_id.remove();
        } else { // just drag and drop existing checklist items in current card
          if($clItems.eq(index)[0].id !== moved_cli_id) {
            if (index > $moved_cli_id.index('.checklistItem')) {
              $moved_cli_id.insertAfter($clItems.eq(index));
            } else {
              $moved_cli_id.insertBefore($clItems.eq(index));
            }
          }
        }
      }
    }
  });

};

Template.card.events({
  'click #card-caption .static-view span': function(event, template) {
    $cardContent = $(event.target);
    template.$('.static-view').hide();
    Blaze.renderWithData(Template.editCardName, { cardId: this._id, name: $cardContent.text() },
      template.$('#card-caption')[0]);
  },
  'click #add-cli-option': function (event, template) {
    var $cardFooter = $('#card-footer');
    var $cardContent = $('#card-content');
    if ($cardFooter.is(':hidden')) {
      if(!$('#ta-addCLI').length) {
        Blaze.renderWithData(Template.addChecklistItem, {cardId: this._id}, $cardFooter[0]);
      }
      var footerHeight = 50;
      var contentHeight  =  $('#card-content').height();
      $cardContent.animate({ height: contentHeight - footerHeight }, 300);
      $cardFooter.show().animate({ height: footerHeight }, 300);
    }
  },
  'click .cli-delete': function (event, template) {
    ChecklistItems.remove(this._id);
  },
  'mouseenter .close-btn': function(evnet) {
    $(evnet.target).removeClass('icon-remove-circle').addClass('icon-remove-sign');
  },
  'mouseleave .close-btn': function(evnet) {
    $(evnet.target).removeClass('icon-remove-sign').addClass('icon-remove-circle');
  },
  'click .close-btn': function(evnet, template) {
    var $cardFooter = $('#card-footer');
    var $cardContent = $('#card-content');
    var footerHeight = 50;
    var contentHeight = $('#card-content').height();
    $cardContent.animate({ height: contentHeight + footerHeight }, 300);
    $cardFooter.animate({ height: 0 }, 300, function() {
      $(this).hide();
    });
  }
});