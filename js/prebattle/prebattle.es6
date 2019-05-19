var PreBattleScene = enchant.Class.create(enchant.Scene, {
  start_flag: false,
  initialize: function() {
    enchant.Scene.call(this);

    // 黒背景
    this.back = new Square(WINDOW.width, WINDOW.height);
    this.back.opacity = 0.5;
    this.addChild(this.back);

    // window表示
    this.main = new Group();
    this.main.x = this.margin;
    this.main.y = this.margin * 8;
    this.addChild(this.main);

    // button表示
    this.button = new FButton("戦闘開始", 40, 350, 160);
    this.addChild(this.button);

    this.button.on(Event.TOUCH_END, e => {
      this.start_flag = true;
      game.popScene(this);
      scenes.battle.setChara(this.player, this.enemy);
    });

    // キャンセル
    this.on(Event.TOUCH_END, e => {
      if (this.start_flag) {return;}
      // ウィンドウ削除
      game.popScene(this);
    });
  },

  setChara: function(player, enemy) {
    this.start_flag = false;
    
    this.player = player;
    this.enemy = enemy;

    let margin = 40;
    let width = 100;
    let y = margin + CHIP_SIZE * 1.5;
    let height = MAP.height * CHIP_SIZE - margin * 2;

    // 右側: プレイヤー側のステータス
    this.player_window = new PreBattleStatusWindow(player, enemy, width, height);
    this.player_window.x = WINDOW.width - width;
    this.player_window.y = y;
    this.addChild(this.player_window);
    
    // 左側: 相手側のステータス
    this.enemy_window = new PreBattleStatusWindow(enemy, player, width, height);
    this.enemy_window.y = y;
    this.addChild(this.enemy_window);

    game.pushScene(this);
  },
});

var PreBattleStatusWindow = enchant.Class.create(enchant.Group, {
  margin: 10,
  initialize: function(chara, enemy, width, height) {
    this.chara = chara;
    this.isContainAttackRange = scenes.map.isContainAttackRange(chara, enemy.pos);
    enchant.Group.call(this);

    this.window = new GradSquare(width, height, chara.getColors());
    this.addChild(this.window);

    // 名前
    this.name_text = new FLabel(chara.data.name, 13, 7, 7);
    this.name_text.setShadow();
    this.addChild(this.name_text);
    if (chara.is_player()) {
      this.name_text.x = width - 6;
      this.name_text.alignRight();
    }

    // 顔グラ表示
    this.image = new Sprite(50, 50);
    this.image.image = game.assets[`img/chara/status/${chara.data.id}.png`]; 
    this.image.y = 25;
    this.addChild(this.image);
    
    // 左右で向きが異なる
    if (!chara.is_player()) {this.image.scaleX = -1;}
    this.image.x = chara.is_player() ? width - this.margin - 50 : this.margin;

    // トリガー名
    this.skill_text = new FLabel(chara.trigger().pre_name, 11, this.margin, height - 20);
    this.skill_text.setShadow();
    this.addChild(this.skill_text);
    if (chara.is_player()) {
      this.skill_text.x = width - this.margin;
      this.skill_text.alignRight();
    }

    // ステータス
    this.status = new Group();
    this.status.x = this.margin;
    this.status.y = 100;
    this.addChild(this.status);

    // 表示パラメータ
    let param_strs = ["ＨＰ", "威力", "命中", "必殺"];
    let params = [
      chara.hp,
      chara.getPower(scenes.map, enemy),
      chara.getHit(scenes.map, enemy),
      chara.getCri(scenes.map, enemy)
    ];

    param_strs.forEach((param_str, i) => {
      // ステータスラベル
      var height = i * 20;
      var status_label = new FLabel(param_str, 12, 0, height);
      status_label.setShadow();
      this.status.addChild(status_label);

      var num_str = "";

      if (param_str == "威力" && chara.isMoreAttack(scenes.map, enemy)) {
        num_str = "yellow";
      }

      if (param_str == "ＨＰ" || this.isContainAttackRange) {
        var number = new CustomNumbers(params[i], width - this.margin * 2, height - 1, num_str);
        number.alignRight();
        this.status.addChild(number);
      } else {
        // 攻撃できない位置関係の時は表示しない
        var number = new FLabel("--", 12, width - this.margin * 3 + 3, height);
        number.setShadow();
        number.alignCenter();
        this.status.addChild(number);
      }
    });
  },
});