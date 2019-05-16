//////////////////////////////
// アニメーション
// この各クラスは、共通関数を持つ
//////////////////////////////
var BattleChara = enchant.Class.create(enchant.Group, {
  height: CHIP_SIZE * 3 - 10,
  is_flip: false,
  attacked: false,
  damaged: false,
  avoid_frame: 0,
  damaged_frame: 0,
  dead_frame: 0,
  callback: () => {},
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

  /**
   * ## frame
   * フレーム数をセットする
   * @param {Int} i フレーム数
   */
  frame: function(i) {
    this.sprite.main.frame = i;
  },

  // 相手側の場合は反転して表示する
  /**
   * ## setFlip
   * 反転して表示する
   */
  setFlip: function() {
    this.scaleX = -1;
    this.is_flip = true;
    this.x += WINDOW.width;
  },

  /**
   * ## getEnemyPos
   * 左右反転した相手の座標を取得する
   * @return {Pos} 座標
   */
  getEnemyPos: function() {
    let pos = this.enemy.battle.sprite.getCenterPos();
    pos.x = WINDOW.width - pos.x;
    return pos;
  },

  attack: function(attack, func) {},
  critical: function(attack, func) { attack(func);},

  /**
   * ## attack
   * 共通関数
   * @param {BattleAttack} attack 攻撃情報
   */
  damage: function(attack) {
    if(!attack) { return; }

    // 攻撃が当たっていない場合は回避へ
    if (!attack.is_hit) {
      this.avoid(attack);
      return;
    }

    this.frame(this.damaged_frame);
    this._damage(attack);
  },
  _damage: function(attack) {
    // 被ダメージシェイク
    let tl = this.sprite.tl;
    let shake = attack.is_critical ? 8 : 4;
    [...Array(4)].forEach((a, i) => {
      tl = tl.moveBy(random(shake, 2), 0, 1).moveBy(random(shake, 2) * -1, 0, 1);
    });

    if (attack.is_critical) {
      // クリティカルの場合は画面もシェイク
      let etl = attack.enemy.battle.window.tl;
      let y = attack.enemy.battle.window.y; 

      [...Array(6)].forEach((a, i) => {
        etl = etl.moveBy(0, random(8, 2), 1).moveBy(0, random(8, 2) * -1, 1);
      });
      etl = etl.then(() => { attack.enemy.battle.window.y = y; });
    }

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

  /**
   * ## avoid
   * 回避 共通関数
   */
  avoid: function(attack) {
    this.frame(this.avoid_frame);
    attack.finish();
    this._avoid();
  },
  _avoid: function(attack) {
    // missの表記
    let pos = this.sprite.getCenterPos(); 
    let str = new FLabel("Miss!", 14, pos.x, pos.y - 40);
    str.setShadow();
    this.addChild(str);

    // 左右反転
    if (this.is_flip) { str.flip();}

    str.tl.moveBy(0, -10, 3).moveBy(0, 5, 3).delay(10).removeFromScene();
  },

  /**
   * ## regist
   * 攻撃無効 or 0 damage
   */
  regist: function(attack) {
    this.frame(0);
    attack.finish();
    this._regist();
  },
  _regist: function(attack) {
    // ガードの表記
    let pos = this.sprite.getCenterPos(); 
    let str = new FLabel("Guard!", 14, pos.x, pos.y - 40);
    str.setShadow();
    this.addChild(str);

    // 左右反転
    if (this.is_flip) { str.flip();}

    str.tl.moveBy(0, -10, 3).moveBy(0, 5, 3).delay(10).removeFromScene();

  },

  dead: function() {
    this.frame(this.dead_frame);
  },

  exec: function(cue) {
    //攻撃終了か
    this.sprite.tl.cue(cue).delay(10)
    .then(() => {
      this.frame(0);
      this.attacked = true;
      this.process_end();
    }); 
  },

  process_end: function() {
    if (this.attacked && this.damaged) {
      this.callback();
    };
  },

  setDamageEnd: function(attack) {
    if (!attack) { return; }
    // ダメージ処理が終了していれば呼ばれる

    this.damaged = false;
    attack.finish = () => {
      this.damaged = true;
      this.process_end();
    };
  },
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
  bards: [],
  damaged_frame: 17,
  dead_frame: 18,
  initialize: function(chara, enemy) {
    BattleChara.call(this, chara, enemy);

    this.data = Chara.hyrein;
    this.size = {width: 60, height: 58};
    this.main(this.size);
  },

  attack: function(attack, callback) {
    // 最前面に配置
    this.frontMost();
    this.damaged = true;
    this.attacked = false;
    this.callback = callback;
    this.setDamageEnd(attack);

    this.bards = [];

    if (attack) {
      // 相手の構えを元に戻す
      attack.enemy.battle.frame(0);
    }

    if (attack && attack.is_critical) {
      this.critical(attack, callback);
      return;
    }

    // 構える
    var cue = {
      5: () => { this.frame(1) }
    };

    //マントバサバサ && 鳥さん飛ばす
    var frame = 12;
    let basa = 3;
    [...Array(6)].forEach(a => {
      cue[frame] = () => { this.frame(2); this.bard(); this.bard(); this.bard(); this.bard(); this.bard(); };
      frame += basa;
      cue[frame] = () => { this.frame(3); this.bard(); this.bard(); this.bard(); this.bard(); this.bard(); };
      frame += basa;
    });

    frame += 5;
    cue[frame] = () => { this.frame(4); };

    frame +=5;
    cue[frame] = () => { this.frame(5); };

    // 鳥さんを敵に飛ばす
    // 目標地点
    cue[frame + 1] = () => { this.moveBard(); }; 

    // ダメージ処理
    cue[frame + 28] = () => {
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

    this.exec(cue);
  },

  critical: function(attack, callback) {
    // 構える
    var cue = {
      5: () => { this.frame(8); }
    };

    // 鳥さんをだす
    cue[0] = () => {
      [...Array(300)].forEach(e => {this.bard(100, 0.75);});
    }

    // 後ろを向く
    var frame = 8;
    cue[frame] = () => { this.frame(9); };
    frame += 3;
    cue[frame] = () => { this.frame(10); };
    frame += 3;
    cue[frame] = () => { this.frame(11); };
    frame += 8;

    cue[frame] = scenes.battle.flash();
    frame += 25;

    cue[frame] = () => { this.frame(12); };
    frame += 3;
    cue[frame] = () => { this.frame(13); };
    frame += 3;
    cue[frame] = () => { this.frame(14); };

    // 鳥さんを敵に飛ばす
    // 目標地点
    cue[frame + 1] = () => { this.moveBard(60, true); }; 

    frame += 25;

    // ダメージ処理
    cue[frame + 25] = () => {
      this.enemy.battle.damage(attack);
    };

    // 再びバサバサ
    var basa = 2;
    [...Array(20)].forEach(a => {
      cue[frame] = () => { this.frame(15); };
      frame += basa;
      cue[frame] = () => { this.frame(16); };
      frame += basa;
    });

    this.exec(cue);
  },

  bard: function(x = 25, scale = 0.5) {
    var bard = new Sprite(30, 30);
    bard.image = game.assets[this.data.images.bard];
    bard.frame = random(3);
    bard.x = this.sprite.x + x + random(40);
    bard.y = this.sprite.y + random(-60, 40);
    bard.scaleX = scale;
    bard.scaleY = scale;
    this.addChild(bard);
    this.bards.push(bard);

    bard.tl.delay(3).then(() => {
      bard.frame = random(3);
    }).loop();
    bard.tl
      .moveBy(0, 3, 10, enchant.Easing.QUAD_EASEINOUT)
      .moveBy(0, -3, 10, enchant.Easing.QUAD_EASEINOUT)
      .loop();
  },

  moveBard: function(time = 15, rand = false) {
    var target = this.getEnemyPos();
    target.x = rand ? -300 : -30;

    this.bards.forEach(bard => {
      // ふわっと移動させて画面から消す
      let y = rand ? target.y - 30 + random(60) : target.y;
      let t = rand ? time - 30 + random(100) : time;
      bard.tl
        .moveTo(target.x, y, t, enchant.Easing.QUAD_EASEINOUT)
        .removeFromScene();
    });
  },
});