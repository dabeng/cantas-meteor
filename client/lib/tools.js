refreshDatasource = function(cursor, order) {
      var clearifyId = function (doc) {
        doc._id = doc._id._str;
        return doc;
      }
      var entities = cursor.map(clearifyId);
      if (order) {
        var aId = order.split(',');
        var orderedEntities = [];
        entities.forEach(function(item) {
          orderedEntities[$.inArray(item._id, aId)] = item;
        });

        return orderedEntities;
      } else {
        return entities;
      }
};

showEditCaptionView = function (event, template) {
  $(event.target).closest('.static-view').hide().siblings('.edit-view').show()
    .find('textarea').val(event.target.textContent).select();
};

hideEditCaptionView = function (event, template) {
  $(event.target).closest('.editable-region').find('.edit-view').hide().siblings('.static-view').show();
};

showFooterView = function ($footerView, $contentView, footerHeight, fromList) {
  $contentView.animate({ height: $contentView.outerHeight() - footerHeight }, 200);
  $footerView.show().animate({ height: (fromList ? footerHeight + 20 : footerHeight)  }, 200, function() {
    if (fromList) {
      $footerView.find('.static-view').hide().siblings('.edit-view').show().find('textarea').focus();
    } else {
      $footerView.find('textarea').focus();
    }
  });
};

hideFooterView = function (event, template) {
  var increment =  template.view.name === 'Template.list' ?  20 : 0;
  var $footerView = $(event.target).closest('.footer-view');
  var $contentView = $footerView.siblings('.content-view');
  $contentView.animate({ height: $contentView.outerHeight() + $footerView.outerHeight() - increment }, 200, function() {
    $(this).css('height','');
  });
  $footerView.animate({ height: 0 + increment }, 200, function() {
    if (template.view.name === 'Template.list') {
      $footerView.find('.edit-view').hide().siblings('.static-view').show();
    } else {
      $footerView.hide();
    }
  });
};