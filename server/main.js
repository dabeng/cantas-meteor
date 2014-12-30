Boards = new Meteor.Collection('boards');
Lists = new Meteor.Collection('lists');
Cards = new Meteor.Collection('cards');
ChecklistItems = new Meteor.Collection('checklistItems');

Meteor.publish('boards', function () {
  return Boards.find();
});

Meteor.publish('board-by-id', function (s_id) {
  // new Mongo.ObjectID(sId) is equivalent
  return Boards.find({ _id: new Meteor.Collection.ObjectID(s_id) });
});

Meteor.publish('lists', function () {
  return Lists.find();
});

Meteor.publish('cards', function () {
  return Cards.find();
});

Meteor.publish('card-by-id', function (s_id) {
  return Cards.find({ _id: new Meteor.Collection.ObjectID(s_id) });
});

Meteor.publish('current-card-by-id', function (_id) {
  var _this = this;

  Cards.find({ _id: _id }).observeChanges({
    changed: function (id, fields) {
      if(fields.cli_order) {
        _this.changed('cards', _id, { cli_order: fields.cli_order, moved_cli_id: fields.moved_cli_id });
      }
    }
  });
});

Meteor.publish('checklistItems', function () {
  return ChecklistItems.find();
});