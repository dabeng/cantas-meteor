
Template.checklistItem.events({
  'click .cli-checkbox': function (event, template) {
    ChecklistItems.update(new Meteor.Collection.ObjectID(this._id), {$set: {checked: ! this.checked}});
  },
  'click .cli-name': function (event, template) {
    $cliName = $(event.target);
    template.$('.display-cli-wrapper').hide();
    Blaze.renderWithData(Template.editChecklistItem, { cliId: this._id, name: $cliName.text() },
      template.$('.checklistItem')[0]);
  },
  'click .cli-delete': function (event, template) {
    ChecklistItems.remove(new Meteor.Collection.ObjectID(this._id), function(error, _id) {
      Meteor.subscribe('card-by-id', template.data.cardId._str, function() {
        var card = Cards.findOne({ _id: template.data.cardId });
        var new_cli_order;
        if (!card.cli_order.length) {
          new_cli_order = template.data._id;
        } else {
          if (card.cli_order.indexOf(',') === -1) {
            new_cli_order = '';
          } else if (card.cli_order.indexOf(template.data._id) === 0) {
            new_cli_order = card.cli_order.replace(new RegExp(template.data._id + ','), '');
          } else {
            new_cli_order = card.cli_order.replace(new RegExp(',' + template.data._id), '');
          }
        }
        Cards.update(template.data.cardId, { $set: {cli_order: new_cli_order, moved_cli_id:  template.data._id }});
      });
    });
  }
});