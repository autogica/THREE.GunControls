/**
 * @author jbilcke
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.GunRemote = function(object) {

  var scope = this;

  this.onchange = function() {

  };

  this.ts = +(new Date());
  this.t = 0;
  //this.t = 0;

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
  var filter1 = function(x, y) {
    return Math.round(y * x) / y;
  }
  var filter2 = function(x, y) {
    //return x;
    return (Math.abs(x) < y) ? 0 : (x > 0) ? x - y : x + y;
  }
  var colorify = function(x, y) {
    return (x > 0) ? "<span class='green'>" + x + "</span>" : "<span class='red'>" + x + "</span>";
  }



  var isMobile = {
    Android: (function() {
      return /Android/i.test(navigator.userAgent);
    })(),
    BlackBerry: (function() {
      return /BlackBerry/i.test(navigator.userAgent);
    })(),
    iOS: (function() {
      return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    })(),
    Windows: (function() {
      return /IEMobile/i.test(navigator.userAgent);
    })()
  };

  //this.onupdate = function() {};

  var onDeviceOrientationChangeEvent = function(event) {
    scope.rotation.alpha = event.alpha;
    scope.rotation.beta = event.beta;
    scope.rotation.gamma = event.gamma;
  };



  var onScreenOrientationChangeEvent = function() {
    scope.orientation = window.orientation || 0;
  };


  var onDeviceMotionChangeEvent = function(event) {
    scope.acceleration.x = event.acceleration.x;
    scope.acceleration.y = event.acceleration.y;
    scope.acceleration.z = event.acceleration.z;

    var ts = +(new Date());
    var t = filter1((ts - scope.ts) * 0.001, 1000); // time in seconds, elapsed since latest update of acceleration
    scope.ts = ts;
    scope.t = t;

    scope.accelerationIncludingGravity = event.accelerationIncludingGravity;
    scope.rotationRate = event.rotationRate;

    $("#debug").html(
      "alpha: " + colorify(scope.rotation.alpha) + "<br/>" +
      "beta: " + colorify(scope.rotation.beta) + "<br/>" +
      "gamma: " + colorify(scope.rotation.gamma)
    )

    var alpha =  scope.rotation.alpha;
    var beta =  scope.rotation.beta;
    var gamma =  scope.rotation.gamma;

    if (isMobile.Android) {
      gamma *= 2;
      beta *= 2;
      alpha = scope.rotation.alpha;
      gamma = scope.rotation.beta; // rouge
      beta = - scope.rotation.gamma; // ?
      // TODO: apply a rotation to make it even with the iPhone

    }
    scope.onchange({
      t: scope.t,
      rotation: {
        alpha: alpha,
        beta: beta,
        gamma: gamma
      },
      orientation: scope.orientation,
      acceleration: {
        x: scope.acceleration.x,
        y: scope.acceleration.y,
        z: scope.acceleration.z
      }
    });
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
      //kalman: scope.kalman(), // snapshot from kalman
      //accelerationKalman: scope.accelerationKalman,
    };

    return res;

  };


  this.connect();

};
