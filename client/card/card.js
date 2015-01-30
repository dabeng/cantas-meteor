ChecklistItems = new Meteor.Collection('checklistItems');

Template.card.rendered = function() {
  var _this = this;
  var cardId = _this.data._id;

  Meteor.subscribe('checklistItems-by-cardId', cardId._str, function() {
    var data = function() {
      var clItems = ChecklistItems.find({ cardId: cardId });
      var clearifyId = function (doc) {
        doc._id = doc._id._str;
        return doc;
      }
      // remove the string "ObjectId()" to simplify _id
      var newClItems = clItems.map(clearifyId);
      if (_this.data.cli_order) {
        var clItemIds = _this.data.cli_order.split(',');
        var finalClItems = new Array(clItemIds.length);
        newClItems.forEach(function(item) {
            finalClItems[$.inArray(item._id, clItemIds)] = item;
        });

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
  Tracker.autorun(function (computation) {
    Meteor.subscribe('current-card-by-id', cardId);
    var currentCard = Cards.findOne(cardId);
    if (!computation.firstRun && currentCard && currentCard.moved_cli_id) {
      var moved_cli_id = currentCard.moved_cli_id;
      var $moved_cli = $('#' + moved_cli_id);

      var $clItems = $sortableCL.find('.checklistItem');
      var target_index = $.inArray(moved_cli_id, currentCard.cli_order.split(','));
      if (!$moved_cli.length) {
          var data = ChecklistItems.findOne({_id : new Meteor.Collection.ObjectID(moved_cli_id)});
          data._id = data._id._str;
          $sortableCL.append(Blaze.toHTMLWithData(Template.checklistItem, data));
        }
        else if (target_index === -1) {
          $moved_cli.remove();
        }
        else if(target_index > -1) {
          var original_index = $clItems.index($moved_cli);
          if (original_index < target_index) {
            $moved_cli.insertAfter($clItems.eq(target_index));
          } else if (original_index > target_index) {
            $moved_cli.insertBefore($clItems.eq(target_index));
          }
        }
    }
  });

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