(function($) {

  $(function() {
    var $nav = $('#nav-dots').children();
    var slitslider = $('#slider').slitslider({
      onBeforeChange : function(slide, pos) {
        $nav.removeClass('nav-dot-current').eq(pos).addClass('nav-dot-current');
      }
    });

    $nav.on('click', function() {
      var $dot = $(this);
      if (!slitslider.isActive()) {
        $nav.removeClass('nav-dot-current');
        $dot.addClass('nav-dot-current');
      }       
      slitslider.jump($nav.index($dot) + 1);
      return false;
    });
    
  });

}(jQuery));