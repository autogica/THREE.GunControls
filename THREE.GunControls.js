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
  this.kalman = {
    x: 0,
    y: 0,
    z: 0
  };


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

    var alpha = THREE.Math.degToRad(scope.rotation.alpha); // Z
    var beta = THREE.Math.degToRad(scope.rotation.beta); // X'
    var gamma = THREE.Math.degToRad(scope.rotation.gamma); // Y''
    var orient = THREE.Math.degToRad(scope.orientation); // O

    //scope.object.position.z +=  (Math.round(10 * scope.acceleration.x) / 10);
    //scope.object.position.x += sth.round(10 * scope.acceleration.y) / 10);
    //scope.object.position.y -= (10 * scope.acceleration.z);

    //scope.object.position.z +=  (Math.round(10 * scope.acceleration.x) / 10);
    //scope.object.position.x += sth.round(10 * scope.acceleration.y) / 10);
    //scope.object.position.y -= (10 * scope.acceleration.z);

    setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient);


    //scope.acceleration.x = 0;
    //scope.acceleration.y = 0;
    //scope.acceleration.z = 0;

  };

  this.write = function(data) {
    scope.orientation = data.orientation;
    scope.rotation = data.rotation;
    scope.acceleration = data.acceleration;
    scope.kalman = data.kalman;
  }

  this.connect();

};
