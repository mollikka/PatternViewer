//https://stackoverflow.com/a/4755579/3417477

const FRICTION = 0.8;
const EPSILON = 0.1;

const NO_DRAG = 0;
const MOUSE_DRAG = 1;
const TOUCH_DRAG = 2;

const BACKGROUNDS = ['bg1.png', 'bg2.png', 'bg3.png'];

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

  main_element: 'body',

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
      $(this.main_element).css({ 'background-position-x':this.real_position_X,
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
    $(this.main_element).css({  'background-position-x':this.real_position_X,
                                'background-position-y':this.real_position_Y});
    this.speed_X *= FRICTION;
    this.speed_Y *= FRICTION;

    //need to save context (jquery proxy) so that the function can call this
    setTimeout($.proxy(this.newton_movement,this), 30);
  },

  choose_background: function(bg_id) {
    //if change already in progress, do nothing
    if ($('#bg-switcher').hasClass('bg-switcher-animation')) {return;}

    $('#bg-switcher').css({ 'background-image': 'url('+BACKGROUNDS[bg_id]+')'});

    //if changing to same background, do nothing
    if ($('#bg-switcher').css('background-image') == 
        $(this.main_element).css('background-image')) {
      return;
    }

    $('#bg-switcher').addClass('bg-switcher-animation');
    $('#bg-switcher').on({'animationend': $.proxy(function(e) {
      $(e.target).removeClass('bg-switcher-animation');
      $(this.main_element).css({
        'background-position-x':0,
        'background-position-y':0,
        'background-image': $(e.target).css('background-image')
      });
      this.event_move_reset();
    }, this)});
  }
};

$(document).ready(function() {

  //CHOOSE BACKGROUND
  $(document).on({'keypress': function(e) {
    if (e.key == '1') bg_switcher.choose_background(0);
    if (e.key == '2') bg_switcher.choose_background(1);
    if (e.key == '3') bg_switcher.choose_background(2);
  }});

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
