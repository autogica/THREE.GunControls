/**
 * @author jbilcke
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.GunRemote = function(object) {

  var scope = this;

  this.enabled = true;

  this.rotation = {
    alpha: 0,
    beta: 0,
    gamma: 0
  };
  this.orientation = 0;
  this.acceleration = {
    x: 0,
    y: 0,
    z: 0
  };
  this.accelerationIncludingGravity = {
    x: 0,
    y: 0,
    z: 0
  };
  this.rotationRate = {
    alpha: 0,
    beta: 0,
    gamma: 0
  };


  this.kalman = KalmanFactory();
  this.accelerationKalman = {
    x: 0,
    y: 0,
    z: 0
  };

  //this.onupdate = function() {};

  var onDeviceOrientationChangeEvent = function(event) {

    scope.rotation.alpha = event.alpha;
    scope.rotation.beta = event.beta;
    scope.rotation.gamma = event.gamma;
    //scope.onupdate(scope.read());
  };

  var onScreenOrientationChangeEvent = function() {

    scope.orientation = window.orientation || 0;
    //scope.onupdate(scope.read());
  };

  var onDeviceMotionChangeEvent = function(event) {
    //scope.acceleration.x += event.acceleration.x;
    //scope.acceleration.y += event.acceleration.y;
    //scope.acceleration.z += event.acceleration.z;

    // feed the Kalman
    var kalman = scope.kalman(event.acceleration);
    scope.accelerationKalman.x += kalman.x;
    scope.accelerationKalman.y += kalman.y;
    scope.accelerationKalman.z += kalman.z;

    // TODO we should instead integrate the accelerations,
    // transform them into X, Y, Z deltas
    //
    scope.acceleration.x += event.acceleration.x;
    scope.acceleration.y += event.acceleration.y;
    scope.acceleration.z += event.acceleration.z;

    // TODO we should take the time into account
    //http://physics.stackexchange.com/questions/36312/calculation-of-distance-from-measured-acceleration-vs-time
    //var vel_x = previous_vel_x + (1)*(previous_acc_x+acc_x)/2

    // =D2+(previous_acc_x - acc_x)*(previous_vel_x+vel_x)/2

    scope.accelerationIncludingGravity = event.accelerationIncludingGravity;
    scope.rotationRate = event.rotationRate;
  }

  this.connect = function() {

    onScreenOrientationChangeEvent(); // run once on load

    window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);
    window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
    window.addEventListener('devicemotion', onDeviceMotionChangeEvent, false);
    // TODO: add touch
    scope.enabled = true;

  };

  this.disconnect = function() {

    window.removeEventListener('orientationchange', onScreenOrientationChangeEvent, false);
    window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
    window.removeEventListener('devicemotion', onDeviceMotionChangeEvent, false);

    scope.enabled = false;

  };

  this.read = function() {

    var res = {
      rotation: {
        alpha: scope.rotation.alpha,
        beta: scope.rotation.beta,
        gamma: scope.rotation.gamma
      },
      orientation: scope.orientation,
      acceleration: {
        x: scope.acceleration.x,
        y: scope.acceleration.y,
        z: scope.acceleration.z
      },
      accelerationIncludingGravity: {
        x: scope.accelerationIncludingGravity.x,
        y: scope.accelerationIncludingGravity.y,
        z: scope.accelerationIncludingGravity.z
      },
      kalman: scope.kalman(), // snapshot from kalman
      accelerationKalman: scope.accelerationKalman
    };
    // empty buffer
    scope.acceleration.x = 0;
    scope.acceleration.y = 0;
    scope.acceleration.z = 0;
    scope.accelerationKalman.x = 0;
    scope.accelerationKalman.y = 0;
    scope.accelerationKalman.z = 0;
    return res;

  };


  this.connect();

};
