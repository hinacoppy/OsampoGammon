// OsgBoard_class.js
'use strict';

class OsgBoard {
  constructor(game) {
    this.gameObj = game;
    this.mainBoard = $('#board'); //need to define before bgBoardConfig()
    this.bgBoardConfig();
    this.setDomNameAndStyle();
  } //end of constructor()

  setDomNameAndStyle() {
    //dice
    this.dice = [[],[$('#dice10'),$('#dice11')],[$('#dice20'),$('#dice21')]];
    this.dice[1][0].css(this.getPosObj(this.dice10X, this.dice1Y));
    this.dice[1][1].css(this.getPosObj(this.dice11X, this.dice1Y));
    this.dice[2][0].css(this.getPosObj(this.dice20X, this.dice2Y));
    this.dice[2][1].css(this.getPosObj(this.dice21X, this.dice2Y));

    //dicepool
    $("#dicepool1").css(this.getPosObj(this.dice10X - 30, this.dice1Y -10));
    $("#dicepool2").css(this.getPosObj(this.dice20X - 30, this.dice2Y -10));

    //point
    this.point = [];
    for (let i = 0; i < 16; i++) {
      this.point[i] = $('#pt' + i);
      this.point[i].css(this.getPosObj(this.pointX[i], this.pointY[i]));
    }
    this.pointAll = $(".point,.goal");

    //Chequer
    this.chequer = [[],[],[]];
    for (let j = 1; j <= 2; j++) {
      for (let i = 0; i < 8; i++) {
        this.chequer[j][i] = new Chequer(j, i);
        this.chequer[j][i].set_jQueryDom();
      }
    }
  }

  showBoard2(xg) { // input for XGID object
    this.xgidstr = xg.xgidstr;
    if (xg.get_boff(0) < 0 || xg.get_boff(1) < 0) {
      alert("Invalid XGID!!\n" + xg.xgidstr + "\nbearoff(0)=" + xg.get_boff(0) + "\nbearoff(1)=" + xg.get_boff(1));
    }
    this.showPosition(xg);
    this.showDiceAll(xg.get_turn(), xg.get_dice(1), xg.get_dice(2));
  }

  showDiceAll(turn, d1, d2) {
    switch( OsgUtil.cvtTurnXg2Bd(turn) ) {
    case 0:
      this.showDice(1, d1, 0);
      this.showDice(2, d2, 0);
      break;
    case 1:
      this.showDice(1, d1, d2);
      this.showDice(2, 0,  0);
      break;
    case 2:
      this.showDice(1, 0,  0);
      this.showDice(2, d1, d2);
      break;
    }
  }

  showDice(turn, d0, d1) {
    const dicepip = {0:"fa-square", 1:"fa-dice-one", 2:"fa-dice-two", 3:"fa-dice-three"};
    const diceclasses = "fa-dice-one fa-dice-two fa-dice-three";
    this.dice[turn][0].children(".diceface").removeClass(diceclasses).addClass(dicepip[d0]);
    this.dice[turn][1].children(".diceface").removeClass(diceclasses).addClass(dicepip[d1]);
    (d0 == 0) ? this.dice[turn][0].hide() : this.dice[turn][0].show();
    (d1 == 0) ? this.dice[turn][1].hide() : this.dice[turn][1].show();
  }

  showPosition(xg) {
    let piecePointer = [0, 0, 0];
    for (let pt = 0; pt <= 13; pt++) {
      const num = xg.get_ptno(pt);
      const player = OsgUtil.cvtTurnXg2Bd(xg.get_ptcol(pt));
      for (let j = 0; j < num; j++) {
        this.chequer[player][piecePointer[player]].point = pt;
        this.chequer[player][piecePointer[player]].stack = num;
        piecePointer[player] += 1;
      }
    }

    // now move any unused pieces to the off tray
    for (let player = 1; player <= 2; player++) {
      for (let i = piecePointer[player]; i < 8; i++) {
        const pt = (player == 1) ? 14 : 15;
        this.chequer[player][i].point = pt;
        this.chequer[player][i].stack = 8 - piecePointer[player];
      }
    }

    let ex, ey;
    let ptStack = Array(16);
    ptStack.fill(0);
    for (let player = 1; player <= 2; player++) {
      for (let i = 0; i < 8; i++) {
        const pt = this.chequer[player][i].point;
//        const st = this.chequer[player][i].stack;

        if (pt == 14 || pt == 15) { //bear off
          const relativeY = [2, 3, 1, 4, 2.5, 3.5, 1.5, 4.5];
          ex = ((ptStack[pt] < 4) ? this.pointX[pt] : this.pointX[pt] + 4 * this.vw) + 1 * this.vw;
          ey = this.pointY[pt] + (relativeY[ptStack[pt]] * this.pieceHeight);
        } else if (pt == 0 || pt == 13) { //on the bar
          const relativeY = [1, 0.2, 2, 2.3, 2.7, 1.5, 0.5, 2.8];
          ex = ((ptStack[pt] % 2 == 0) ? this.pointX[pt]  : this.pointX[pt] + 4 * this.vw) + 1 * this.vw;
          ey = this.pointY[pt] + (relativeY[ptStack[pt]] * this.pieceHeight);
        } else { //in field
          const relativeY = [3,4,2,5,1,6,0,7];
          ex = this.pointX[pt];
          ey = this.pointY[pt] + (relativeY[ptStack[pt]] * this.pieceHeight);
        }
        ptStack[pt] += 1;
        const position = this.getPosObj(ex, ey);
        const zindex = 10 + ptStack[pt];
        this.chequer[player][i].position = position;
//        this.chequer[player][i].zindex = zindex;
        this.chequer[player][i].dom.css(position).css("z-index", zindex);
      }
    }

  }

  animateDice(msec) {
    const diceanimclass = "faa-shake animated"; //ダイスを揺らすアニメーション
    this.dice[1][0].addClass(diceanimclass);
    this.dice[1][1].addClass(diceanimclass);
    this.dice[2][0].addClass(diceanimclass); //見せないダイスも一緒に揺らす
    this.dice[2][1].addClass(diceanimclass);

    const defer = $.Deferred(); //deferオブジェクトからpromiseを作る
    setTimeout(() => { //msec秒待ってアニメーションを止める
      this.dice[1][0].removeClass(diceanimclass);
      this.dice[1][1].removeClass(diceanimclass);
      this.dice[2][0].removeClass(diceanimclass);
      this.dice[2][1].removeClass(diceanimclass);
      defer.resolve();
    }, msec);

    return defer.promise();
  }


  bgBoardConfig() {
    this.mainBoardHeight = this.mainBoard.height()
    this.mainBoardWidth = this.mainBoard.width()
    this.vw = this.mainBoardWidth / 100;
    this.vh = this.mainBoardHeight / 100;

//    this.pieceWidth = 5 * this.vw; // equal to width in css
    this.pieceHeight = 8 * this.vh;
    this.boffHeight  = 50 * this.vh; //equal to .goal height in css
    this.boffWidth   = 11 * this.vw; //equal to .goal width in css
    this.pointHeight = 60 * this.vh; //equal to .point height in css
    this.pointWidth  =  6 * this.vw; //equal to .point width in css

console.log("bgBoardConfig", this.mainBoardWidth, this.vw, this.pointWidth);

    this.pointX = [ 1, 14, 20, 26, 32, 38, 44, 50, 56, 62, 68, 74, 80, 87,  1, 87];
    this.pointY = [10, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 60, 45,  5];
    for (let i=0; i< this.pointX.length; i++) {
      this.pointX[i] *= this.vw;
    }
    for (let i=0; i< this.pointY.length; i++) {
      this.pointY[i] *= this.vh;
    }

    this.diceSize = 5 * this.vw ; // = 5vw equal to width in css
    this.dice1Y = 85 * this.vh;
    this.dice2Y =  5 * this.vh;
    this.dice10X = this.pointX[10];
    this.dice11X = this.pointX[11];
    this.dice20X = this.pointX[2];
    this.dice21X = this.pointX[3];

  }

  getVw() {
    return this.vw;
  }
  getVh() {
    return this.vh;
  }

  getPosObj(x, y) {
    return {left:x, top:y}
  }

  getBarPos(player) {
    const barpt = (player == 1) ? 13 : 0;
    return this.getPosObj(this.pointX[barpt] + 3 * this.vw, this.pointY[barpt] + 15 * this.vh);
    //上記マジックナンバーは、cssの .pool の真ん中を返すよう設定 3vw = 7vw/2, 15vh = 30vh/2
  }


  getDragEndPoint(pos, player) {
    const ptt = Math.floor((pos.left - 8 * this.vw) / this.pointWidth + 0.5);
    const py = Math.floor(pos.top + 20);
    let pt;
    if (ptt <=  0) { pt = 14; }
    else if (ptt >= 13) { pt = 15; }
    else if (ptt >=1 && ptt <= 12) { pt = (player == 1) ? ptt : 13 - ptt; }
    else { pt = 99; }
    const ph = (ptt >= 1 && ptt <= 12) ? this.pointHeight : this.boffHeight;

    let ret;
    if (pt < 0 || pt > 15) { ret = 999; }
    if (py >= this.pointY[pt] && py < this.pointY[pt] + ph) {
      ret = pt;
    } else {
      ret = 99;
    }
console.log("getDragEndPoint", pos, ph, py, pt, player, pt, ret);
    return ret;
//    if (pt < 0 || pt > 13) { return 99; }
//    return (py >= this.pointY[pt] && py < this.pointY[pt] + ph) ? pt : 99;
  }

  getDragStartPoint(id, player) {
    const chker = this.chequer[player].find(elem => elem.domid == id);
    const pt = chker.point;
    const p = (player == 1) ? pt : 13 - pt;
console.log("getDragStartPoint", id, player, pt, p);
    return p;
  }

  getChequerOnDragging(pt, player) {
    const chker = this.chequer[player].find(elem => elem.point == pt);
console.log("getChequerOnDragging", pt, player, chker);
    return chker;
  }

  getChequerHitted(ptt, player) {
    const pt = (player == 1) ? 13 - ptt : ptt;
    const chker = this.chequer[player].find(elem => elem.point == pt);
console.log("getOppoChequerAndGotoBar", ptt, pt, player, chker);
    return chker;
  }

  flashOnMovablePoint(destpt, player) {
    for (const dp of destpt) {
      this.point[dp].toggleClass("flash", true);
    }
  }

  flashOffMovablePoint() {
    this.pointAll.removeClass("flash");
  }

} //class OsgBoard
