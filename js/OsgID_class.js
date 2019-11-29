// OsgID_class.js
'use strict';

class OsgID {
  constructor(osgid) {
    if (osgid == null || osgid == "") {
      osgid = "OSGID=-b-C--cC--c-B-:0:00:0:0:0"; //pos turn dice zorome sc_me sc_yu
    }
    this._osgid = osgid;
    this._position = "-b-C--cC--c-B-";
    this._turn = 0;
    this._dice = "00";
    this._dice_odr = "00";
    this._dice_ary = [0, 0, 0];
    this._zorome = 0;
    this._sc_me = 0;
    this._sc_yu = 0;
    this._ptno = new Array(14);
    this._ptcol = new Array(14);
    this._pip = [0, 0];
    this._boff = [0, 0];

    this._parse_osgid(this._osgid); // OSGIDを解析
    this._parse_position(this._position); // ボード状態を解析
    this._zoromebool = (this.get_dice(1) == this.get_dice(2));
    this._usable_dice = this._setUsableDice(); //ムーブに使えるダイスリスト
    this._turnpos = ((p) => (this._turn == 1) ? p : 13 - p);
  }

  // OSGIDをパースし状態をローカル変数に格納
  _parse_osgid(osgidstr) {
    const osgidstr2 = osgidstr.substr("OSGID=".length);
    const s = osgidstr2.split(":");

    this._position= s[0];
    this._turn    = Number(s[1]);
    this._set_dice(s[2]);
    this._zorome  = Number(s[3]);
    this._sc_me   = Number(s[4]);
    this._sc_yu   = Number(s[5]);
  }

  _set_dice(dicestr) {
    this._dice = dicestr;
    // dice_odrはダイスを昇順にして保持する
    const dice1 = dicestr.substr(0,1);
    const dice2 = dicestr.substr(1,1);
    if (dice1 > dice2) { this._dice_odr = dice2 + dice1; }
    this._dice_ary = [0, parseInt(dice1), parseInt(dice2)];
    this._dbloffer = false;
    this._zoromebool = (dice1 == dice2);
    this._zorome  = (this._zoromebool) ? 1 : 0;
  }

  //ポジション情報をパースし状態をローカル変数に格納
  //ついでに、ピップ数とベアオフチェッカーを数えておく
  _parse_position(pt) {
    this._pip[0]  = this._pip[1]  = 0;
    this._boff[0] = this._boff[1] = 8;

    const posary = pt.split("");  // 一文字ずつに分解
    for (let i=0; i<=13; i++) {
      const asc = posary[i].charCodeAt(0);
      if (asc == "-".charCodeAt(0)) {
        this._ptno[i] = 0; this._ptcol[i] = 0;
      } else if (asc >= "a".charCodeAt(0) && asc <= "z".charCodeAt(0)) {
        this._ptno[i] = asc - "a".charCodeAt(0) + 1;
        this._ptcol[i] = -1;
        this._boff[1] -= this._ptno[i];
        this._pip[1] += this._ptno[i] * (13 - i); // ピップ数を計算
      } else if (asc >= "A".charCodeAt(0) && asc <= "Z".charCodeAt(0)) {
        this._ptno[i] = asc - "A".charCodeAt(0) + 1;
        this._ptcol[i] = 1;
        this._boff[0] -= this._ptno[i];
        this._pip[0] += this._ptno[i] * (i - 0); // ピップ数を計算
      }
    } // for
  }

  _makeOsgIDStr() {
    this._osgid = "OSGID=" +
                 this._position + ":" +
                 this._turn + ":" +
                 this._dice + ":" +
                 this._zorome + ":" +
                 this._sc_me + ":" +
                 this._sc_yu + ":" +
                 "0";
  }

  // getter functions
  get_osgidstr()  { return this._osgid; }
  get_position() { return this._position; }
  get_turn()     { return this._turn; }
  get_dice(n)    {
    if (n == 1 || n == 2) { return this._dice_ary[n]; }
    else                  { return this._dice; }
  }
  get_dice_odr() { return this._dice_odr; }
  get_sc_me()    { return this._sc_me; }
  get_sc_yu()    { return this._sc_yu; }
  get_ptno(p)    { return this._ptno[p]; }
  get_ptcol(p)   { return this._ptcol[p]; }
  get_pip(t)     { return (t == -1) ? this._pip[1] : (t == 1) ? this._pip[0] : 0; }
  get_boff(t)    { return (t == -1) ? this._boff[1] : (t == 1) ? this._boff[0] : 0; }

  //setter method
  set position(x) { this._position = x; this._makeOsgIDStr(); this._parse_position(x); }
  set turn(x)     { this._turn = x;     this._makeOsgIDStr(); }
  set dice(x)     { this._set_dice(x);  this._makeOsgIDStr(); }
  set sc_me(x)    { this._sc_me = x;    this._makeOsgIDStr(); }
  set sc_yu(x)    { this._sc_yu = x;    this._makeOsgIDStr(); }
  set usabledice(x) { this._usable_dice = this._setUsableDice(); }

  //getter method
  get osgidstr()  { return this._osgid; }
  get position() { return this._position; }
  get turn()     { return this._turn; }
  get dice()     { return this._dice; }
  get dice_odr() { return this._dice_odr; }
  get zorome()   { return this._zorome; }
  get sc_me()    { return this._sc_me; }
  get sc_yu()    { return this._sc_yu; }

  //public functions
  _incdec(chr, delta, turn) {
    const stdchar = (turn == 1) ? "A" : "a";
    const charcd = stdchar.charCodeAt(0);
    const numbfr = (chr == "-") ? 0 : chr.charCodeAt(0) - charcd + 1;
    const numaft = numbfr + delta;
    return (numaft == 0) ? "-" : String.fromCharCode(numaft + charcd - 1);
  }


  moveChequer(move) {
    const pos = this.position; //debug後削除可
    const turn = this.turn;
    const posary = this.position.split("");
    const frto = move.split("/");
    const fr = parseInt(frto[0]);
    const to = parseInt(frto[1]);
    const fpt = this._turnpos(fr);
    const tpt = this._turnpos(to);
    if (fr > to) { //normal move
      posary[fpt] = this._incdec(posary[fpt], -1, turn);
      if (to != 0) {
        posary[tpt] = this._incdec(posary[tpt], +1, turn);
      }
      this._use_dice(fr, to);
    } else { //hit move (to the bar)
      const oppo = (-1) * turn;
      const bar = this._turnpos(0);
      posary[fpt] = this._incdec(posary[fpt], -1, oppo);
      posary[bar] = this._incdec(posary[bar], +1, oppo);
    }
console.log("moveChequer", pos, move, turn, fr, to, fpt, tpt, posary.join(""));
    this.position = posary.join("");
    return this;

  }

  _use_dice(fr, to) {
    const dd = fr - to;
    const idx = this._usable_dice.findIndex(d => d == dd);
console.log("_use_dice", fr, to, dd, idx, this._usable_dice);
    if (idx != -1) {
      this._usable_dice.splice(idx, 1); //見つかればそれを削除
    } else if (dd == this._usable_dice[0] + this._usable_dice[1]) {
      this._usable_dice.splice(0, 2);   //目を組み合わせて使う
    } else if (dd == this._usable_dice[0] + this._usable_dice[1] + this._usable_dice[2]) {
      this._usable_dice.splice(0, 3);   //ゾロ目のときは前から使う
    } else if (dd == this._usable_dice[0] + this._usable_dice[1] + this._usable_dice[2] + this._usable_dice[3]) {
      this._usable_dice.splice(0, 4);
    } else if (to == 0) {
      this._usable_dice.splice(-1, 1);  //上記で使えなかったときは大きい目から使う
    }
  }

  isBlocked(p) {
    if (p == 0) { return false; }
    const pt = this._turnpos(p);
    return (this._ptno[pt] >= 2 && this._ptcol[pt] != this._turn);
  }

  isHitted(p) {
    const pt = this._turnpos(p);
    const ret =  (this._ptno[pt] == 1 && this._ptcol[pt] != this._turn);
console.log("isHitted",pt, this._turn, this._ptno[pt], this._ptcol[pt], ret);
    return ret;
  }

  isMovable(fr, to, strict=false) {
    const movable = this.movablePoint(fr, strict);
console.log("isMovable",fr, to, strict, movable);
    return movable.includes(to);
  }

  _isMovableWithDice(fr, to) {
    //オンザバーのときはそれしか動かせない
    const bar = this._turnpos(13);
    if (fr != 13 && this.get_ptno(bar) > 0) { return false; }

    //ベアオフのときはベアインしていることが必要
    if (to == 0) {
      for (let q=4; q<=13; q++) {
        const qt = this._turnpos(q);
        if (this.get_ptcol(qt) == this.turn && this.get_ptno(qt) > 0) { return false; }
      }
    }

//console.log("_isMovableWithDice", fr, to, this._usable_dice);
    let piplist = [];
    let w = 0;
    for (const d of this._usable_dice) {
      //オンザバーに2個以上あるときは、ダイスの目を組み合わせて使えない。ex.2ゾロで21ptに出られない
      if (this.get_ptno(bar) >= 2) { w  = d; }
      else                         { w += d; }
      if (!piplist.includes(d)) { piplist.push(d); }
      if (!piplist.includes(w)) { piplist.push(w); }
    }

    const f_topt = ((f, d) => (f - d < 0) ? 0 : (f - d));
    const f_existBacker = ((f) => {
      for (let q = f+1; q<13; q++) {
        const p = this._turnpos(q);
        if (this._ptcol[p] == this._turn && this._ptno[p] > 0) { return true; }
      }
      return false;
    });

    const delta = (this._zoromebool) ? 2 : 1;
    let blocked = 0;
    let movable = [];
    for (const d of piplist.sort((a, b) => a - b)) {
      const p = f_topt(fr, d); //定数関数で計算
      if (fr-d < 0 && f_existBacker(fr)) { continue; }
      if (blocked < 2 && !this.isBlocked(p)) {
         movable.push(p);
      } else {
         blocked += delta;
      }
    }
//console.log("_isMovableWithDice", movable, f_existBacker(fr));
    return movable.includes(to);
  }

  movablePoint(fr, strict=false) {
    //frの駒が進めるポイントをリストで返す(前＆ブロックポイント以外)
    //strict=trueのときは、ダイスの目に従って進めるポイントを計算する
    let movable = [];
    for (let p=0; p<fr; p++) {
      if (!this.isBlocked(p)) {
        if (strict && !this._isMovableWithDice(fr, p)) { continue; }
        movable.push(p);
      }
    }
    return movable;
  }

  moveFinished() {
//    const f_topt = ((f, d) => (f - d < 0) ? 0 : (f - d));
    if (this._usable_dice.length == 0) { return true; } //使える目がなくなった時
    for (let q=1; q<13; q++) { //動かせる先がなくなった時
      const pt = this._turnpos(q);
      if (this._ptcol[pt] != this.turn) { continue; }
      for (const d of this._usable_dice) {
//        const ds = f_topt(pt, d);
        const ds = (pt - d < 0) ? 0 : (pt - d);
        if (this.isMovable(pt, ds, true)) { return false; }
      }
    }
    return true;
  }

  _setUsableDice() {
    let usabledice = [];
    usabledice.push(this.get_dice(1));
    usabledice.push(this.get_dice(2));
    if (this._zoromebool) {
      usabledice.push(this.get_dice(1));
      usabledice.push(this.get_dice(1));
    }
    return usabledice.sort(); //ベアオフで後ろから使うように昇順にしておく
  }

  initialize(pos="--------------") {
    this.position = pos;
    this.sc_me    = 0;
    this.sc_yu    = 0;
    this.turn     = 0;
    this.dice     = "00";
  }

} //class OsgID
