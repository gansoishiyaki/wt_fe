var BattleScene = enchant.Class.create(enchant.Scene, {
  initialize: function() {
    enchant.Scene.call(this);

    // 黒背景
    this.back = new Square(WINDOW.width, WINDOW.height);
    this.back.opacity = 0.7;
    this.addChild(this.back);
  },

  setChara: function(player, enemy) {
    this.player = player;
    this.enemy = enemy;
    game.pushScene(this);
  },
});
