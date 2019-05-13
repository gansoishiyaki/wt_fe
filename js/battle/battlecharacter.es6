//////////////////////////////
// アニメーション
// この各クラスは、共通関数を持つ
//////////////////////////////

var BattleChara = enchant.Class.create(enchant.Group, {
  height: CHIP_SIZE * 3 - 10,
  is_flip: false,
  initialize: function(chara, enemy) {
    enchant.Group.call(this);

    this.chara = chara;
    this.enemy = enemy;
    this.chara.battle = this;
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
    this.is_flip = true;
    this.x += WINDOW.width;
  },

  getEnemyPos: function() {
    let pos = this.enemy.battle.sprite.getCenterPos();
    pos.x = WINDOW.width - pos.x;
    return pos;
  },

  attack: function(attack, func) {},
  critical: function(attack, func) { attack(func);},
  damage: function(attack) {
    // 攻撃が当たっていない場合は回避へ
    if (!attack.is_hit) {
      this.avoid();
      return;
    }

    this.frame(0);

    // 被ダメージシェイク
    let tl = this.sprite.tl;
    [...Array(4)].forEach((a, i) => {
      tl = tl.moveBy(random(4, 2), 0, 1).moveBy(random(4, 2) * -1, 0, 1);
    });

    // ダメージの数字
    let pos = this.sprite.getCenterPos();
    numstr = attack.is_critical ? "yellow" : "";
    let number = new CustomNumbers(attack.damage, pos.x, pos.y - 40, numstr);
    this.addChild(number);

    // 左右反転
    if (this.is_flip) { number.flip();}

    // クリティカル表記
    if (this.is_critical) { 
      number.scaleX *= 1.5;
      number.scaleY *= 1.5
    }

    // ゲージを減らす
    this.chara.battleGage.damage(attack);

    number.tl.moveBy(0, -10, 3).moveBy(0, 5, 3).delay(10).removeFromScene();
  },

  avoid: function() {
    this.frame(0);

    // missの表記
    let pos = this.sprite.getCenterPos(); 
    let str = new FLabel("Miss!", 14, pos.x, pos.y - 40);
    str.setShadow();
    this.addChild(str);

    // 左右反転
    if (this.is_flip) { str.flip();}

    str.tl.moveBy(0, -10, 3).moveBy(0, 5, 3).delay(10).removeFromScene();
  },

  dead: function() {},
});

var BattleCharaSprite = enchant.Class.create(enchant.Group, {
  initialize: function(chara, size) {
    enchant.Group.call(this, size);

    this.chara = chara;
    this.size = size;
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

  attack: function(attack, callback) {
    // 最前面に配置
    this.frontMost();

    // 構える
    var cue = {
      5: () => { this.frame(1) }
    };

    var bards = [];
    var bard = () => {
      var bard = new Sprite(30, 30);
      bard.image = game.assets[this.chara.data.images.bard];
      bard.frame = random(3);
      bard.x = this.sprite.x + 25 + random(40);
      bard.y = this.sprite.y + random(-60, 40);
      bard.scaleX = 0.5;
      bard.scaleY = 0.5;
      this.addChild(bard);
      bards.push(bard);

      bard.tl.delay(3).then(() => {
        bard.frame = random(3);
      }).loop();
      bard.tl
        .moveBy(0, 3, 10, enchant.Easing.QUAD_EASEINOUT)
        .moveBy(0, -3, 10, enchant.Easing.QUAD_EASEINOUT)
        .loop();
    };

    //マントバサバサ && 鳥さん飛ばす
    var frame = 12;
    let basa = 2;
    [...Array(6)].forEach(a => {
      cue[frame] = () => { this.frame(2); bard(); bard(); bard(); bard(); bard(); };
      frame += basa;
      cue[frame] = () => { this.frame(3); bard(); bard(); bard(); bard(); bard(); };
      frame += basa;
    });

    frame += 5;
    cue[frame] = () => { this.frame(4); };

    frame +=5;
    cue[frame] = () => { this.frame(5); };

    // 鳥さんを敵に飛ばす
    // 目標地点
    var target = this.getEnemyPos();
    target.x = - 50;
    cue[frame] = () => {
      bards.forEach(bard => {
        // ふわっと移動させて画面から消す
        bard.tl
          .moveTo(target.x, target.y, 15, enchant.Easing.QUAD_EASEINOUT)
          .removeFromScene();
      });
    };

    cue[frame + 26] = () => {
      this.enemy.battle.damage(attack);
    };

    // 再びバサバサ
    frame += 5;
    [...Array(10)].forEach(a => {
      cue[frame] = () => { this.frame(6); };
      frame += basa;
      cue[frame] = () => { this.frame(7); };
      frame += basa;
    });

    // ダメージと攻撃判定両方終了していれば次へ
    var process_end = () => {
      if (attacked && damaged) {
        callback();
      };
    };

    //攻撃終了か
    var damaged = attack.is_hit ? false : true;
    var attacked = false;
    attack.finish = () => {
      damaged = true;
      process_end();
    };


    this.sprite.tl.cue(cue).delay(10)
    .then(() => {
      this.frame(0);
      attacked = true;
      process_end();
    });

    
  },
});