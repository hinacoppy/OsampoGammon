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
    this.nextgamebtn = $("#nextgamebtn");
    this.settingbtn  = $("#settingbtn");
    this.allactionbtn= $("#undobtn,#donebtn,#rollbtn");

    //chequer
    this.chequerall  = $(".chequer");

    //panel
    this.panelholder = $("#panelholder");
    this.allpanel    = $(".panel,#undobtn,#donebtn,#rollbtn");
    this.splash      = $("#splash");
    this.youfirst    = $("#youfirst");
    this.gameend     = $("#gameend");
    this.settings    = $("#settings");

    this.hideAllPanel(); //font awesome が描画するのを待つ必要がある
    this.panelholder.show();
  }

  setEventHandler() {
    //Button Click Event
    this.openrollbtn.on('tap click', () => { this.rollAction(true); });
    this.rollbtn.    on('tap click', () => { this.rollAction(false); });
    this.donebtn.    on('tap click', () => { this.doneAction(); });
    this.undobtn.    on('tap click', () => { this.undoAction(); });
    this.nextgamebtn.on('tap click', () => { this.nextGameAction(); });

    //設定画面
    const yy = this.settingbtn.height();
    this.settingbtn.on('tap click', () => {
//      this.settings.css({left:0, top:yy});
      this.settings.css({left:0, top:yy}).slideToggle("normal");
    });
    this.resignbtn. on('tap click', () => { //for DEBUG
      this.settings.slideToggle("normal");
      this.swapTurn();
      this.bearoffAllAction();
    });
    this.newgamebtn.on('tap click', () => {
      this.settings.slideToggle("normal"); //画面を消す
      this.nextGameAction();
    });
  }

  beginNewGame() {
    const osgidstr = "OSGID=-b-C--cC--c-B-:0:00:0:0:0";
//    const osgidstr = "OSGID=----ccbBBD----:0:00:0:0:0";
    this.osgid = new OsgID(osgidstr);
    this.board.showBoard(this.osgid);
    this.swapChequerDraggable(true, true);
    this.hideAllPanel();
    this.showOpenRollPanel();
  }

  async rollAction(openroll = false) {
    this.hideAllPanel();
    this.undoStack = [];
    const dice = OsgUtil.randomdice3(openroll);
    this.osgid.dice = dice[2];
    this.osgid.usabledice = true;
    this.board.animateDice(800);
    this.board.showBoard(this.osgid);
    if (openroll) {
      this.player = (dice[0] > dice[1]);
      this.osgid.turn = OsgUtil.cvtTurnGm2Xg(this.player);
      this.showYouFirstPanel(this.player);
      await OsgUtil.sleep(1000);
      this.youfirst.fadeOut(1500);
    }
    this.swapChequerDraggable(this.player);
    this.pushOsgidPosition();
    this.showDoneUndoPanel(this.player);
  }

  undoAction() {
    //ムーブ前のボードを再表示
    if (this.undoStack.length > 0) {
      const osgidstr = this.popOsgidPosition();
      this.osgid = new OsgID(osgidstr);
      this.osgid.usabledice = true;
      this.donebtn.prop("disabled", !this.osgid.moveFinished() );
      this.pushOsgidPosition();
      this.board.showBoard(this.osgid);
    }
  }

  doneAction() {
    this.hideAllPanel();
    this.swapTurn();
    this.osgid.dice = "00";
    this.osgid.turn = OsgUtil.cvtTurnGm2Xg(this.player);
    this.board.showBoard(this.osgid);
    this.swapChequerDraggable(true, true);
    this.showRollPanel(this.player);
  }

  nextGameAction() {
    this.beginNewGame();
  }

  bearoffAllAction() {
    this.disableAllActionButton();
    this.showGameEndPanel(this.player);
  }

  showRollPanel(player) {
    this.rollbtn.prop("disabled", false);
    this.showElement(this.rollbtn, player);
  }

  showDoneUndoPanel(player) {
    this.undobtn.prop("disabled", false);
    this.donebtn.prop("disabled", !this.osgid.moveFinished() );
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

  disableAllActionButton() {
    this.allactionbtn.prop("disabled", true);
  }

  showElement(elem, player, pos) {
    const postision = this.calcElementPosition(elem, player, pos);
    elem.show().toggleClass('turn1', player).toggleClass('turn2', !player).css(postision);
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

  pushOsgidPosition() {
   this.undoStack.push(this.osgid.osgidstr);
  }

  popOsgidPosition() {
    return this.undoStack.pop();
  }

  swapTurn() {
    this.player = !this.player;
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
    });
  }

  dragStartAction(event, ui) {
    this.dragObject = $(event.currentTarget);
    const id = this.dragObject.attr("id");
    this.dragStartPt = this.board.getDragStartPoint(id, OsgUtil.cvtTurnGm2Bd(this.player));
    this.dragStartPos = ui.position;
    this.flashOnMovablePoint(this.dragStartPt);
  }

  dragStopAction(event, ui) {
    this.flashOffMovablePoint();
    this.dragEndPt = this.board.getDragEndPoint(ui.position, OsgUtil.cvtTurnGm2Bd(this.player));
    const ok = this.osgid.isMovable(this.dragStartPt, this.dragEndPt);
    const hit = this.osgid.isHitted(this.dragEndPt);
//console.log("dragStopOK?", ok, hit, this.dragStartPt, this.dragEndPt);

    if (ok) {
      if (hit) {
        const movestr = this.dragEndPt + "/13";
        this.osgid = this.osgid.moveChequer(movestr);
        const oppoplayer = OsgUtil.cvtTurnGm2Bd(!this.player);
        const oppoChequer = this.board.getChequerHitted(this.dragEndPt, oppoplayer);
        const barPt = this.board.getBarPos(oppoplayer);
        if (oppoChequer) {
          oppoChequer.dom.animate(barPt, 300, () => { this.board.showBoard(this.osgid); });
        }
//console.log("dragStopHIT", movestr, this.osgid.osgidstr);
      }
      const movestr = this.dragStartPt + "/" + this.dragEndPt;
      this.osgid = this.osgid.moveChequer(movestr);
//console.log("dragStopOK ", movestr, this.osgid.osgidstr);
      if (!hit) {
        this.board.showBoard(this.osgid);
      }
    } else {
      this.dragObject.animate(this.dragStartPos, 300);
    }
    this.donebtn.prop("disabled", !this.osgid.moveFinished() );
    const turn = OsgUtil.cvtTurnGm2Xg(this.player);
    if (this.osgid.get_boff(turn) == 8) { this.bearoffAllAction(); }
  }

  swapChequerDraggable(player, init = false) {
    this.chequerall.draggable({disabled: true});
    if (init) { return; }
    const gmplayer = OsgUtil.cvtTurnGm2Bd(player);
    for (let i = 0; i < 8; i++) {
      const pt = this.board.chequer[gmplayer][i].point;
      if (pt == 15 || pt == 16) { continue; }
      this.board.chequer[gmplayer][i].dom.draggable({disabled: false});
    }
  }

  flashOnMovablePoint(startpt) {
    if (true) {
      let dest2 = [];
      const destpt = this.osgid.movablePoint(this.dragStartPt);
      for (const p of destpt) {
        let pt;
        if (this.player) { 
          pt = (p == 0) ? 14 : p;
        } else {
          pt = (p == 0) ? 15 : 13 - p;
        }
        dest2.push(pt);
      }
      this.board.flashOnMovablePoint(dest2, OsgUtil.cvtTurnGm2Bd(this.player));
    }
  }

  flashOffMovablePoint() {
    this.board.flashOffMovablePoint();
  }

} //end of class OsgGame
