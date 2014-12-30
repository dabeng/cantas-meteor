Lists = new Meteor.Collection('lists');

Template.board.rendered = function() {
  var _this = this;
    Meteor.subscribe('lists');
  var data = function() {
    return Lists.find({ boardId: _this.data._id });
  };
  var tmpl = function() {
    return Template.list;
  };
  Blaze.render(Blaze.Each(data, tmpl), this.$('#board-content')[0]);
};