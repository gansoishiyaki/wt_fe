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

var BattleStatusWindow = enchant.Class.create(enchant.Group, {
  initialize: function(chara, enemy) {
    enchant.Group.call(this);
    
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
  }
});

var BattleHPGage = enchant.Class.create(enchant.Group, {
  initialize: function(chara) {
    enchant.Group.call(this);

    [...Array(chara.maxhp).keys()].forEach(i => {

    });
  },
});