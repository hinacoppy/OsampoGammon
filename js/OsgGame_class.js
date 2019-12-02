// OsgGame_class.js
'use strict';

class OsgGame {
  constructor() {
    this.player = true; //true=player1, false=player2
    this.osgid = new OsgID();
    this.board = new OsgBoard(this);
    this.undoStack = [];

    this.setDomNames();
    this.setEventHandler();
    this.setChequerDraggable();
    this.flashflg = true;
    this.outerDragFlag = false; //駒でない部分をタップしてドラッグを始めたら true
    this.beginNewGame(); //新規ゲームを始める
  } //end of constructor()

  setDomNames() {
    //button
    this.rollbtn     = $("#rollbtn");
    this.resignbtn   = $("#resignbtn");
    this.donebtn     = $("#donebtn");
    this.undobtn     = $("#undobtn");
    this.newgamebtn  = $("#newgamebtn");
    this.cancelbtn   = $("#cancelbtn");
    this.openrollbtn = $("#openingroll");
    this.nextgamebtn  = $("#nextgamebtn");
    this.settingbtn  = $("#settingbtn");
    this.pointTriangle = $(".point");

    //panel
    this.panelholder  = $("#panelholder");
    this.allpanel     = $(".panel,#undobtn,#donebtn,#rollbtn");
    this.youfirst     = $("#youfirst");
    this.doneundo     = $("#doneundo");
    this.gameend      = $("#gameend");
    this.splash       = $("#splash");
    this.hideAllPanel(); //font awesome が描画するのを待つ必要がある
    this.panelholder.show();
    //settings and valiables
    this.settings    = $("#settings");

    //chequer
    this.chequerall = $(".chequer");
  }

  setEventHandler() {
    //Button Click Event
    this.openrollbtn.on('click', () => { this.rollAction(true); });
    this.rollbtn.    on('click', () => { this.rollAction(false); });
    this.donebtn.    on('click', () => { this.doneAction(); });
    this.undobtn.    on('click', () => { this.undoAction(); });
    this.nextgamebtn.on('click', () => { this.nextGameAction(); });

    //設定画面
    this.settingbtn.on('click', () => { this.settings.slideToggle("normal"); });
    this.resignbtn. on('click', () => { //for DEBUG
      this.settings.slideToggle("normal");
      this.swapTurn();
      this.bearoffAllAction();
    });
    this.newgamebtn.on('click', () => {
      this.settings.slideToggle("normal"); //画面を消す
      this.nextGameAction();
    });
  }

  beginNewGame() {
//  const initpos = "-b-C--cC--c-B-";
    const initpos = "---ccbBBD-----";
    this.osgid.initialize(initpos);
    this.board.showBoard2(this.osgid);
    this.swapChequerDraggable(true, true);
    this.hideAllPanel();
    this.showOpenRollPanel();
console.log("beginNewGame", this.osgid.osgidstr);
  }

  async rollAction(openroll = false) {
    this.hideAllPanel();
    this.undoStack = [];
    const dice = this.randomdice(openroll);
    this.osgid.dice = dice[2];
    this.osgid.usabledice = true;
    this.board.animateDice(800);
    this.board.showBoard2(this.osgid);
    if (openroll) {
      this.player = (dice[0] > dice[1]);
      this.osgid.turn = OsgUtil.cvtTurnGm2Xg(this.player);
      this.showYouFirstPanel(this.player);
      OsgUtil.sleep(2000);
      this.youfirst.fadeOut(1500);
    }
console.log("rollAction", openroll, this.player, this.osgid.dice, this.osgid.osgidstr);
    this.swapChequerDraggable(this.player);
    this.pushXgidPosition();
    this.showDoneUndoPanel(this.player, openroll);
  }

  undoAction() {
    //ムーブ前のボードを再表示
    if (this.undoStack.length > 0) {
      const osgidstr = this.popXgidPosition();
      this.osgid = new OsgID(osgidstr);
      this.osgid.usabledice = true;
      this.donebtn.prop("disabled", (!this.osgid.moveFinished() && this.flashflg) );
      this.pushXgidPosition();
console.log("undoAction", osgidstr);
      this.board.showBoard2(this.osgid);
    }
  }

  doneAction() {
console.log("doneAction");
    this.hideAllPanel();
    this.swapTurn();
    this.osgid.dice = "00";
    this.osgid.turn = OsgUtil.cvtTurnGm2Xg(this.player);
    this.board.showBoard2(this.osgid);
    this.swapChequerDraggable(true, true);
    this.showRollPanel(this.player);
  }

  nextGameAction() {
    this.beginNewGame();
  }

  bearoffAllAction() {
console.log("bearoffAllAction");
    this.showGameEndPanel(this.player);
  }

  randomdice(openroll = false) {
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

  showRollPanel(player) {
console.log("showRollPanel", player);
    this.showElement(this.rollbtn, player);
  }

  showDoneUndoPanel(player, opening = false) {
const moveFinished = this.osgid.moveFinished();
    this.donebtn.prop("disabled", (!moveFinished && this.flashflg) );
//    this.donebtn.prop("disabled", (!this.osgid.moveFinished() && this.flashflg) );
console.log("showDoneUndoPanel", player, moveFinished , this.flashflg);
    this.showElement(this.donebtn, player);
    this.showElement(this.undobtn, player);
  }

  showOpenRollPanel() {
    this.showElement(this.splash, true, true);
  }

  showGameEndPanel(player) {
    this.showElement(this.gameend,  player, true);
  }

  showYouFirstPanel(player) {
    this.showElement(this.youfirst, player, true);
  }

  hideAllPanel() {
    this.allpanel.hide();
  }

  showElement(elem, player, pos) {
    const postision = this.calcElementPosition(elem, player, pos);
    elem.show().toggleClass('turn1', player).toggleClass('turn2', !player)
        .css(postision);
  }

  calcElementPosition(elem, player, pos = null) {
    let xx, yy;
    if (pos == null) {
      const tf = (player) ? "T" : "F";
      const idpos = elem.attr("id") + tf;
      const pposary = {"rollbtnT": [50, 90], "undobtnT": [30, 90], "donebtnT": [50, 90],
                       "rollbtnF": [50, 10], "undobtnF": [70, 10], "donebtnF": [50, 10]};
      const ppos =  pposary[idpos];
      xx = ppos[0];
      yy = ppos[1];
    } else {
      xx = 50;
      yy = 50;
    }

    const wx = xx * this.board.getVw() - elem.outerWidth(true) / 2;
    const wy = yy * this.board.getVh() - elem.outerHeight(true) / 2;
    return {left:wx, top:wy};
  }

  pushXgidPosition() {
console.log("pushXgidPosition", this.osgid.osgidstr);
   this.undoStack.push(this.osgid.osgidstr);
  }
  popXgidPosition() {
    const r = this.undoStack.pop();
console.log("popXgidPosition", r);
    return r;
  }


  swapTurn() {
    this.player = !this.player;
  }
  swapXgTurn() {
    this.osgid.turn = -1 * this.osgid.turn;
  }

  setChequerDraggable() {
    this.chequerall.draggable({
      //event
      start: ( event, ui ) => { this.dragStartAction(event, ui); },
      stop:  ( event, ui ) => { this.dragStopAction(event, ui); },
      //options
      containment: 'parent',
      opacity: 0.6,
      zIndex: 99,
      //revertDuration: 200
    });
  }

  dragStartAction(event, ui) {
    this.dragObject = $(event.currentTarget);
    const id = this.dragObject.attr("id");
    this.dragStartPt = this.board.getDragStartPoint(id, OsgUtil.cvtTurnGm2Bd(this.player));
    if (!this.outerDragFlag) { this.dragStartPos = ui.position; }
    this.outerDragFlag = false;
    this.flashOnMovablePoint(this.dragStartPt);
console.log("dragStart", this.dragStartPt, this.dragObject, event);
  }

  dragStopAction(event, ui) {
    this.flashOffMovablePoint();
    const pt = this.board.getDragEndPoint(ui.position, OsgUtil.cvtTurnGm2Bd(this.player));
    this.dragEndPt = (pt == 14 || pt == 15) ? 0 : pt;
    const xg = this.osgid;
    const ok = xg.isMovable(this.dragStartPt, this.dragEndPt, this.flashflg);
    const hit = xg.isHitted(this.dragEndPt);
console.log("dragStopOK?", ok, hit, this.dragStartPt, pt, this.dragEndPt);

    if (ok) {
      if (hit) {
        const movestr = this.dragEndPt + "/13";
        this.osgid = this.osgid.moveChequer(movestr);
        const oppoplayer = OsgUtil.cvtTurnGm2Bd(!this.player);
        const oppoChequer = this.board.getChequerHitted(this.dragEndPt, oppoplayer);
        const barPt = this.board.getBarPos(oppoplayer);
        if (oppoChequer) {
          oppoChequer.dom.animate(barPt, 300, () => { this.board.showBoard2(this.osgid); });
        }
console.log("dragStopHIT", movestr, this.osgid.osgidstr);
      }
      const movestr = this.dragStartPt + "/" + this.dragEndPt;
      this.osgid = this.osgid.moveChequer(movestr);
console.log("dragStopOK ", movestr, this.osgid.osgidstr);
      if (!hit) {
        this.board.showBoard2(this.osgid);
      }
    } else {
      this.dragObject.animate(this.dragStartPos, 300);
    }
const f = this.osgid.moveFinished();
console.log("dragStop button", f , this.flashflg);
//    this.donebtn.prop("disabled", (!this.osgid.moveFinished() && this.flashflg) );
    this.donebtn.prop("disabled", (!f && this.flashflg) );
    const turn = OsgUtil.cvtTurnGm2Xg(this.player);
    if (this.osgid.get_boff(turn) == 8) { this.bearoffAllAction(); }
  }

  swapChequerDraggable(player, init = false) {
    this.chequerall.draggable({disabled: true});
    if (init) { return; }
    const plyr = OsgUtil.cvtTurnGm2Bd(player);
console.log("swapChequerDraggable",player, plyr, this.board.chequer[plyr]);
    for (let i = 0; i < 8; i++) {
      const pt = this.board.chequer[plyr][i].point;
      if (pt == 15 || pt == 16) { continue; }
      this.board.chequer[plyr][i].dom.draggable({disabled: false});
    }
  }

  flashOnMovablePoint(startpt) {
    if (this.flashflg) {
      let dest2 = [];
      const destpt = this.osgid.movablePoint(this.dragStartPt, this.flashflg);
      for (const p of destpt) {
        let pt;
        if (this.player) { 
          pt = (p == 0) ? 14 : p;
        } else {
          pt = (p == 0) ? 15 : 13 - p;
        }
        dest2.push(pt);
      }
console.log("flashOnMovablePoint", startpt, destpt, dest2);
      this.board.flashOnMovablePoint(dest2, OsgUtil.cvtTurnGm2Bd(this.player));
    }
  }
  flashOffMovablePoint() {
    this.board.flashOffMovablePoint();
  }

/**********************************************
  pointTouchEndAction() {
//    this.flashOffMovablePoint();
  }

  pointTouchStartAction(event) {
    const id = event.currentTarget.id;
    const pt = parseInt(id.substr(2));
    const chker = this.board.getChequerOnDragging(pt, OsgUtil.cvtTurnGm2Bd(this.player));
console.log("pointTouchStartAction", id, pt, chker);

    if (chker) { //chker may be undefined
      const chkerdom = chker.dom;
      if (chkerdom.data('ui-draggable')) {
        this.dragStartPos = chker.position;
        this.outerDragFlag = true;
        const xx = event.pageX - 30;
        const yy = event.pageY - 30;
        chkerdom.css({left: xx, top: yy});
        event.type = "mousedown.draggable";
        event.target = chkerdom;
        chkerdom.trigger(e);
console.log("pointTouchStartAction", chkerdom);
      }
    }
  }
*****************************************/
} //end of class OsgGame
