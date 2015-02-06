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

Meteor.publish('cards', function () {
  return Cards.find();
});

Meteor.publish('cards-by-listId', function (s_id) {
  return Cards.find({ listId: new Meteor.Collection.ObjectID(s_id) });
});

Meteor.publish('card-by-id', function (s_id) {
  return Cards.find({ _id: new Meteor.Collection.ObjectID(s_id) });
});

Meteor.publish('checklistItems', function () {
  return ChecklistItems.find();
});