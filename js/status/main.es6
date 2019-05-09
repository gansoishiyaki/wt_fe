var StatusScene = enchant.Class.create(enchant.Scene, {
  initialize: function() {
    enchant.Scene.call(this);
  },

  setChara: function(chara) {
    this.chara = chara;
    game.pushScene(this);
  },
});