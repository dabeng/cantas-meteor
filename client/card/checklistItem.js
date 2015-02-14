Template.checklistItem.events({
  'click .cli-checkbox': function (event, template) {
    ChecklistItems.update(new Meteor.Collection.ObjectID(this._id), {$set: {checked: ! this.checked}});
  },
  'click .cli-name': showEditCaptionView,
  'mousedown .edit-view .btn-save': function(event, template) {
    ChecklistItems.update(new Meteor.Collection.ObjectID(this._id),
      {$set: { name: template.$('.edit-view textarea').val().trim() }}
    );
  },
  'blur .edit-view textarea': hideEditCaptionView,
  'click .cli-delete': function (event, template) {
    ChecklistItems.remove(new Meteor.Collection.ObjectID(this._id), function(error, _id) {
      if (error) {
        // TODO: exception handling
      } else {
        var card = Cards.findOne({ _id: template.data.cardId });
        var new_cli_order;
        var old_cli_order = card.cli_order;

          if (old_cli_order.indexOf(',') === -1) {
            new_cli_order = '';
          } else if (old_cli_order.indexOf(template.data._id) === 0) {
            new_cli_order = old_cli_order.replace(new RegExp(template.data._id + ','), '');
          } else {
            new_cli_order = old_cli_order.replace(new RegExp(',' + template.data._id), '');
          }
        
        Cards.update(template.data.cardId, { $set: {cli_order: new_cli_order, moved_cli_id: template.data._id }});
      }
    });
  }
});