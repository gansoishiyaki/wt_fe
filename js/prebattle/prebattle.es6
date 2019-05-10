var PreBattleScene = enchant.Class.create(enchant.Scene, {
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

    this.on(Event.TOUCH_END, e => {
      // ウィンドウ削除
      game.popScene(this);
    });
  },

  setChara: function(chara, enemy) {
    this.chara = chara;
    

    game.pushScene(this);
  },
});

var PreBattleStatusWindow = enchant.Class.create(enchant.Group, {
  initialize: function(chara) {
    this.chara = chara;
    enchant.Group.call(this);
  },
});