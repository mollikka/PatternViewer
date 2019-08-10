//https://stackoverflow.com/a/4755579/3417477

const FRICTION = 0.8;
const EPSILON = 0.1;

const NO_DRAG = 0;
const MOUSE_DRAG = 1;
const TOUCH_DRAG = 2;

var bg_switcher = {
  move_last_X: 0,
  move_last_Y: 0,
  delta_X: 0,
  delta_Y: 0,
  real_position_X: 0,
  real_position_Y: 0,
  speed_X: 0,
  speed_Y: 0,

  dragmode: NO_DRAG,

  background_images: [],

  event_move_reset: function() {
    this.real_position_X = 0;
    this.real_position_Y = 0;
  },

  event_move_start: function(pos_X, pos_Y, type) {

    if (this.dragmode == NO_DRAG) {
      this.move_last_X = pos_X;
      this.move_last_Y = pos_Y;
      this.speed_X = 0;
      this.speed_Y = 0;
      this.delta_X = 0;
      this.delta_Y = 0;
      this.dragmode = type;
    }
  },

  event_move_active: function(pos_X, pos_Y, type) {
    if (this.dragmode == type) {
      this.delta_X = pos_X - this.move_last_X;
      this.delta_Y = pos_Y - this.move_last_Y;
      this.move_last_X = pos_X;
      this.move_last_Y = pos_Y;
      this.real_position_X += this.delta_X;
      this.real_position_Y += this.delta_Y;
      $('#bg-switcher-base').css({ 'background-position-x':this.real_position_X,
                      'background-position-y':this.real_position_Y});
    }
  },

  event_move_end: function(type) {
    if (this.dragmode == type) {
      this.dragmode = NO_DRAG;
      this.speed_X = this.delta_X;
      this.speed_Y = this.delta_Y;
      this.newton_movement();
    }
  },

  newton_movement: function() {
    if (Math.abs(this.speed_X) < EPSILON) {this.speed_X = 0;}
    if (Math.abs(this.speed_Y) < EPSILON) {this.speed_Y = 0;}
    if ((this.speed_X == 0) && (this.speed_Y == 0)) return;
    if (this.dragmode != NO_DRAG) return;

    this.real_position_X += this.speed_X;
    this.real_position_Y += this.speed_Y;
    $('#bg-switcher-base').css({  'background-position-x':this.real_position_X,
                                'background-position-y':this.real_position_Y});
    this.speed_X *= FRICTION;
    this.speed_Y *= FRICTION;

    //need to save context (jquery proxy) so that the function can call this
    setTimeout($.proxy(this.newton_movement,this), 30);
  },

  choose_background: function(bg_filename, bg_size) {
    //if change already in progress, do nothing
    if ($('#bg-switcher-effect').hasClass('bg-switcher-animation')) {return;}


    $('#bg-switcher-effect').css({ 'background-image': 'url('+bg_filename+')',
                                   'background-size': bg_size+'pt'});

    //if changing to same background, do nothing
    if ($('#bg-switcher-effect').css('background-image') == 
        $('#bg-switcher-base').css('background-image')) {
      return;
    }

    $('#bg-switcher-effect').addClass('bg-switcher-animation');
    $('#bg-switcher-effect').on({'animationend': $.proxy(function(e) {
      $(e.target).removeClass('bg-switcher-animation');
      $('#bg-switcher-base').css({
        'background-position-x':0,
        'background-position-y':0,
        'background-image': $(e.target).css('background-image'),
        'background-size': bg_size+'pt'
      });
      this.event_move_reset();
    }, this)});
  },

  activate_menuitem: function(menuitem_element) {
    bg_switcher.choose_background(menuitem_element.bg_filename, menuitem_element.bg_size);
    $('#bg-switcher-menu').find('*').removeClass('bg-switcher-menu-selected');
    menuitem_element.addClass('bg-switcher-menu-selected');
  },

  menu_add: function(bg_filename, display_name, bg_size) {
    var preloaded_image = new Image();
    preloaded_image.src = bg_filename;
    //need to keep a reference to preloaded images or they might get released
    this.background_images.push(preloaded_image);
    var menuitem_element = $('<a class="nav-link" href="#">'+display_name+'</a>');
    menuitem_element.bg_size = bg_size;
    menuitem_element.bg_filename = bg_filename;
    $('#bg-switcher-menu').append(menuitem_element);
    $(document).ready(function() {
      menuitem_element.click(function(e) {
        bg_switcher.activate_menuitem(menuitem_element);
      });
    });
    return menuitem_element;
  }
};

$(document).ready(function() {

  //START DRAG
  $(document).on({'touchstart': function(e) {
    bg_switcher.event_move_start(e.touches[0].pageX, e.touches[0].pageY, TOUCH_DRAG);
  }});
  $(document).on({'mousedown': function(e) {
    if (e.button == 0) {
      bg_switcher.event_move_start(e.pageX, e.pageY, MOUSE_DRAG);
    }
  }});

  //MID DRAG
  $(document).on({'touchmove': function(e) {
    bg_switcher.event_move_active(e.touches[0].pageX, e.touches[0].pageY, TOUCH_DRAG);
  }});
  $(document).on({'mousemove': function(e) {
    bg_switcher.event_move_active(e.pageX, e.pageY, MOUSE_DRAG);
  }});

  //END DRAG
  $(document).on({'touchend': function(e) {
    bg_switcher.event_move_end(TOUCH_DRAG);
  }});
  $(document).on({'touchcancel': function(e) {
    bg_switcher.event_move_end(TOUCH_DRAG);
  }});
  $(document).on({'mouseup': function(e) {
    if (e.button == 0) {
      bg_switcher.event_move_end(MOUSE_DRAG);
    }
  }});

});
