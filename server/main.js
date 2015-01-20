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

Meteor.publish('list-by-id', function (s_id) {
  return Lists.find({ _id: new Meteor.Collection.ObjectID(s_id) });
});

Meteor.publish('current-list-by-id', function (_id) {
  var _this = this;

  Lists.find({ _id: _id }).observeChanges({
    changed: function (id, fields) {
      if(fields.list_order) {
        _this.changed('lists', _id, { card_order: fields.card_order, moved_card_id: fields.moved_card_id });
      }
    }
  });
});

Meteor.publish('current-board-by-id', function (_id) {
  var _this = this;

  Boards.find({ _id: _id }).observeChanges({
    changed: function (id, fields) {
      if(fields.list_order) {
        _this.changed('boards', _id, { list_order: fields.list_order, moved_list_id: fields.moved_list_id });
      }
    }
  });
});

Meteor.publish('cards', function () {
  return Cards.find();
});

Meteor.publish('cards-by-listId', function (s_id) {
  return Cards.find({ listId: new Meteor.Collection.ObjectID(s_id) });
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