Template.editCardName.rendered = function() {
  this.$('textarea').select();
};

var finishEditCardName = function(event, template) {
  $editableRegion = $(event.target).closest('.editable-region');
  template.$('.edit-view').remove();
  $editableRegion.find('.static-view').show();
};

Template.editCardName.events({
  'mousedown .btn-save': function(event, template) {
    Cards.update(this.cardId, {$set: { name: template.$('textarea').val().trim() }});
  },
  'blur textarea': finishEditCardName
});