//////////////////////////////
// アニメーション
// この各クラスは、共通関数を持つ
//////////////////////////////

var Hyrein = enchant.Class.create(enchant.Group, {
  height: CHIP_SIZE * 4,
  initialize: function(chara, enemy) {
    enchant.Group.call(this);

    this.y = CHIP_SIZE * 3;
  },
});