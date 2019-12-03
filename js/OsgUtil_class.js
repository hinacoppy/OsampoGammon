// OsgUtil_class.js
'use strict';

class OsgUtil {
  //constructor() {} // no constructor

  static cvtTurnXg2Bd(t) { //cvt Xgid turn to Board turn
    const hash = { "0":0, "1":1, "-1":2 };
    return hash[t];
  }

  static cvtTurnBd2Xg(t) { //cvt Board turn to Xgid turn
    const hash = { "0":0, "1":1, "2":-1 };
    return hash[t];
  }

  static cvtTurnGm2Bd(t) { //cvt Game turn to Board turn
    return (t) ? 1 : 2;
  }

  static cvtTurnBd2Gm(t) { //cvt Board turn to Game turn
    const hash = { "0":null, "1":true, "2":false };
    return hash[t];
  }

  static cvtTurnGm2Xg(t) { //cvt Game turn to Xgid turn
    return (t) ? 1 : -1;
  }

  static cvtTurnXg2Gm(t) { //cvt Xgid turn to Game turn
    const hash = { "0":null, "1":true, "-1":false };
    return hash[t];
  }

  //UserAgentを確認し、iOSか否かを判断する
  static isIOS() {
    const ua = window.navigator.userAgent.toLowerCase();
    return (ua.indexOf('iphone') !== -1 || ua.indexOf('ipod') !== -1 || ua.indexOf('ipad') !== -1);
  }

  static sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  static randomdice3(openroll = false) {
    const random3 = (() => Math.floor( Math.random() * 3 ) + 1);
    const d1 = random3();
    let   d2 = random3();
    if (openroll) { //オープニングロールでは同じ目を出さない
      while (d1 == d2) {
        d2 = random3();
      }
    }
    const dicestr = String(d1) + String(d2);
    return [d1, d2, dicestr];
  }

} //class OsgUtil
