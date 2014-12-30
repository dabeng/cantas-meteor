Cards = new Meteor.Collection('cards');

Template.list.rendered = function() {
  var _this = this;
  Meteor.subscribe('cards', function() {
    var data = function() {
      var cards = Cards.find({ listId: _this.data._id });
      var clearifyId = function (doc) {
        doc._id = doc._id._str;
        return doc;
      }
      return cards.map(clearifyId);
    };
    var tmpl = function() {
      return Template.cardItem;
    };
    Blaze.render(Blaze.Each(data, tmpl), _this.$('.list-content')[0]);
  });
};