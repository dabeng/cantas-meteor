Template.editChecklistItem.rendered = function() {
  this.$('#ta-edit-cli').select();
};

var finishEditCLI = function(event, template) {
    $checklistItem = $(event.target).closest('.checklistItem');
    template.$('.edit-cli-wrapper').remove();
    $checklistItem.find('.display-cli-wrapper').show();
};

Template.editChecklistItem.events({
  'mousedown #btn-save-cli': function(event, template) {
    ChecklistItems.update(this.cliId, {$set: { name: template.$('#ta-edit-cli').val().trim() }});
    // finishEditCLI(event, template);
  },
  // 'click #btn-cancel-cli': finishEditCLI
  'blur #ta-edit-cli': finishEditCLI
});