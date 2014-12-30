ChecklistItems = new Meteor.Collection('checklistItems');

Template.card.rendered = function() {
  var _this = this;
  Meteor.subscribe('checklistItems', function() {
    var data = function() {
      var clItems = ChecklistItems.find({ cardId: _this.data._id });
      var clearifyId = function (doc) {
        doc._id = doc._id._str;
        return doc;
      }
      var newClItems = clItems.map(clearifyId);
      Meteor.subscribe('card-by-id', _this.data._id._str);
      var card = Cards.findOne({ _id: _this.data._id });
      var clItemIds = card.cli_order.split(',');
      var finalClItems = new Array(clItemIds.length);
      newClItems.forEach(function(item) {
        var index = $.inArray(item._id, clItemIds);
        if (index > -1) {
          finalClItems[index] = item;
        } else {
          finalClItems[finalClItems.length - 1] = item;
        }
      });
      if (newClItems.length ===  clItemIds.length - 1) {
        for (var i=0; i< newClItems.length; i++) {
          if (!finalClItems[i]) {
            break;
          }
        }
        finalClItems.splice(i, 1);
      }

      return finalClItems;
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
      // Session.set('card_'+ _this.data._id + '_cliorder', cli_order);
      Cards.update(_this.data._id, { $set: {cli_order: cli_order, moved_cli_id: ui.item[0].id }});
    },
    over: function (event, ui) {
      var a = 100;
    },
    change: function (event, ui) {
      var a = 100;
    }
  })
  .disableSelection();

  Tracker.autorun(function () {
    Meteor.subscribe("current-card-by-id", _this.data._id);
    var cli_order = Cards.findOne(_this.data._id).cli_order;
    var moved_cli_id = Cards.findOne(_this.data._id).moved_cli_id;
    if ($sortableCL.children().length) {
      var index = $.inArray(moved_cli_id, cli_order.split(','));
      var length = $sortableCL.children().length;
      if (index === length) {
        if($sortableCL.children().last()[0].id !== moved_cli_id) {
          $sortableCL.append($('#' + moved_cli_id));
        }
      } else if (index === -1) {
        $('#' + moved_cli_id).remove();
      } else {
        if($sortableCL.children().eq(index)[0].id !== moved_cli_id) {
          if (index > 0) {
            if (index > $('#' + moved_cli_id).index('.checklistItem')) {
              $('#' + moved_cli_id).insertAfter($sortableCL.children().eq(index));
            } else {
              $('#' + moved_cli_id).insertBefore($sortableCL.children().eq(index));
            }
          } else {
            $sortableCL.prepend($('#' + moved_cli_id));
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
      if(!$('#text-addCLI').length) {
        Blaze.renderWithData(Template.addChecklistItem, {cardId: this._id}, $cardFooter[0]);
      }
      var footerHeight = 50;
      var contentHeight  =  $('#card-content').height();
      $cardContent.animate({
        height: contentHeight - footerHeight
      }, 300);
      $cardFooter.show().animate({
        height: footerHeight
      }, 300);
    }
  },
  'click .cli-delete': function (event, template) {
    ChecklistItems.remove(this._id);
  },
  'mouseenter #closeBtn': function(evnet) {
    $(evnet.target).removeClass('icon-remove-circle').addClass('icon-remove-sign');
  },
  'mouseleave #closeBtn': function(evnet) {
    $(evnet.target).removeClass('icon-remove-sign').addClass('icon-remove-circle');
  },
  'click #closeBtn': function(evnet, template) {
    var $cardFooter = $('#card-footer');
    var $cardContent = $('#card-content');
    var footerHeight = 50;
    var contentHeight  =  $('#card-content').height();
    $cardContent.animate({
      height: contentHeight + footerHeight
    }, 300);
    $cardFooter.children().not('#closeBtn').animate({
      height: 0
    }, 300, function() {  $(this).hide() }) ;
    $cardFooter.hide();
  }
});