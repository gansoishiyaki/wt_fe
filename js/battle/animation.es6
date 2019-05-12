//////////////////////////////
// アニメーション
// この各クラスは、共通関数を持つ
//////////////////////////////

var BattleChara = enchant.Class.create(enchant.Group, {
  height: CHIP_SIZE * 4 - 10,
  initialize: function(chara, enemy) {
    enchant.Group.call(this);

    this.chara = chara;
    this.chara.battle = this;
    this.enemy = enemy;
    this.y = CHIP_SIZE * 3;
  },

  main: function(size) {
    this.sprite = new BattleCharaSprite(this.chara, size);
    this.sprite.y = this.height - size.height;
    this.sprite.x = WINDOW.width - size.width - 25;
    this.addChild(this.sprite);
  },

  frame: function(i) {
    this.sprite.main.frame = i;
  },

  // 相手側の場合は反転して表示する
  setEnemy: function() {
    this.scaleX = -1;
    this.x += WINDOW.width;
  },

  getEnemyPos: function() {
    return this.enemy.battle.sprite.getCenterPos();
  },

  attack: function(func) {},
  critical: function(func) { attack(func);},
});

var BattleCharaSprite = enchant.Class.create(enchant.Group, {
  initialize: function(chara, size) {
    this.size = size;
    enchant.Group.call(this, size);

    this.chara = chara;
    this.main = new Sprite(size.width, size.height);
    this.main.image = game.assets[`img/chara/battle/${this.chara.data.id}.png`];
    this.addChild(this.main); 
  },

  getCenterPos: function() {
    return new Pos(this.x + this.size.width / 2, this.y + this.size.height / 2);
  },
});

var Hyrein = enchant.Class.create(BattleChara, {
  initialize: function(chara, enemy) {
    BattleChara.call(this, chara, enemy);

    this.size = {width: 52, height: 58};
    this.main(this.size);
  },

  attack: function(callback) {
    // 構える
    var cue = {
      5: () => { this.frame(1) }
    };

    var bards = [];
    var bard = () => {
      var bard = new Sprite(30, 30);
      bard.image = game.assets[this.chara.data.images.bard];
      bard.frame = ramdom(3);
      bard.x = this.sprite.x + 25 + ramdom(40);
      bard.y = this.sprite.y + ramdom(-60, 40);
      bard.scaleX = 0.5;
      bard.scaleY = 0.5;
      this.addChild(bard);
      bards.push(bard);

      bard.tl.delay(3).then(() => {
        bard.frame = ramdom(3);
      }).loop();
      bard.tl
        .moveBy(0, 3, 10, enchant.Easing.QUAD_EASEINOUT)
        .moveBy(0, -3, 10, enchant.Easing.QUAD_EASEINOUT)
        .loop();
    };

    //マントバサバサ && 鳥さん飛ばす
    var frame = 12;
    [...Array(6)].forEach(a => {
      cue[frame] = () => { this.frame(2); bard(); };
      frame += 2;
      cue[frame] = () => { this.frame(3); bard(); bard() };
      frame += 2;
    });

    frame += 5;
    cue[frame] = () => { this.frame(4); };

    frame +=5;
    cue[frame] = () => { this.frame(5); };

    // 鳥さんを敵に飛ばす
    // 目標地点
    var target = this.getEnemyPos();
    target.x = - 50;
    cue[frame + 10] = () => {
      bards.forEach(bard => {
        // ふわっと移動させて画面から消す
        bard.tl
          .moveTo(target.x, target.y, 15, enchant.Easing.QUAD_EASEINOUT)
          .removeFromScene();
      });
    };

    // 再びバサバサ
    frame += 5;
    [...Array(10)].forEach(a => {
      cue[frame] = () => { this.frame(6); };
      frame += 2;
      cue[frame] = () => { this.frame(7); };
      frame += 2;
    });

    this.sprite.tl.cue(cue).delay(10).then(callback);
  },
});