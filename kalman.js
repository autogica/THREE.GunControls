// === Kalman ===
// Kalman filter for Javascript
// Copyright (c) 2012 Itamar Weiss
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

var Kalman = {
  version: '0.0.1'
};

KalmanModel = (function(){

  function KalmanModel(x_0, P_0, F_k, B_k, Q_k){
    this.x_k  = x_0;
    this.P_k  = P_0;
    this.F_k  = F_k;
    this.B_k  = B_k;
    this.Q_k  = Q_k;
  }

  KalmanModel.prototype.predict =  function(u_k){
    this.x_k_ = this.x_k;
    this.P_k_ = this.P_k;

    //Predict
    // this.x_k_k_ = this.F_k.x(this.x_k_).add(this.B_k.x(u_k));
    this.x_k = this.F_k.x(this.x_k_).add(this.B_k.x(u_k));
    // this.P_k_k_ =
    //    this.F_k.x(this.P_k_.x(this.F_k.transpose())).add(this.Q_k);
    this.P_k = this.F_k.x(this.P_k_.x(this.F_k.transpose())).add(this.Q_k);
  }

  KalmanModel.prototype.update =  function(o){
    this.I = Matrix.I(this.P_k.rows());

    /* init */

    this.x_k_ = this.x_k;
    this.P_k_ = this.P_k;

    /* update */

    //observation residual
    this.y_k = o.z_k.subtract(o.H_k.x(this.x_k_));

    //residual covariance
    this.S_k = o.H_k.x(this.P_k_.x(o.H_k.transpose())).add(o.R_k);

    //Optimal Kalman gain
    this.K_k = this.P_k_.x(o.H_k.transpose().x(this.S_k.inverse()));
    this.x_k = this.x_k_.add(this.K_k.x(this.y_k));
    this.P_k = this.I.subtract(this.K_k.x(o.H_k)).x(this.P_k_);
  }

  return KalmanModel;
})();

KalmanObservation = (function(){

  function KalmanObservation(z_k,H_k,R_k){
    this.z_k = z_k;//observation
    this.H_k = H_k;//observation model
    this.R_k = R_k;//observation noise covariance
  }
  return KalmanObservation;
})();
/*
KalmanPrediction = (function(){

  function KalmanPrediction(u_k){
    this.u_k = u_k;//input
  }

  return KalmanPrediction;
})();
*/


function KalmanFactory( ) {

  var x_0 = $V([0,0,0]); //vector. Initial accelerometer values

  //P prior knowledge of state
  var P_0 = $M([
                [1,0,0],
                [0,1,0],
                [0,0,1]
              ]); //identity matrix. Initial covariance. Set to 1
  var F_k = $M([
                [1,0,0],
                [0,1,0],
                [0,0,1]
              ]); //identity matrix. How change to model is applied. Set to 1
  var Q_k = $M([
                [0,0,0],
                [0,0,0],
                [0,0,0]
              ]); //empty matrix. Noise in system is zero

  var KM = new KalmanModel(x_0,P_0,F_k,Q_k);

  var z_k = $V([0,0,0]); //Updated accelerometer values
  var H_k = $M([
                [1,0,0],
                [0,1,0],
                [0,0,1]
              ]); //identity matrix. Describes relationship between model and observation
  var R_k = $M([
                [2,0,0],
                [0,2,0],
                [0,0,2]
              ]); //2x Scalar matrix. Describes noise from sensor. Set to 2 to begin
  var KO = new KalmanObservation(z_k,H_k,R_k);
  return function(obj) {
      if (typeof obj !== "undefined") {
        KO.z_k = $V([obj.x, obj.y, obj.z]);
        KM.update(KO);
      }
      return {
        x: KM.x_k.elements[0],
        y: KM.x_k.elements[1],
        z: KM.x_k.elements[2]
      }
  };
}
