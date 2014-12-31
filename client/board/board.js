Lists = new Meteor.Collection('lists');

Template.board.rendered = function() {
  var _this = this;
  var boardId = _this.data._id;
  Meteor.subscribe('lists');
  var data = function() {
    return Lists.find({ boardId: boardId });
  };
  var tmpl = function() {
    return Template.list;
  };
  Blaze.render(Blaze.Each(data, tmpl), this.$('#board-content')[0]);


  var $sortableList = $('#board-content').sortable({
    axis: 'x',
    placeholder: 'list-placeholder',
    tolerance: 'pointer',
    stop: function(event, ui) {
      var list_order = $sortableList.sortable('toArray').join(',');
      Boards.update(boardId, { $set: {list_order: list_order, moved_list_id: ui.item[0].id }});
    }
  })
  .disableSelection();


};