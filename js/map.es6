var FMap = enchant.Class.create(enchant.Scene, {
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
    this.enemies = data.enemies.map(enemy => {
      var chara = new Charactor(enemy.chara, true);
      chara.setPos(enemy.x, enemy.y);
      this.field.addChild(chara);
      return chara;
    });

    this.players = data.players.map((player, i) => {
      var chara = new Charactor(party[i]);
      chara.setPos(player.x, player.y);
      this.field.addChild(chara);
      return chara;
    });
  },

  set_chara: function(chara) {
    this.status.set_chara(chara);
    this.calRange(chara);
    this.ranges.set_ranges(chara);
  },

  // 移動範囲計算
  calRange: function(chara) {
    chara.range.moves = [];
    chara.range.attacks = [];

    // 0のマップ分の配列を作成する
    var moves = [...Array(MAP.height)].map(i => {
      return [...Array(MAP.width)].map(i => 99);
    });

    moves[chara.pos.y][chara.pos.x] = 0;
    var poss = [[{x: chara.pos.x, y: chara.pos.y}]];
    chara.range.moves.push({x: chara.pos.x, y: chara.pos.y});

    [...Array(chara.getMove())].forEach((e, i) => {
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
            chara.range.moves.push({x: x, y: y});
          }
        });
      });
    });

    var attacks = [...Array(MAP.height)].map(i => {
      return [...Array(MAP.width)].map(i => 99);
    });

    chara.range.moves.forEach(pos => {
      chara.data.main_trigger.range.forEach(d => {
        let x = pos.x + d.x;
        let y = pos.y + d.y;

        // マイナスは処理しない
        if (x < 0 || y < 0) { return; }
        if (x >= MAP.width || y >= MAP.height) {return;}
        
        // 移動範囲に入っていない場合
        if (moves[y][x] == 99 && attacks[y][x] == 99 && !this.hitCol(x, y)) {
          attacks[y][x] = 1;
          chara.range.attacks.push({x: x, y: y});
        }
      });
    });
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

  set_ranges: function(chara) {
    this.removeAll();

    chara.range.moves.forEach(pos => this.drawPos(pos.x, pos.y));
    chara.range.attacks.forEach(pos => this.drawPos(pos.x, pos.y, COLOR.attack));
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
    let filename = chara.is_enemy ? "enemy_mini_status" : "mini_status";
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

var Gage = enchant.Class.create(enchant.Group, {
  initialize: function(filename, x, y, width, height){
    enchant.Group.call(this);

    let image = game.assets[`img/system/${filename}.png`];

    this.x = x;
    this.y = y;

    this.left = new Sprite(GAGE.width, height);
    this.left.image = image;
    this.addChild(this.left);

    this.right = new Sprite(GAGE.width, height);
    this.right.image = image;
    this.right.x = width - GAGE.width;
    this.right.frame = 2;
    this.addChild(this.right);

    this.main = new Sprite(GAGE.width, height);
    this.main.image = image;
    this.main.scale((width - GAGE.width * 2)/GAGE.width, 1);
    this.main.x = (this.main.scaleX + 1) * GAGE.width / 2;
    this.main.frame = 1;
    this.addChild(this.main);
  },
});