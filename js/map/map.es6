var MapScene = enchant.Class.create(enchant.Scene, {
  selectChara: null,
  selectAttack: null,
  localPos: null,
  touchMode: TouchMode.disable,
  turn: TurnType.ready, 
  charas: [],
  deadCharas: [],

  /**
   * @constructor
   * @param data 
   */
  initialize: function(data) {
    enchant.Scene.call(this);

    this.data = data;

    // mapエリア
    this.field = new Group();
    this.field.y = CHIP_SIZE * 2;

    // フロア
    this.floors = [];
    for(var d of data.data) {
      var floor = new Map(CHIP_SIZE, CHIP_SIZE);
      floor.image = game.assets[`img/map/${data.chip.file}.png`];
      floor.loadData(d);
      this.field.addChild(floor); 
    }

    // 行動範囲表示
    this.ranges = new RangeGroup(this);
    this.field.addChild(this.ranges);

    this.addChild(this.field);

    // ミニステータス表示
    this.status = new MiniStatus();
    this.addChild(this.status);

    // メニュー表示
    this.menu = new Group(WINDOW.width, CHIP_SIZE);
    this.menu.y = CHIP_SIZE * 10;
    var menu_window = new GradSquare(WINDOW.width, CHIP_SIZE, COLOR.window.player);
    this.menu.addChild(menu_window);
    this.addChild(this.menu);

    // 敵の表示
    data.enemies.map(enemy => {
      var chara = new MapCharactor(enemy.chara, CampType.enemy);
      // 位置
      chara.setPos(new Pos(enemy.x, enemy.y));

      // 思考ルーチン
      chara.routine = enemy.routine;

      this.field.addChild(chara);
      this.charas.push(chara);
      return chara;
    });

    // 味方の表示
    data.players.map((player, i) => {
      if (party[i] == undefined) {return;}
      
      var chara = new MapCharactor(party[i]);
      chara.setPos(new Pos(player.x, player.y));
      this.field.addChild(chara);
      this.charas.push(chara);
      return chara;
    });

    this.field.on(Event.TOUCH_END, e => {
      // キャラクター攻撃時
      if (this.touchMode != TouchMode.attack) { return; }

      let pos = this.calPosByLocal(e.localX, e.localY);

      // 違う陣営がいるか?
      for (var chara of this.charas) {
        if (this.isAttackEnable(pos) && pos.equal(chara.pos)) {
          scenes.preBattle.setChara(this.selectChara, chara);
          return;
        }
      }

      let selectChara = this.selectChara;
      this.selectEnd();
      selectChara.moved();
    });

    // カーソル移動時
    this.field.on(Event.TOUCH_MOVE, e => {
      // シングルタップか移動中のみ反応
      if (this.touchMode != TouchMode.single && this.touchMode != TouchMode.move) { return; }
      if (!this.lastPos) { return; }

      // 以前と位置が同じ場合は終了
      let pos = this.calPosByLocal(e.localX, e.localY);
      if (this.lastPos.equal(pos)) { return; }

      // 移動準備
      if (this.touchMode == TouchMode.single) { this.prePlayerMove();}

      // 移動できるか
      // 攻撃範囲内かつ敵をターゲット
      if (!this.isMoveEnable(pos) &&
          !(this.isContainAttackRange(this.selectChara, pos) && this.hitChara(pos, this.selectChara))) { return; }

      // 移動先記録
      this.lastPos = pos;
      this.movePreSprite(pos);
    });

    // 行動終了ボタン
    this.finishButton = new FButton("行動終了", 130, 3, 100);

    // 行動を終了する
    this.finishButton.on(Event.TOUCH_END, e => {
      if (this.touchMode != TouchMode.none) {return;}
      this.ranges.clear(); 

      this.touchMode = TouchMode.disable;
      this.menu.removeChild(this.finishButton);

      // 全員行動終了
      this.charas.filter(c => !c.move_flag).forEach(c => c.moved());
    });
  },

  // 敵のターン
  enemyTurn: function(camp) {
    // 敵の攻撃タスク
    var enemies = this.sameCampCharas(camp);

    // 次のタスクを実行するコールバック
    var i = 0;
    this.finishEnemyAction = () => {
      // 全員行動終了済みか
      if (enemies.length <= i) { return; }

      // 敵の行動開
      this.enemyAction(enemies[i]);
      i++;
    };

    this.finishEnemyAction();
  },

  enemyAction: function(enemy) {
    switch(enemy.routine) {
      case RoutineType.none:
      this.enemyActionNormal(enemy);
      break;
    }
  },

  // 猪突猛進タイプの思考ルーチン
  enemyActionNormal: function(enemy) {
    // 攻撃範囲内に敵がいるか
    let charas = this.otherCampCharas(enemy.camp);
    let containChara = this.checkContainAttackRange(enemy, charas);

    var move_max = enemy.getMove();

    // ターゲット指定
    var target;
    var target_pos;
    if (containChara.length > 0) {
      // 敵がいる場合は、その中での優先度を決める
      target = enemy.getMostPriority(containChara);

      let attacks = enemy.calAttackRange([target.pos]);
      target_pos = this.getMostPriority(enemy, target, attacks); 
    } else {
      // 範囲内に敵がいない場合は、全キャラクターの優先度をチェックする
      target = enemy.getMostPriority(charas);
      target_pos = target.pos;
    }

    var moves = this.calApploach(enemy.pos, target_pos);;

    // 移動終了
    let moved = () => {
      if (containChara.length > 0) {
        // 攻撃開始
        scenes.battle.setChara(enemy, target);
      } else {
        // 移動して行動終了　
        enemy.moved();
        this.finishEnemyAction();
      }
    }

    // 目標地点まで移動する
    var i = 1;
    let self = this;
    function move() {
      // 既に到着している場合は終了
      if (enemy.pos.equal(target_pos)) {
        self.tl.delay(5).then(moved);
        return;
      }

      self.apploach(enemy, target_pos, FPS / 10, moves, result => {
        if (!result || i >= move_max) {
          self.tl.delay(5).then(moved);
          return;
        }

        move();
        i++;
      });
    }

    // 移動開始
    move();

    console.log(`${enemy.data.name} target:${target.data.name} => (${target_pos.x},${target_pos.y})`);
  },

  // 攻撃範囲内に敵がいるか
  checkContainAttackRange(chara, enemies) {
    // 攻撃範囲内に敵がいるか
    let range = new Range(this.getMoveAndAttackRange(chara));
    let containChara = enemies.filter(e => range.contain(e.pos));

    return containChara;
  },

  // 味方の状況、敵の状況をチェックして
  // ターン遷移を確認する
  checkTurn: function() {
    // 勝利か敗北チェック
    if (this.players().length == 0) {
      // 敗北
      console.log("敗北");
      postTwitter(`負けてしまった・・・`);
      return;
    } else if (this.enemies().length == 0) {
      // 勝利
      console.log("勝利");
      postTwitter(`買った!!`);
      return;
    }

    // ターン終了かチェック
    switch(this.turn) {
      case TurnType.player:
        // 全員行動済みか 
        if (this.players().filter(player => !player.move_flag).length == 0) {
          this.charas.forEach(c => c.canMove());
          this.menu.removeChild(this.finishButton);
          scenes.changeTurn.setScene(CampType.enemy);
        } else {
          this.menu.addChild(this.finishButton);
        }
      break;
      case TurnType.enemy:
        // 全員行動済みか 
        if (this.enemies().filter(enemy => !enemy.move_flag).length == 0) {
          this.charas.forEach(c => c.canMove());
          scenes.changeTurn.setScene(CampType.party);
        }
      break;
    }
  },

  next: function() {
    switch(this.turn) {
      case TurnType.ready:
      this.touchMode = TouchMode.none;
      this.turn = TurnType.player;
      this.menu.addChild(this.finishButton);
      break;
      
      case TurnType.player:
      this.TouchMode = TouchMode.disable;
      this.turn = TurnType.enemy;
      this.enemyTurn(CampType.enemy);
      break;

      case TurnType.enemy:
      this.touchMode = TouchMode.none;
      this.turn = TurnType.player;
      this.menu.addChild(this.finishButton);
      break;
    }
  },

  isContainAttackRange(chara, pos) {
    var attacks = chara.calAttackRange([chara.pos]);
    attacks = attacks.filter(pos => !this.hitCol(pos) && !this.hitSameChara(pos, chara));

    return attacks.find(p => p.equal(pos)) != undefined; 
  },

  enemies: function() {
    return this.charas.filter(chara => chara.camp == CampType.enemy);
  },

  players: function() {
    return this.charas.filter(chara => chara.camp == CampType.party);
  },

  // player側のキャラクターを移動させるための準備
  prePlayerMove: function() {
    let chara = this.selectChara;

    this.touchMode = TouchMode.move;
    this.menu.removeChild(this.finishButton);

    // 範囲表示
    let moves = this.calRange(chara.pos, chara.getMove(), chara);
    var attacks = chara.calAttackRange(moves);
    attacks = attacks.filter(pos => !this.hitCol(pos) && !this.hi(pos, chara));
    this.ranges.set_ranges(moves, attacks);

    // 半透明の移動先表示
    let localPos = chara.pos.localPos();
    this.preSprite = chara.mainSprite();
    this.preSprite.x = localPos.x;
    this.preSprite.y = localPos.y;
    this.field.addChild(this.preSprite);
  },

  // 移動先は移動可能範囲内か
  isMoveEnable: function(pos) {
    return this.ranges.moves.find(p => p.equal(pos)) != undefined;
  },

  // 指定座標は攻撃範囲内か
  isAttackEnable: function(pos) {
    return this.ranges.attacks.find(p => p.equal(pos)) != undefined;
  },

  // 半透明の移動先の移動
  movePreSprite: function(pos) {
    let localPos = pos.localPos();
    this.preSprite.x = localPos.x;
    this.preSprite.y = localPos.y;

    // 元の位置と同じ場合は表示しない
    if (this.selectChara.pos.equal(pos)) {
      this.preSprite.main.opacity = 0;
    } else {
      this.preSprite.main.opacity = 0.5;
    }
  },

  selectEnd: function() {
    // 移動中は移動範囲クリア
    if (this.touchMode == TouchMode.move || 
        this.touchMode == TouchMode.attack) { 
      this.ranges.clear(); 
    }

    this.touchMode = TouchMode.none;
    this.selectChara = null;
    this.lastPos = null;

    // 取り消しボタン削除
    this.menu.removeChild(this.cancelButton);

    // 半透明キャラ削除
    this.field.removeChild(this.preSprite);
  },

  // 戦闘終了
  finishBattle: function(chara, enemy) {
    // 死んだキャラがいる場合はフェードアウト
    var deads = this.charas.filter(c => c.isDead());
    this.deadCharas = this.deadCharas.concat(deads);
    this.deadCharas.forEach(c => {
      c.tl
        .delay(5)
        .removeFromScene();
    });
    // 死んだキャラを配列から覗く
    this.charas = this.charas.filter(c => !c.isDead());

    // HPを更新する
    this.charas.forEach(c => c.gage.setHP());

    // キャラクターを行動済みにする
    chara.moved();

    if (chara.is_player()) {
      // 選択終了
      this.selectEnd();
    } else {
      // 次のキャラへ
      this.finishEnemyAction();
    }
  },

  calPosByLocal: function(x, y) {
    return new Pos(Math.floor(x / CHIP_SIZE), Math.floor(y / CHIP_SIZE));
  },

  // キャラクターシングルタップ
  touchedChara: function(chara) {
    this.status.set_chara(chara);

    // 移動範囲計算
    let moves = this.calRange(chara.pos, chara.getMove(), chara);

    // 移動範囲から攻撃範囲を計算し、障害物を取り除く
    var attacks = chara.calAttackRange(moves);
    attacks = attacks.filter(pos => !this.hitCol(pos) && !this.hitSameChara(pos, chara));

    // 範囲表示
    this.ranges.set_ranges(moves, attacks);

    this.selectEnd();
  },

  getMoveAndAttackRange: function(chara) {
    // 移動範囲計算
    let moves = this.calRange(chara.pos, chara.getMove(), chara);

    // 移動範囲から攻撃範囲を計算し、障害物を取り除く
    var attacks = chara.calAttackRange(moves);
    return moves.concat(attacks);
  },

  moveTo: function(chara, pos) {
    let moves = this.calApploach(chara.pos, pos);
    let time = FPS / 10;
    this.touchMode = TouchMode.disable;

    // 移動完了
    var finish = () => {
      // 少しdelayをかけたのち攻撃モードへ
      this.tl.delay(FPS / 4)
        .then(() => { this.setAttackMode(chara); });
    }

    // 再帰関数
    // 条件を満たすまで一歩ずつ移動する
    var i = 1;
    var self = this;
    function apploach() {
      self.apploach(chara, pos, time, moves, result => {
        // resultは到着済みか
        // 移動距離に達するか到着したら終了
        if (!result || i >= chara.getMove()) {
          finish();
          return;
        }

        apploach();
        i++;
      }); 
    } 

    apploach();
  },

  setAttackMode: function(chara) {
    // 半透明キャラ削除
    this.field.removeChild(this.preSprite);

    // 攻撃範囲表示
    var attacks = chara.calAttackRange([chara.pos]);
    attacks = attacks.filter(pos => !this.hitCol(pos));
    this.ranges.set_ranges([], attacks)

    // キャンセルボタンセット
    this.cancelButton = new FButton("取り消し", 130, 3, 100);
    this.menu.addChild(this.cancelButton);

    // 移動を取り消し、元の位置に戻る
    this.cancelButton.on(Event.TOUCH_END, e=> {
      let chara = this.selectChara;
      chara.setPos(chara.beforePos);
      this.selectEnd();

      // 行動終了ボタン表示
      this.menu.addChild(this.finishButton);
    });

    this.touchMode = TouchMode.attack;
  },

  // 目的地へ一歩近づく
  // chara: キャラクター
  // pos: 目標
  // time: 所要時間
  // moves: 計算済み経路探索(あれば)
  apploach: function(chara, pos, time = 0, moves = null, func = null) {
    if (chara.pos.equal(pos)) {
      // callbackをよぶ
      if (func) { func(false);}
      return false; 
    }

    // 計算済みでない場合
    if (!moves) {
      // マップ分の配列を作成する
      moves = this.calApploach(chara.pos, pos);
    }

    // 最短の方向を取得する
    var length = Infinity;
    var direction = null;
    for (var d of DIRECTIONS) {
      let p = chara.pos.add(d);

      // マップ外の場合は処理しない
      if (Common.checkPosIsOver(p)) { continue; }

      // より短い場合は最短記録更新
      if (moves[p.y][p.x] < length) {
        direction = new Pos(d.x, d.y);
        length = moves[p.y][p.x];
      }
    }

    // 向かうべき方向があれば
    if (!direction) { return false; }

    let moveBy = direction.multi(CHIP_SIZE);
    chara.pos = chara.pos.add(direction);
    chara.tl.moveBy(moveBy.x, moveBy.y, time).then(() => {
      // callbackをよぶ
      if (func) { func(true);}
    });

    return true;
  },

  // 目的地への最短経路計算
  calApploach: function(start, goal, chara = null) {
    var move = MAP.width * MAP.height;
    var moves = this.calRangeMoves(goal, move, chara, start);

    return moves;
  },

  calRangeMoves(pos, move, chara = null, goal = null) {
    // マップ分の配列を作成する
    var moves = Common.getEmptyArray();
    moves[pos.y][pos.x] = 0;

    // poss = 距離ごとに到達領域を保存する
    var poss = [[pos.copy()]];

    for (var i = 0; i < move; i++) {
      poss[i + 1] = [];

      // 距離ごとに探索
      for (var pos of poss[i]) {
        // 指定位置から四方向
        for (var d of DIRECTIONS) {
          let p = pos.add(d);

          // マップ外の場合は処理しない
          if (Common.checkPosIsOver(p)) { continue; }

          // 通行可能な場合
          if (!this.hitCol(p) && 
              !this.hitChara(p, chara) && 
              moves[p.y][p.x] > i + 1) {
            // 最短距離にする
            moves[p.y][p.x] = i + 1;
            poss[i + 1].push(p);

            // ゴールが設定されている場合
            // たどり着いたら終了する
            if (goal && goal.equal(p)) {
              return moves;
            }
          }
        }
      }
    }

    return moves;
  },

  /**
   * キャラクターの移動範囲計算
   * @param chara 
   */
  calRangeByChara: function(chara) {
    return this.calRange(chara.pos, chara.getMove(), chara);
  },

  /*
   * 移動範囲計算
   * @param pos 
   * @param move 
   * @param chara 
   */
  calRange: function(pos, move, chara = null) {
    let moves = this.calRangeMoves(pos, move, chara);
    var move_range = [];

    moves.forEach((row, y) => {
      row.forEach((p, x) => {
        if (p != Infinity ) {
          move_range.push(new Pos(x, y));
        }
      });
    });

    if (chara) {
      // 味方陣営とぶつからないようにする
      let sameCampCharas = this.sameCampCharas(chara.camp);
      move_range = move_range.filter(p => {
        return sameCampCharas.find(c => c.pos.equal(p)) == undefined;
      });
    }

    return move_range;
  },

  /**
   * ## getMostPriority
   * 優先度の高い攻撃位置を取得する
   * @param chara 攻撃者
   * @param target ターゲット
   * @param attacks 攻撃範囲 [Pos]
   */
  getMostPriority: function(chara, target, attacks) {
    // ターゲットの攻撃範囲
    let target_attacks = target.calAttackRange([target.pos]);
    let attackRange = new Range(attacks);
    let moves = new Range(this.calRangeByChara(chara)); 

    var getExpected = (pos) => {
      var result = 0;

      // 攻撃範囲に入ってる
      if (moves.contain(pos)) {
        result = 100;

        // かつ、敵の攻撃範囲に入っていない場合は満点
        if (!attackRange.contain(pos)) {
          result += 100;
        }
      }
      return result;
    };

    return attacks.reduce((a, result) => {
      let expected = getExpected(a);
      let result_expected = getExpected(result);
      return expected > result_expected ? a : result;
    });
  },

  /**
   * ## hitCol
   * 障害物判定
   * @param pos 座標
   * @return {Boolean}
   */
  hitCol: function(pos) {
    var result = false;
    for (var data of this.data.data) {
      let chip_num = data[pos.y][pos.x];
      // 何もない場合はスルー
      if (chip_num == -1) { continue;}

      // 一番上のタイルを最終判定とする
      var result = this.data.chip.type[chip_num].hit;
    }

    return result;
  },

  /**
   * ## hitChara
   * 別陣営のキャラクターにHitするか
   * @param {Pos} pos 
   * @param {Character} chara 
   * @return {Boolean}
   */
  hitChara: function(pos, chara) {
    if (!chara) {return false;}

    for (var target of this.charas) {
      if (!chara.isCampEqual(target) && pos.equal(target.pos)) {
        return target;
      }
    }

    return false;
  },

  /**
   * ## hitChara
   * 同じ陣営のキャラクターにHitするか
   * @param {Pos} pos 
   * @param {Character} chara 
   * @return {Boolean}
   */
  hitSameChara: function(pos, chara) {
    if (!chara) {return false;}

    target = this.sameCampCharas(chara.camp).find(c => c.pos.equal(pos));
    return target != undefined ? target : false;
  },

  /**
   * ## sameCmapCharas
   * 同じ陣営のキャラを取得する
   * @param {CampType} camp 陣営
   * @return {[Character]} キャラクター
   */
  sameCampCharas: function(camp) {
    return this.charas.filter(c => c.camp == camp);
  },

  /**
   * ## otherCampCharas 
   * 違う陣営のキャラを取得する
   * @param {CampType} camp 陣営
   * @return {[Character]} キャラクター
   */
  otherCampCharas: function(camp) {
    return this.charas.filter(c => c.camp != camp);
  },
});

/**
 * @constructor
 */
var RangeGroup = enchant.Class.create(enchant.Group, {
  moves: [],
  attack: [],

  initialize: function(map) {
    this.map = map;
    enchant.Group.call(this);
  },

  clear: function() {
    this.removeAll();
  },

  set_ranges: function(moves = [], attacks = []) {
    this.removeAll();
    this.moves = moves;
    this.attacks = attacks;

    moves.forEach(pos => this.drawPos(pos.x, pos.y));
    attacks.forEach(pos => this.drawPos(pos.x, pos.y, COLOR.attack));
  },

  drawPos: function(x, y, color = COLOR.move) {
    let line = 1;
    var sprite = new Square(CHIP_SIZE - line * 2, CHIP_SIZE - line * 2, color);
    sprite.x = CHIP_SIZE * x + line;
    sprite.y = CHIP_SIZE * y + line;
    sprite.opacity = 0.5;

    this.addChild(sprite);
  },
});


var MiniStatus = enchant.Class.create(enchant.Group, {
  margin: 5,

  initialize: function() {
    enchant.Group.call(this);

    // ウィンドウ表示
    this.window = new Sprite(WINDOW.width, CHIP_SIZE * 2);
    this.window.image = game.assets['img/system/mini_status.png'];
    this.addChild(this.window); 
  },

  set_chara: function(chara) {
    this.chara = chara;

    // ウィンドウ表示
    let filename = chara.is_enemy() ? "enemy_mini_status" : "mini_status";
    this.window = new Sprite(WINDOW.width, CHIP_SIZE * 2);
    this.window.image = game.assets[`img/system/${filename}.png`];
    this.addChild(this.window); 
    
    // ゲージ表示
    let gage_hp_base_width = WINDOW.width - this.margin * 2;
    let gage_hp_width = chara.hp / chara.maxhp * gage_hp_base_width;
    this.addChild(new Gage("gagebase", this.margin, 12, gage_hp_base_width, GAGE));
    this.addChild(new Gage("gagegreen", this.margin, 12, gage_hp_width, GAGE));

    // 名前表示
    this.name_text = new FLabel(chara.data.name, 13, this.margin, this.margin);
    this.name_text.setShadow();
    this.addChild(this.name_text);

    // hp表示
    this.hp_text = new FLabel(`${chara.hp} / ${chara.maxhp}`, 12, WINDOW.width - this.margin, this.margin);
    this.hp_text.setShadow();
    this.hp_text.alignRight();
    this.addChild(this.hp_text);

    // 顔グラ表示
    let status_y = this.margin * 2 + 15;
    this.image = new Sprite(50, 50);
    this.image.image = game.assets[`img/chara/status/${chara.data.id}.png`]; 
    this.image.x = this.margin;
    this.image.y = status_y;
    this.addChild(this.image);

    // スキル表示
    this.skill_text = new FLabel(chara.data.main_trigger.name, 12, 60, status_y);
    this.skill_text.setShadow();
    this.addChild(this.skill_text);

    // スキル説明
    this.description = new FLabel(chara.data.main_trigger.description, 10, 60, status_y + 20);
    this.addChild(this.description);
  },
});