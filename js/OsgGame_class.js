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

    //point
    this.point       = $(".point,.pool");

    //panel
    this.allpanel    = $(".panel,#undobtn,#donebtn,#rollbtn");
    this.splash      = $("#splash");
    this.youfirst    = $("#youfirst");
    this.gameend     = $("#gameend");
    this.cannotmove  = $("#cannotmove");
    this.settings    = $("#settings");

    this.hideAllPanel(); //font awesome が描画するのを待つ必要がある
  }

  setEventHandler() {
    const clickEventType = 'click touchstart'; //(( window.ontouchstart !== null ) ? 'click':'touchstart');
    //Button Click Event
    this.openrollbtn.on(clickEventType, (e) => { e.preventDefault(); this.rollAction(true); });
    this.rollbtn.    on(clickEventType, (e) => { e.preventDefault(); this.rollAction(false); });
    this.donebtn.    on(clickEventType, (e) => { e.preventDefault(); this.doneAction(); });
    this.undobtn.    on(clickEventType, (e) => { e.preventDefault(); this.undoAction(); });
    this.nextgamebtn.on(clickEventType, (e) => { e.preventDefault(); this.nextGameAction(); });
    this.point.      on('touchstart mousedown', (e) => { e.preventDefault(); this.pointTouchStartAction(e); });
    $(window).       on('resize',       (e) => { e.preventDefault(); this.redrawAction(); }); 

    //設定画面
    this.settingbtn.on(clickEventType, (e) => {
      e.preventDefault();
      const yy = this.settingbtn.height();
      this.settings.css({left:0, top:yy}).slideToggle("normal");
    });
    this.resignbtn. on(clickEventType, (e) => { //for DEBUG
      e.preventDefault();
      this.settings.slideUp("normal");
      this.swapTurn();
      this.bearoffAllAction();
    });
    this.newgamebtn.on(clickEventType, (e) => {
      e.preventDefault();
      this.settings.slideUp("normal"); //画面を消す
      this.nextGameAction();
    });
  }

  beginNewGame() {
    const osgidstr = "OSGID=-b-C--cC--c-B-:0:00:0:0:0";
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
    if (this.osgid.moveFinished()) { //ロール後全く動かせないとき
      await OsgUtil.sleep(1000); //ダイスアニメーションを待ってダイアログを表示
      this.showCannotMovePanel(this.player);
      await OsgUtil.sleep(1000);
      this.cannotmove.fadeOut(1500);
      await OsgUtil.sleep(1500); //フェードアウトを待って
      this.doneAction(); //「動かし終わり」のボタンを勝手にクリック
      return;
    }
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
      this.swapChequerDraggable(this.player);
    }
  }

  doneAction() {
    if (this.donebtn.prop("disabled")) { return; }
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
    this.showElement(this.gameend, player, true);
  }

  showYouFirstPanel(player) {
    this.showElement(this.youfirst, player, true);
  }

  showCannotMovePanel(player) {
    this.showElement(this.cannotmove, player, true);
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

  calcElementPosition(elem, player, pos = false) {
    let xx, yy;
    if (pos == false) {
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
    //関数内広域変数
    var x;//要素内のクリックされた位置
    var y;
    var dragobj; //ドラッグ中のオブジェクト
    var zidx; //ドラッグ中のオブジェクトのzIndexを保持

    //この関数内の処理は、パフォーマンスのため jQuery Free で記述

    //ドラッグ開始時のコールバック関数
    const evfn_dragstart = ((origevt) => {
      dragobj = origevt.currentTarget; //dragする要素を取得し、広域変数に格納
      if (!dragobj.classList.contains("draggable")) { return; } //draggableでないオブジェクトは無視

      dragobj.classList.add("dragging"); //drag中フラグ(クラス追加/削除で制御)
      zidx = dragobj.style.zIndex;
      dragobj.style.zIndex = 999;

      //マウスイベントとタッチイベントの差異を吸収
      const event = (origevt.type === "mousedown") ? origevt : origevt.changedTouches[0];

      //要素内の相対座標を取得
      x = event.pageX - dragobj.offsetLeft;
      y = event.pageY - dragobj.offsetTop;

      //イベントハンドラを登録
      document.body.addEventListener("mousemove",  evfn_drag,    {passive:false});
      document.body.addEventListener("mouseleave", evfn_dragend, false);
      dragobj.      addEventListener("mouseup",    evfn_dragend, false);
      document.body.addEventListener("touchmove",  evfn_drag,    {passive:false});
      document.body.addEventListener("touchleave", evfn_dragend, false);
      dragobj.      addEventListener("touchend",   evfn_dragend, false);

      const ui = {position: { //dragStartAction()に渡すオブジェクトを作る
                   left: dragobj.offsetLeft,
                   top:  dragobj.offsetTop
                 }};
      this.dragStartAction(origevt, ui);
    });

    //ドラッグ中のコールバック関数
    const evfn_drag = ((origevt) => {
      origevt.preventDefault(); //フリックしたときに画面を動かさないようにデフォルト動作を抑制

      //マウスイベントとタッチイベントの差異を吸収
      const event = (origevt.type === "mousemove") ? origevt : origevt.changedTouches[0];

      //マウスが動いた場所に要素を動かす
      dragobj.style.top  = event.pageY - y + "px";
      dragobj.style.left = event.pageX - x + "px";
    });

    //ドラッグ終了時のコールバック関数
    const evfn_dragend = ((origevt) => {
      dragobj.classList.remove("dragging"); //drag中フラグを削除
      dragobj.style.zIndex = zidx;

      //イベントハンドラの削除
      document.body.removeEventListener("mousemove",  evfn_drag,    false);
      document.body.removeEventListener("mouseleave", evfn_dragend, false);
      dragobj.      removeEventListener("mouseup",    evfn_dragend, false);
      document.body.removeEventListener("touchmove",  evfn_drag,    false);
      document.body.removeEventListener("touchleave", evfn_dragend, false);
      dragobj.      removeEventListener("touchend",   evfn_dragend, false);

      const ui = {position: { //dragStopAction()に渡すオブジェクトを作る
                   left: dragobj.offsetLeft,
                   top:  dragobj.offsetTop
                 }};
      this.dragStopAction(origevt, ui);
    });

    //dragできるオブジェクトにdragstartイベントを設定
    for(const elm of this.chequerall) {
      elm.addEventListener("mousedown",  evfn_dragstart, false);
      elm.addEventListener("touchstart", evfn_dragstart, false);
    }
  }

  dragStartAction(event, ui) {
    this.dragObject = $(event.currentTarget); //dragStopAction()で使うがここで取り出しておかなければならない
    const id = event.currentTarget.id;
    this.dragStartPt = this.board.getDragStartPoint(id, OsgUtil.cvtTurnGm2Bd(this.player));
    this.dragStartPos = ui.position;
    this.flashOnMovablePoint(this.dragStartPt);
  }

  dragStopAction(event, ui) {
    this.flashOffMovablePoint();
    this.dragEndPt = this.board.getDragEndPoint(ui.position, OsgUtil.cvtTurnGm2Bd(this.player));
    const ok = this.osgid.isMovable(this.dragStartPt, this.dragEndPt);
    const hit = this.osgid.isHitted(this.dragEndPt);

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
      }
      const movestr = this.dragStartPt + "/" + this.dragEndPt;
      this.osgid = this.osgid.moveChequer(movestr);
      if (!hit) {
        this.board.showBoard(this.osgid);
      }
    } else {
      this.dragObject.animate(this.dragStartPos, 300);
    }
    this.swapChequerDraggable(this.player);
    this.donebtn.prop("disabled", !this.osgid.moveFinished() );
    const turn = OsgUtil.cvtTurnGm2Xg(this.player);
    if (this.osgid.get_boff(turn) == 8) { this.bearoffAllAction(); }
  }

  swapChequerDraggable(player, init = false) {
    this.chequerall.removeClass("draggable");
    if (init) { return; }
    const gmplayer = OsgUtil.cvtTurnGm2Bd(player);
    for (let i = 0; i < 8; i++) {
      const pt = this.board.chequer[gmplayer][i].point;
      if (pt == 15 || pt == 16) { continue; }
      this.board.chequer[gmplayer][i].dom.addClass("draggable");
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

  pointTouchStartAction(origevt) {
    const id = origevt.currentTarget.id;
    const pt = parseInt(id.substr(2));
    const chker = this.board.getChequerOnDragging(pt, OsgUtil.cvtTurnGm2Bd(this.player));
    const evttypeflg = (origevt.type === "mousedown")
    const event = (evttypeflg) ? origevt : origevt.changedTouches[0];

    if (chker) { //chker may be undefined
      const chkerdom = chker.dom;
      if (chkerdom.hasClass("draggable")) {
        this.outerDragFlag = true;
        this.dragStartPos = {left: chkerdom[0].style.left,
                             top:  chkerdom[0].style.top };
        chkerdom.css({left: event.clientX - 30,
                      top:  event.clientY - 30});
        let delegateEvent;
        if (evttypeflg) {
          delegateEvent = new MouseEvent("mousedown", {clientX:event.clientX, clientY:event.clientY});
        } else {
          const touchobj = new Touch({identifier: 12345,
                                      target: chkerdom[0],
                                      clientX: event.clientX,
                                      clientY: event.clientY,
                                      pageX: event.pageX,
                                      pageY: event.pageY});
          delegateEvent = new TouchEvent("touchstart", {changedTouches:[touchobj]});
        }
        chkerdom[0].dispatchEvent(delegateEvent);
      }
    }
  }

  redrawAction() {
    this.board.redraw(this.osgid);

    this.allpanel.each((index, elem) => {
      if ($(elem).css("display") != "none") {
        this.showElement($(elem), this.player, $(elem).hasClass("panel")); //panelは中央表示
      }
    });
  }

} //end of class OsgGame
