ChecklistItems = new Meteor.Collection('checklistItems');

Template.card.rendered = function() {
  var _this = this;
  var cardId = _this.data._id;

  Meteor.subscribe('checklistItems', {'cardId': cardId}, function() {
    var data = function() {
      var clItems = ChecklistItems.find({ cardId: cardId });
      var card = Cards.findOne({ _id: cardId });
      return refreshDatasource(clItems, card.cli_order);
    };
    var tmpl = function() {return Template.checklistItem; };
    Blaze.render(Blaze.Each(data, tmpl), _this.$('.checklist')[0]);
  });

  var $sortableCL = $('#card-content .checklist').sortable({
    placeholder: 'ui-state-highlight',
    start: function(event, ui) { $('#' + ui.item[0].id).css('cursor', 'move'); },
    stop: function(event, ui) {
      var sCliId = ui.item[0].id;
      $('#' + sCliId).css('cursor', '');
      var cli_order = $sortableCL.sortable('toArray').join(',');
      Cards.update(_this.data._id, { $set: {cli_order: cli_order, moved_cli_id: sCliId }});
    }
  })
  .disableSelection();

};

Template.card.events({
  'click #card-caption .static-view span': showEditCaptionView,
  'mousedown #card-caption .edit-view .btn-save': function(event, template) {
    Cards.update(this._id, {$set: { name: template.$('#card-caption .edit-view textarea').val().trim() }});
  },
  'blur #card-caption .edit-view textarea': hideEditCaptionView,
  'click #add-cli-option': function (event, template) {
    var $cardFooter = $('#card-footer');
    var $cardContent = $('#card-content');
    if ($cardFooter.is(':hidden')) {
      if(!$('#ta-addCLI').length) {
        Blaze.renderWithData(Template.addChecklistItem, {cardId: this._id}, $cardFooter[0]);
      }
      showFooterView($cardFooter, $cardContent, 70);
    }
  },
  'click .cli-delete': function (event, template) {
    ChecklistItems.remove(this._id);
  }
});