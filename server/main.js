Boards = new Meteor.Collection('boards');
Lists = new Meteor.Collection('lists');
Cards = new Meteor.Collection('cards');
ChecklistItems = new Meteor.Collection('checklistItems');

Meteor.publish('boards', function (filter) { return Boards.find(filter || {}); });
Meteor.publish('lists', function (filter) { return Lists.find(filter || {}); });
Meteor.publish('lists-monitor', function (_id) {
  var _this = this;
  Lists.find(filter || {}).observeChanges({
    changed: function (id, fields) {
      if (fields.hasOwnProperty('card_order')) {
        _this.changed('lists', id, fields);
      }
    }
  });
});
Meteor.publish('cards', function (filter) { return Cards.find(filter || {}); });
Meteor.publish('checklistItems', function (filter) { return ChecklistItems.find(filter || {}); });