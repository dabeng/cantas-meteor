// some clearing tasks after user edited the name of board, list, card, checklistitem.
finishEditName = function(event, template) {
  $(event.target).closest('.editable-region').find('.edit-view').hide().siblings('.static-view').show();
};