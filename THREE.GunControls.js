/**
 * @author jbilcke
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */


THREE.GunControls = function(object) {

  var scope = this;

  this.object = object;
  this.object.rotation.reorder("YXZ");

  this.enabled = true;

  this.velocity = { x: 0, y: 0, z: 0 };
  //this.position = { x: 0, y: 0, z: 0 };

  this.events = [];
  var filter1 = function(x,y) {
    return Math.round(y * x) / y;
  }
  var filter2 = function(x,y) {
    //return x;
    return (Math.abs(x) < y) ? 0 : (x > 0) ? x - y : x + y;
  }
  // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

  var setObjectQuaternion = function() {

    var zee = new THREE.Vector3(0, 0, 1);

    var euler = new THREE.Euler();

    var q0 = new THREE.Quaternion();

    var q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

    return function(quaternion, alpha, beta, gamma, orient) {

      euler.set(beta, alpha, -gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us

      quaternion.setFromEuler(euler); // orient the device

      quaternion.multiply(q1); // camera looks out the back of the device, not the top

      quaternion.multiply(q0.setFromAxisAngle(zee, -orient)); // adjust for screen orientation

    }

  }();

  this.connect = function() {

    scope.enabled = true;

  };

  this.disconnect = function() {

    scope.enabled = false;

  };

  this.update = function() {

    if (scope.enabled === false) return;

    var alpha = 0, beta = 0, gamma = 0,
       orient = 0,
       ax = 0, ay = 0, az = 0,
       vx = 0, vy = 0, vz = 0,
       dx = 0, xy = 0, xz = 0;


    for (var i = 0; i < scope.events.length; i++) {
      var event = scope.events[i];
       alpha  = THREE.Math.degToRad(event.rotation.alpha); // Z
       beta   = THREE.Math.degToRad(event.rotation.beta); // X'
       gamma  = THREE.Math.degToRad(event.rotation.gamma); // Y''
       orient = THREE.Math.degToRad(event.orientation); // O

       setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient);

       scope.velocity.x = scope.velocity.x + filter2(event.acceleration.x * event.t, 0.006);
       scope.velocity.y = scope.velocity.y + filter2(event.acceleration.y * event.t, 0.006),
       scope.velocity.z = scope.velocity.z + filter2(event.acceleration.z * event.t, 0.006)

       scope.object.translateY(100 * filter2(scope.velocity.y * event.t, 0.006));
       scope.object.translateX(100 * filter2(scope.velocity.x * event.t, 0.006)),
       scope.object.translateZ(100 * filter2(scope.velocity.z * event.t, 0.006));

       scope.object.updateMatrix();
    }
    scope.events = [];

    // drag
    scope.velocity.x *= 0.5;
    scope.velocity.y *= 0.5;
    scope.velocity.z *= 0.5;
  };

  this.write = function(events) {
    for (var i = 0; i < events.length; i++) {
      scope.events.push(events[i]);
    }
  }

  this.connect();

};
