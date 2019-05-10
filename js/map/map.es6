// 名前空間を作成
var MapScene = enchant.Class.create(enchant.Scene, {
  selectChara: null,
  localPos: null,

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
    this.addChild(this.menu)

    // 敵の表示
    this.enemies = data.enemies.map(enemy => {
      var chara = new MapCharactor(enemy.chara, CampType.enemy);
      chara.setPos(enemy.x, enemy.y);
      this.field.addChild(chara);
      return chara;
    });

    this.players = data.players.map((player, i) => {
      var chara = new MapCharactor(party[i]);
      chara.setPos(player.x, player.y);
      this.field.addChild(chara);
      return chara;
    });

    // カーソル移動時
    this.field.on(Event.TOUCH_MOVE, e => {
      if (this.selectChara) {
        let local_pos = this.calPosByLocal(e.localX, e.localY);

        // 前回位置と異なるマス目にスライドした場合
        // 移動フラグをオンにし、位置を記録する
        if (!this.lastPos.equal(local_pos)) {
          // 移動準備
          if (!this.selectChara.is_move) { this.prePlayerMove(); }

          // 移動できるか
          this.lastPos = local_pos;
          this.movePreSprite(this.lastPos);
        }
      }
    });
  },

  // player側のキャラクターを移動させるための準備
  prePlayerMove: function() {
    var chara = this.selectChara;

    chara.is_move = true;
    let moves = this.calRange(chara.pos, chara.getMove());
    this.ranges.set_ranges(moves, []);

    // 半透明の移動先表示
    let localPos = chara.pos.localPos();
    this.preSprite = chara.mainSprite();
    this.preSprite.x = localPos.x;
    this.preSprite.y = localPos.y;
    this.preSprite.main.opacity = 0.5;
    this.field.addChild(this.preSprite);
  },

  movePreSprite(pos) {
    let localPos = pos.localPos();
    this.preSprite.x = localPos.x;
    this.preSprite.y = localPos.y;
  },

  selectEnd: function() {
    this.selectChara = null;
    this.lastPos = null;
    
    this.field.removeChild(this.preSprite);
  },

  calPosByLocal: function(x, y) {
    return new Pos(Math.floor(x / CHIP_SIZE), Math.floor(y / CHIP_SIZE));
  },

  // キャラクターシングルタップ
  touchedChara: function(chara) {
    this.status.set_chara(chara);

    // 移動範囲計算
    let moves = this.calRange(chara.pos, chara.getMove());

    // 移動範囲から攻撃範囲を計算し、障害物を取り除く
    var attacks = chara.calAttackRange(moves);
    attacks = attacks.filter(pos => !this.hitCol(pos.x, pos.y));

    // 範囲表示
    this.ranges.set_ranges(moves, attacks);
  },

  // 移動範囲計算
  calRange: function(pos, move) {
    var move_range = [];

    // マップ分の配列を作成する
    var moves = Common.getEmptyArray();
    moves[pos.y][pos.x] = 0;

    // poss = 距離ごとに到達領域を保存する
    var poss = [[{x: pos.x, y: pos.y}]];
    move_range.push({x: pos.x, y: pos.y});

    [...Array(move)].forEach((e, i) => {
      poss[i + 1] = [];
      poss[i].forEach(pos => {
        // 指定位置から四方向
        DIRECTIONS.forEach(d => {
          let x = pos.x + d.x;
          let y = pos.y + d.y;

          // マイナスは処理しない
          if (x < 0 || y < 0) { return; }
          if (x >= MAP.width || y >= MAP.height) {return;}

          // 通行可能な場合
          if (!this.hitCol(x, y) && moves[y][x] > i + 1) {
            // 最短距離にする
            moves[y][x] = i + 1;
            poss[i + 1].push({x: x, y: y});
            move_range.push({x: x, y: y});
          }
        });
      });
    });

    return move_range;
  },

  // 衝突チェック
  hitCol: function(x, y) {
    let chip_num = this.data.data[y][x];
    return this.data.chip.type[chip_num].hit;
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
    this.addChild(new Gage("gagebase", this.margin, 12, gage_hp_base_width, GAGE.height));
    this.addChild(new Gage("gagegreen", this.margin, 12, gage_hp_width, GAGE.height));

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