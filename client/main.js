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
    waitOn: function () {
      return Meteor.subscribe('boards');
    },
    action: function () {
      this.render('boardList');
    }
  });

  this.route('board', {
    path: '/board/:_id',
    data: function () {
      return Boards.findOne({ _id: new Meteor.Collection.ObjectID(this.params._id) });
    },
    waitOn: function () {
      return Meteor.subscribe('board-by-id', this.params._id);
    },
    action: function () {
      this.render('board');
    }
  });

  this.route('card', {
    path: '/card/:_id',
    data: function () {
      return Cards.findOne({ _id: new Meteor.Collection.ObjectID(this.params._id) });
    },
    waitOn: function () {
      return Meteor.subscribe('card-by-id', this.params._id);
    },
    action: function () {
      this.render('card');
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