//https://stackoverflow.com/a/4755579/3417477
var move_last_X = 0;
var move_last_Y = 0;
var delta_X = 0;
var delta_Y = 0;
var real_position_X = 0;
var real_position_Y = 0;
var speed_X = 0;
var speed_Y = 0;

FRICTION = 0.8;
EPSILON = 0.1;

NO_DRAG = 0;
MOUSE_DRAG = 1;
TOUCH_DRAG = 2;

BACKGROUNDS = ['bg1.png', 'bg2.png', 'bg3.png'];

var dragmode = NO_DRAG;

var main_element = 'body';

function event_move_reset() {
  real_position_X = 0;
  real_position_Y = 0;
}

function event_move_start(pos_X, pos_Y, type) {

  if (dragmode == NO_DRAG) {
    move_last_X = pos_X;
    move_last_Y = pos_Y;
    speed_X = 0;
    speed_Y = 0;
    delta_X = 0;
    delta_Y = 0;
    dragmode = type;
  }
}

function event_move_active(pos_X, pos_Y, type) {
  if (dragmode == type) {
    delta_X = pos_X - move_last_X;
    delta_Y = pos_Y - move_last_Y;
    console.log('move '+ delta_X + ','+delta_Y);
    move_last_X = pos_X;
    move_last_Y = pos_Y;
    real_position_X += delta_X;
    real_position_Y += delta_Y;
    $(main_element).css({ 'background-position-x':real_position_X,
                    'background-position-y':real_position_Y});
  }
}

function event_move_end(type) {
  if (dragmode == type) {
    dragmode = NO_DRAG;
    speed_X = delta_X;
    speed_Y = delta_Y;
    newton_movement();
  }
}

function newton_movement() {
  console.log(speed_X + ',' + speed_Y);
  if (Math.abs(speed_X) < EPSILON) {speed_X = 0;}
  if (Math.abs(speed_Y) < EPSILON) {speed_Y = 0;}
  if ((speed_X == 0) && (speed_Y == 0)) return;
  if (dragmode != NO_DRAG) return;

  real_position_X += speed_X;
  real_position_Y += speed_Y;
  $(main_element).css({ 'background-position-x':real_position_X,
                  'background-position-y':real_position_Y});

  speed_X *= FRICTION;
  speed_Y *= FRICTION;

  setTimeout(newton_movement, 30);
}

$(document).ready(function() {

  //CHOOSE BACKGROUND
  $(document).on({'keypress': function(e) {
    //if change already in progress, do nothing
    if ($('#bg-switcher').hasClass('bg-switcher-animation')) {return;}

    if (e.key == '1') {
      $('#bg-switcher').css({ 'background-image': 'url('+BACKGROUNDS[0]+')'});
    }
    if (e.key == '2') {
      $('#bg-switcher').css({ 'background-image': 'url('+BACKGROUNDS[1]+')'});
    }
    if (e.key == '3') {
      $('#bg-switcher').css({ 'background-image': 'url('+BACKGROUNDS[2]+')'});
    }

    //if changing to same background, do nothing
    if ($('#bg-switcher').css('background-image') == 
        $(main_element).css('background-image')) {
      return;
    }

    $('#bg-switcher').addClass('bg-switcher-animation');
    $('#bg-switcher').on({'animationend': function(e) {
      $(e.target).removeClass('bg-switcher-animation');
      $(main_element).css({
        'background-position-x':0,
        'background-position-y':0,
        'background-image': $(e.target).css('background-image')
      });
      event_move_reset();
    }});
  }});

  //START DRAG
  $(document).on({'touchstart': function(e) {
    event_move_start(e.touches[0].pageX, e.touches[0].pageY, TOUCH_DRAG);
  }});
  $(document).on({'mousedown': function(e) {
    if (e.button == 0) {
      event_move_start(e.pageX, e.pageY, MOUSE_DRAG);
    }
  }});

  //MID DRAG
  $(document).on({'touchmove': function(e) {
    event_move_active(e.touches[0].pageX, e.touches[0].pageY, TOUCH_DRAG);
  }});
  $(document).on({'mousemove': function(e) {
    event_move_active(e.pageX, e.pageY, MOUSE_DRAG);
  }});

  //END DRAG
  $(document).on({'touchend': function(e) {
    event_move_end(TOUCH_DRAG);
  }});
  $(document).on({'touchcancel': function(e) {
    event_move_end(TOUCH_DRAG);
  }});
  $(document).on({'mouseup': function(e) {
    if (e.button == 0) {
      event_move_end(MOUSE_DRAG);
    }
  }});

});
