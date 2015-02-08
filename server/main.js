Boards = new Meteor.Collection('boards');
Lists = new Meteor.Collection('lists');
Cards = new Meteor.Collection('cards');
ChecklistItems = new Meteor.Collection('checklistItems');

Meteor.publish('boards', function (filter) {
  return Boards.find(filter || {});
});

Meteor.publish('lists', function (filter) {
  return Lists.find(filter || {});
});

Meteor.publish('cards', function (filter) {
  return Cards.find(filter || {});
});

Meteor.publish('checklistItems', function (filter) {
  return ChecklistItems.find(filter || {});
});