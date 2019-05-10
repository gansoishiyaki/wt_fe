// 名前空間を作成
var MapScene = enchant.Class.create(enchant.Scene, {
  selectChara: null,
  localPos: null,
  charas: [],

  initialize: function(data) {
    enchant.Scene.call(this);

    this.data = data;

    // mapエリア
    this.field = new Group();
    this.field.y = CHIP_SIZE * 2;

    // フロア
    this.floor = new Map(CHIP_SIZE, CHIP_SIZE);
    this.floor.image = game.assets[`img/map/${data.chip.file}.png`];
    this.floor.loadData(data.data);
    this.field.addChild(this.floor); 

    // 行動範囲表示
    this.ranges = new Range(this);
    this.field.addChild(this.ranges);

    this.addChild(this.field);

    // ミニステータス表示
    this.status = new MiniStatus();
    this.addChild(this.status);

    // メニュー表示
    this.menu = new Sprite(WINDOW.width, CHIP_SIZE * 2);
    this.menu.image = game.assets['img/system/mini_status.png'];
    this.menu.y = CHIP_SIZE * 9.5;
    this.menu.scale(1, 0.5);
    this.addChild(this.menu);

    // 敵の表示
    data.enemies.map(enemy => {
      var chara = new MapCharactor(enemy.chara, CampType.enemy);
      chara.setPos(new Pos(enemy.x, enemy.y));
      this.field.addChild(chara);
      this.charas.push(chara);
      return chara;
    });

    data.players.map((player, i) => {
      var chara = new MapCharactor(party[i]);
      chara.setPos(new Pos(player.x, player.y));
      this.field.addChild(chara);
      this.charas.push(chara);
      return chara;
    });

    // カーソル移動時
    this.field.on(Event.TOUCH_MOVE, e => {
      if (this.selectChara) {
        let pos = this.calPosByLocal(e.localX, e.localY);

        // 前回位置と異なるマス目にスライドした場合
        // 移動フラグをオンにし、位置を記録する
        if (!this.lastPos.equal(pos)) {
          // 移動準備
          if (!this.selectChara.is_move) { this.prePlayerMove(); }

          // 移動できるか
          if (!this.isMoveEnable(pos)) { return; }

          // 移動先記録
          this.lastPos = pos;
          this.movePreSprite(this.lastPos);
        }
      }
    });
  },

  enemies: function() {
    return this.charas.filter(chara => chara.camp == CampType.enemy);
  },

  players: function() {
    return this.charas.filter(chara => chara.camp == CampType.party);
  },

  // player側のキャラクターを移動させるための準備
  prePlayerMove: function() {
    var chara = this.selectChara;

    chara.is_move = true;
    let moves = this.calRange(chara.pos, chara.getMove(), chara);
    this.ranges.set_ranges(moves, []);

    // 半透明の移動先表示
    let localPos = chara.pos.localPos();
    this.preSprite = chara.mainSprite();
    this.preSprite.x = localPos.x;
    this.preSprite.y = localPos.y;
    this.field.addChild(this.preSprite);
  },

  // 移動先は移動可能範囲内か
  isMoveEnable: function(pos) {
    var chara = this.selectChara;
    let moves = this.calRange(chara.pos, chara.getMove(), chara);

    return moves.filter(p => p.equal(pos)).length > 0;
  },

  // 半透明の移動先の移動
  movePreSprite: function(pos) {
    let localPos = pos.localPos();
    this.preSprite.x = localPos.x;
    this.preSprite.y = localPos.y;

    // 元の位置と同じ場合は表示しない
    if (this.selectChara.pos.abs(pos) == 0) {
      this.preSprite.main.opacity = 0;
    } else {
      this.preSprite.main.opacity = 0.5;
    }
  },

  selectEnd: function() {
    if (!this.selectChara) { return; }

    this.lastPos = null;
    this.field.removeChild(this.preSprite);

    // 移動範囲クリア
    if (this.selectChara.is_move) {
      this.ranges.clear();
    }

    this.selectChara.is_move = false;
    this.selectChara = null;
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
    attacks = attacks.filter(pos => !this.hitCol(pos));

    // 範囲表示
    this.ranges.set_ranges(moves, attacks);
  },

  moveTo: function(chara, pos) {
    let moves = this.calApploach(chara.pos, pos);

    let time = FPS / 10;
    var cue = {};

    [...Array(chara.getMove())].forEach((e, i) => {
      cue[time * i] = () => {
        this.apploach(chara, pos, time, moves);
      };
    });

    this.tl.cue(cue);
  },

  // 目的地へ一歩近づく
  // chara: キャラクター
  // pos: 目標
  // time: 所要時間
  // moves: 計算済み経路探索(あれば)
  apploach: function(chara, pos, time = 0, moves = null) {
    if (chara.pos.equal(pos)) { return false; }

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

    console.log(direction);
    let moveBy = direction.multi(CHIP_SIZE);
    //chara.setPos(chara.pos.add(direction));
    chara.pos = chara.pos.add(direction);
    chara.tl.moveBy(moveBy.x, moveBy.y, time);

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

  // 移動範囲計算
  calRange: function(pos, move, chara = null) {
    let moves = this.calRangeMoves(pos, move, chara);
    var move_range = [];

    moves.forEach((row, y) => {
      row.forEach((p, x) => {
        if (p != Infinity) {
          move_range.push(new Pos(x, y));
        }
      });
    });

    return move_range;
  },

  hitCol: function(pos) {
    let chip_num = this.data.data[pos.y][pos.x];
    return this.data.chip.type[chip_num].hit; 
  },

  // 別陣営のキャラクターにヒットするか
  hitChara: function(pos, chara) {
    if (!chara) {return false;}

    for (var target of this.charas) {
      if (!chara.isCampEqual(target) && pos.equal(target.pos)) {
        return true;
      }
    }

    return false;
  },
});

var Range = enchant.Class.create(enchant.Group, {
  initialize: function(map) {
    this.map = map;
    enchant.Group.call(this);
  },

  clear: function() {
    this.removeAll();
  },

  set_ranges: function(moves = [], attacks = []) {
    this.removeAll();

    moves.forEach(pos => this.drawPos(pos.x, pos.y));
    attacks.forEach(pos => this.drawPos(pos.x, pos.y, COLOR.attack));
  },

  drawPos: function(x, y, color = COLOR.move) {
    var sprite = new Sprite(CHIP_SIZE, CHIP_SIZE);
    sprite.x = CHIP_SIZE * x;
    sprite.y = CHIP_SIZE * y;

    let line = 1;

    // 四角形表示
    var surface = new Surface(CHIP_SIZE, CHIP_SIZE);
    surface.context.fillStyle = color;
    surface.context.fillRect(line, line, CHIP_SIZE - line * 2,  CHIP_SIZE - line * 2);
    sprite.image = surface;
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