
Template.addChecklistItem.events({
  'click #btn-addCLI': function (event, template) {

    var newCLI = template.find('textarea');
    if (newCLI.value.trim().length) {
      Meteor.subscribe('checklistItems', function() {
        ChecklistItems.insert({ name: newCLI.value, checked: false, cardId: template.data.cardId,
        	  _id: new Meteor.Collection.ObjectID() }, function(error, _id) {
              Meteor.subscribe('card-by-id', template.data.cardId._str, function() {
                var card = Cards.findOne({ _id: template.data.cardId });
                var new_cli_order = card.cli_order === '' ? _id._str : card.cli_order + ',' +_id._str;
                Cards.update(template.data.cardId, { $set: {cli_order: new_cli_order, moved_cli_id: _id._str }});
              });

        	  });
        newCLI.value = '';
      });
    }
  }
});