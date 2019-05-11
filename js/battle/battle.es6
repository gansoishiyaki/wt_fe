var BattleScene = enchant.Class.create(enchant.Scene, {
  initialize: function() {
    enchant.Scene.call(this);

    // 黒背景
    this.back = new Square(WINDOW.width, WINDOW.height);
    this.back.opacity = 0.7;
    this.addChild(this.back);

    // header
    this.header = new Square(WINDOW.width, CHIP_SIZE * 3);
    this.addChild(this.header);

    // footer
    this.footer = new Square(WINDOW.width, CHIP_SIZE);
    this.footer.y = CHIP_SIZE * 10;
    this.addChild(this.footer);
  },

  setChara: function(player, enemy) {
    this.player = player;
    this.enemy = enemy;

    this.player_window = new BattleStatusWindow(player, enemy);
    this.player_window.x = WINDOW.width / 2;
    this.addChild(this.player_window);

    this.enemy_window = new BattleStatusWindow(enemy, player);
    this.addChild(this.enemy_window);

    game.pushScene(this);
  },
});

/////////////////////////
// バトル予測ステータス画面
/////////////////////////
var BattleStatusWindow = enchant.Class.create(enchant.Group, {
  initialize: function(chara, enemy) {
    enchant.Group.call(this);
    
    // 攻撃できる位置か
    this.isContainAttackRange = scenes.map.isContainAttackRange(chara, enemy.pos);

    let width = WINDOW.width / 2;
    let height = CHIP_SIZE * 3;
    this.y = CHIP_SIZE * 7;

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

    // トリガー名
    this.skill_text = new FLabel(chara.trigger().pre_name, 11, 7, 25);
    this.skill_text.setShadow();
    this.addChild(this.skill_text);
    if (chara.is_player()) {
      this.skill_text.x = width - 7;
      this.skill_text.alignRight();
    }

    // ゲージ
    this.gage = new BattleHPGage(chara);
    this.gage.y = 40;
    this.gage.x = 7;
    this.addChild(this.gage);

    // ステータス
    this.status = new Group();
    this.status.x = 10;
    this.status.y = 73;
    this.addChild(this.status);

    // 表示パラメータ
    let param_strs = ["威力", "命中", "必殺"];
    let params = [
      chara.getPower(enemy),
      chara.getHit(enemy),
      chara.getCri(enemy)
    ];

    param_strs.forEach((param_str, i) => {
      // ステータスラベル
      var status_height = i * 15;
      var status_label = new FLabel(param_str, 11, 0, status_height);
      status_label.setShadow();
      this.status.addChild(status_label);

      var num_str = "";

      if (param_str == "威力" && chara.isMoreAttack(enemy)) {
        num_str = "yellow";
      }

      if (this.isContainAttackRange) {
        var number = new CustomNumbers(params[i], width - 20, status_height - 1, num_str);
        number.alignRight();
        this.status.addChild(number);
      } else {
        // 攻撃できない位置関係の時は表示しない
        var number = new FLabel("--", 12, width - 27, status_height);
        number.setShadow();
        number.alignCenter();
        this.status.addChild(number);
      }
    });
  }
});

/////////////////////////
// HPゲージ
/////////////////////////
var BattleHPGage = enchant.Class.create(enchant.Group, {
  initialize: function(chara) {
    enchant.Group.call(this);

    let size = {width: 2, height: 8};

    var gages = [...Array(chara.maxhp).keys()].map(i => {
      let x = i % 36 * (size.width + 1);
      let y = Math.floor(i / 36) * (size.height + 1);

      var base = new Square(size.width, size.height);
      base.x = x;
      base.y = y;
      this.addChild(base);
      
      var gage = new Square(size.width, size.height, COLOR.player);
      this.addChild(gage);
      gage.x = x;
      gage.y = y;
      return gage;
    });
  },
});