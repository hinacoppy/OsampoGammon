// OsgID_class.js
'use strict';

class OsgID {
  constructor(osgid) {
    if (osgid == null || osgid == "") {
      osgid = "OSGID=-b-C--cC--c-B-:0:00:0:0:0"; //pos turn dice opt1 opt2 opt3
    }
    this._osgid = osgid;
    this._position = "-b-C--cC--c-B-";
    this._turn = 0;
    this._dice = "00";
    this._dice_odr = "00";
    this._dice_ary = [0, 0, 0];
    this._opt1 = 0;
    this._opt2 = 0;
    this._opt3 = 0;
    this._ptno = new Array(14);
    this._ptcol = new Array(14);
    this._pip = [0, 0];
    this._boff = [0, 0];

    this._parse_osgid(this._osgid); // OSGIDを解析
    this._parse_position(this._position); // ボード状態を解析
    this.zorome = (this.get_dice(1) == this.get_dice(2));
    this._usable_dice = this._setUsableDice(); //ムーブに使えるダイスリスト
    this._turnpos = ((p) => (this._turn == 1) ? p : 13 - p);
    this._topt = ((f, d) => (f - d < 0) ? 0 : (f - d));
    this._movablelist = [];
    this._movablelistdirty = true;
  }

  // OSGIDをパースし状態をローカル変数に格納
  _parse_osgid(osgidstr) {
    const osgidstr2 = osgidstr.substr("OSGID=".length);
    const s = osgidstr2.split(":");

    this._position= s[0];
    this._turn    = Number(s[1]);
    this._set_dice(s[2]);
    this._opt1    = Number(s[3]);
    this._opt2    = Number(s[4]);
    this._opt3    = Number(s[5]);
  }

  _set_dice(dicestr) {
    this._dice = dicestr;
    // dice_odrはダイスを昇順にして保持する
    const dice1 = dicestr.substr(0,1);
    const dice2 = dicestr.substr(1,1);
    if (dice1 > dice2) { this._dice_odr = dice2 + dice1; }
    this._dice_ary = [0, parseInt(dice1), parseInt(dice2)];
    this._dbloffer = false;
    this.zorome = (dice1 == dice2);
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
                 this._opt1 + ":" +
                 this._opt2 + ":" +
                 this._opt3 + ":" +
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
  get_opt1()     { return this._opt1; }
  get_opt2()     { return this._opt2; }
  get_opt3()     { return this._opt3; }
  get_ptno(p)    { return this._ptno[p]; }
  get_ptcol(p)   { return this._ptcol[p]; }
  get_pip(t)     { return (t == -1) ? this._pip[1] : (t == 1) ? this._pip[0] : 0; }
  get_boff(t)    { return (t == -1) ? this._boff[1] : (t == 1) ? this._boff[0] : 0; }

  //setter method
  set position(x) { this._position = x; this._makeOsgIDStr(); this._parse_position(x); }
  set turn(x)     { this._turn = x;     this._makeOsgIDStr(); }
  set dice(x)     { this._set_dice(x);  this._makeOsgIDStr(); }
  set opt1(x)     { this._opt1 = x;     this._makeOsgIDStr(); }
  set opt2(x)     { this._opt2 = x;     this._makeOsgIDStr(); }
  set opt3(x)     { this._opt3 = x;     this._makeOsgIDStr(); }
  set usabledice(x) { this._usable_dice = this._setUsableDice(); }

  //getter method
  get osgidstr() { return this._osgid; }
  get position() { return this._position; }
  get turn()     { return this._turn; }
  get dice()     { return this._dice; }
  get dice_odr() { return this._dice_odr; }
  get opt1()     { return this._opt1; }
  get opt2()     { return this._opt2; }
  get opt3()     { return this._opt3; }
  get movablelistlength() { return this._movablelist.length; }

//public and private(helper) functions
  _incdec(chr, delta, turn) {
    const stdchar = (turn == 1) ? "A" : "a";
    const charcd = stdchar.charCodeAt(0);
    const numbfr = (chr == "-") ? 0 : chr.charCodeAt(0) - charcd + 1;
    const numaft = numbfr + delta;
    return (numaft == 0) ? "-" : String.fromCharCode(numaft + charcd - 1);
  }

  moveChequer(move) {
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
    this.position = posary.join("");
    return this;
  }

  _use_dice(fr, to) {
    const dd = fr - to;
    const idx = this._usable_dice.findIndex(d => d == dd);
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
    this._movablelistdirty = true;
  }

  isBlocked(p) {
    if (p == 0) { return false; }
    const pt = this._turnpos(p);
    return (this._ptno[pt] >= 2 && this._ptcol[pt] != this._turn);
  }

  isHitted(p) {
    if (p == 0) { return false; }
    const pt = this._turnpos(p);
    return (this._ptno[pt] == 1 && this._ptcol[pt] != this._turn);
  }

  existMyChequer(p) {
    const pt = this._turnpos(p);
    return (this._ptno[pt]  > 0 && this._ptcol[pt] == this._turn);
  }

  isMovable(fr, to, strict=true) {
    const movable = this.movablePoint(fr, strict);
    return movable.includes(to);
  }

  makeMovableList() {
    if (!this._movablelistdirty) { return; } //新しいポジションのときだけ、リストを作り直す
    this._movablelistdirty = false;
    const piplist = this._dicePipList();
    this._makeMovableList_step1(); //盤面から動かせる駒のリストを作る
    if (piplist.length == 3 && !this.zorome) { //下記チェックはダイス目が2つ使えるときのみ
      this._useBiggerPip(); //片方の目しか使えないときは大きい目を使う
      this._useBothPip(); //目を組み合わせて使えるときは両方を使わなければならない
    }
  }

  _makeMovableList_step1() {
    //盤面から動かせる駒のリストを作る
    this._movablelist.length = 0;
    const piplist = this._dicePipList();
    const bar = 13;
    for (let fr = 1; fr <= bar; fr++) {
      if (!this.existMyChequer(fr)) { continue; }

      const blockoffset = (this.zorome) ? 2 : 1;
      let blocked = 0;
      let piplistidx = 0;
      for (const pip of piplist) {
        const to = this._topt(fr, pip); //ムーブ先を計算

        const diceodr = (this.zorome || piplistidx == 0) ? piplistidx + 1 : piplistidx;
        piplistidx += 1;

        if (blocked >= 2) { continue; }
        //ブロックポイントの先とヒットポイントの先にはダイスの目を組み合わせて進めない

        if (this.isBlocked(to)) {
          blocked += blockoffset;
          continue; //ブロックポイントには進めない
          //23で、2も3もブロックされているときは5に進めないよう制御変数(blocked)をセット
        }
        if (this.isHitted(to)) {
          blocked += blockoffset;
          //ヒットポイントには進めるが、ダイスの目を組み合わせる先には進めないよう制御変数をセット
          //ex. 44で、4にブロットがあるとき、ヒットせずに8には進めない
        }
        if (to == 0) {
          if (!this._isBearIn()) { continue; } //ベアインしていないときはベアオフできない
          if (fr - pip < 0) { //目を余らせてベアオフするときは
            if (this._existBacker(fr)) { continue; } //後ろに駒がないこと
            if (diceodr >= 2) { continue; } //ダイスの目を組み合わせて進めない
          }
        }

        this._movablelist.push([fr, to, pip, diceodr]);
      }
    }
  }

  _useBiggerPip() {
  //片方の目しか使えないときは大きい目を使うよう、使えないリストを削除
    if (this._movablelist.length < 2) { return; } //動かせる先が一つなら確認不要
    const lesserdice = this._usable_dice[0];
    if (this._movablelist.every(mov => mov[2] == lesserdice)) { return; } //小さい目のみのときは確認不要
    let delary = [];
    for (let idx = 0; idx < this._movablelist.length; idx++) {
      const mov = this._movablelist[idx];
      if (mov[3] != 1) { continue; } //目の組み合わせのときはスキップ
      let xgidwork = new OsgID(this.osgidstr);
      xgidwork = xgidwork.moveChequer(mov[0] + "/" + mov[1]); //次の一手を動かしてみる
      xgidwork._makeMovableList_step1(); //次に動かせる手があるかどうかを確認
      if (xgidwork.movablelistlength != 0) { continue; }//次の手があれば削除候補ではない
      if (mov[2] == lesserdice) { delary.push(idx); } //小さい目なら削除候補
    }
    for (let idx = delary.length -1; idx >= 0; idx--) {//spliceの破壊的処理のため、降順で実行
      this._movablelist.splice(delary[idx], 1); //削除候補にマークされたものを削除
    }
  }

  _useBothPip() {
  //目を組み合わせて使えるときは両方を使わなければならないよう、使えないリストを削除
    let nextmove = [];
    for (const mov of this._movablelist) {
      if (mov[3] != 1) { nextmove.push(9); continue; } //目の組み合わせのときはリストを残す
      let xgidwork = new OsgID(this.osgidstr);
      xgidwork = xgidwork.moveChequer(mov[0] + "/" + mov[1]); //次の一手を動かしてみる
      xgidwork._makeMovableList_step1(); //次に動かせる手があるかどうかを確認
      nextmove.push(xgidwork.movablelistlength); //1以上ならまだ動かせる。0ならそこで行き止まり
    }
    if (Math.max(...nextmove) == 0) { return; } //目を組み合わせて使う駒が一つもなければ、全て残す
    for (let idx = 0; idx < nextmove.length; idx++) {
      if (nextmove[idx] == 0) {
        this._movablelist.splice(idx,1); //組み合わせで使えないムーブを削除
      }
    }
  }

  _dicePipList() {
    const bar = this._turnpos(13);
    let piplist = [];
    let w = 0;
    for (const d of this._usable_dice) {
      //オンザバーに2個以上あるときは、ダイスの目を組み合わせて使えない。ex.41で20ptに出られない
      if (this._ptno[bar] >= 2) { w  = d; }
      else                      { w += d; }
      if (!piplist.includes(d)) { piplist.push(d); }
      if (!piplist.includes(w)) { piplist.push(w); }
    }
    return piplist.sort((a, b) => a - b);
  }

  _isBearIn() {
    for (let q = 4; q <= 13; q++) {
      if (this.existMyChequer(q)) { return false; }
    }
    return true;
  }

  _existBacker(f) {
    for (let q = f+1; q <= 13; q++) {
      if (this.existMyChequer(q)) { return true; }
    }
    return false;
  }

  movablePoint(fr, strict=true) {
    //frの駒が進めるポイントをリストで返す
    //ダイスの目に従うかどうか(strict)で処理を分ける
    if (strict) { return this._movePointStrict(fr); }
    else        { return this._movePointNonStrict(fr); }
  }

  _movePointNonStrict(fr) {
    //ダイスの目に従わない(strict=false)で、frの駒が進めるポイントをリストで返す
    const bar = 13;
    let movable = [];
    for (let to = 0; to < fr; to++) {
      if (this.existMyChequer(bar) && fr != bar) { continue; } //オンザバーのときはそれしか動かせない
      if (to == 0 && !this._isBearIn()) { continue; } //ベアオフのときはベアインしていることが必要
      if (this.isBlocked(to)) { continue; } //ブロックポイントには進めない
      //if (to == 0 && this._existBacker(fr)) { continue; } //目を余らせてベアオフのときは後ろに駒がないこと
      movable.push(to);
    }
    return movable;
  }

  _movePointStrict(fr) {
    //ダイスの目に従う(strict=true)で、frの駒が進めるポイントをリストで返す
    const bar = 13;
    let movable = [];
    this.makeMovableList();
    for (const movinfo of this._movablelist) {
      if (fr != movinfo[0]) { continue; } //動かすポイントでない場合はスキップ
      if (this.existMyChequer(bar) && fr != bar) { continue; } //オンザバーのときはそれしか動かせない
      movable.push(movinfo[1]);
    }
    return movable;
  }

  moveFinished() {
    const bar = 13;
    if (this._usable_dice.length == 0) { return true; } //使える目がなくなった時
    for (let q = 1; q <= bar; q++) {
      if (!this.existMyChequer(q)) { continue; } //自駒のある所から
      const movlist = this.movablePoint(q, true); //動かせる先がまだあれば false
      if (movlist.length != 0) { return false; }
    }
    return true; //全く動かせる先がなければtrue
  }

  _setUsableDice() {
    let usabledice = [];
    usabledice.push(this.get_dice(1));
    usabledice.push(this.get_dice(2));
    if (this.zorome) {
      usabledice.push(this.get_dice(1));
      usabledice.push(this.get_dice(1));
    }
    this._movablelistdirty = true;
    return usabledice.sort(); //ベアオフで後ろから使うように昇順にしておく
  }

} //class OsgID
