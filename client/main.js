Router.configure({layoutTemplate: 'layout'});

Boards = new Meteor.Collection('boards');

Router.map(function () {

  this.route('boardList', {
    path: '/',
    data: function () {
      var boards = Boards.find();
      var clearifyId = function (doc) {
        doc._id = doc._id._str;
        return doc;
      }
      return boards.map(clearifyId);
    },
    loadingTemplate: 'loading',
    waitOn: function () {
      return Meteor.subscribe('boards');
    }
  });

  this.route('board', {
    path: '/board/:_id',
    data: function () {
      return Boards.findOne({ _id: new Meteor.Collection.ObjectID(this.params._id) });
    },
    waitOn: function () {
      return Meteor.subscribe('boards', { _id: new Meteor.Collection.ObjectID(this.params._id) });
    }
  });

  this.route('card', {
    path: '/card/:_id',
    data: function () {
      return Cards.findOne({ _id: new Meteor.Collection.ObjectID(this.params._id) });
    },
    waitOn: function () {
      return Meteor.subscribe('cards', { _id: new Meteor.Collection.ObjectID(this.params._id) });
    }
  });

});

Router.route('/new/board', function () {
  var _this = this;
  Boards.insert({ name: 'One Board', _id: new Meteor.Collection.ObjectID() }, function(error, _id) {
    if (error) {
       // exception handling
      } else {
         _this.redirect('/board/' + _id._str);  
      }
    });
});