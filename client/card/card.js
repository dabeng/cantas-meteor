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

};

var finishEditCardName = function(event, template) {
  $(event.target).closest('.editable-region')
    .find('.edit-view').hide()
    .siblings('.static-view').show();
};

Template.card.events({
  'click #card-caption .static-view span': function(event, template) {
    template.$('#card-caption .static-view').hide().siblings('.edit-view').show();
    template.$('#card-caption .edit-view textarea').val(event.target.textContent).select();
  },
  'mousedown #card-caption .edit-view .btn-save': function(event, template) {
    Cards.update(this._id, {$set: { name: template.$('#card-caption .edit-view textarea').val().trim() }});
  },
  'blur #card-caption .edit-view textarea': finishEditCardName,
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
    $(evnet.target).removeClass('fa-times-circle').addClass('fa-times-circle-o');
  },
  'mouseleave .close-btn': function(evnet) {
    $(evnet.target).removeClass('fa-times-circle-o').addClass('fa-times-circle');
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