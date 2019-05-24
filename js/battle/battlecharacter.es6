//////////////////////////////
// アニメーション
// この各クラスは、共通関数を持つ
//////////////////////////////
var BattleChara = enchant.Class.create(enchant.Group, {
  height: CHIP_SIZE * 3 - 10,
  is_flip: false,
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
    this.flags = {
      attacked: false,
      damaged: false,
      self_damaged: true,
    };
  },

  main: function(size) {
    this.sprite = new BattleCharaSprite(this.chara, size);
    this.sprite.y = this.height - size.height;
    this.sprite.x = WINDOW.width - size.width - 25;
    this.addChild(this.sprite);
  },

  // 元に戻す
  setInit: function() {
    if (!this.chara.isDead) {
      this.frame(0);
    }

    this.clear();
  },

  /**
   * ## clear
   * 出してたエフェクトなどをしまう。
   */
  clear: function() {},

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
  getEnemyCenterPos: function() {
    let pos = this.enemy.battle.sprite.getCenterPos();
    pos.x = WINDOW.width - pos.x;
    return pos;
  },

  getEnemyPos: function() {
    let pos = this.enemy.battle.sprite.getPos();
    pos.x = WINDOW.width - pos.x - this.enemy.battle.sprite.size.width;
    return pos;
  },

  attack: function(attack, func) {},
  critical: function(attack, func) { this.attack(attack, func);},

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

    // 無効化された場合はレジストへ
    if (attack.is_regist) {
      this.regist(attack);
      return;
    }

    // 被ダメージ画像に変更
    this.frame(this.damaged_frame);

    // ダメージ処理
    this._damage(attack.enemy, attack, attack.damage, attack.finish);

    // 味方への処理
    if(attack.self_damage != 0) {
      // ダメージ処理
      this._damage(attack.chara, attack, attack.self_damage, attack.selfFinish);
    }
  },
  _damage: function(chara, attack, damage, callback) {
    // 被ダメージシェイク
    if (damage > 0) {
      let tl = this.sprite.tl;
      let shake = attack.is_critical ? 8 : 4;
      [...Array(4)].forEach((a, i) => {
        tl = tl.moveBy(random(shake, 2), 0, 1).moveBy(random(shake, 2) * -1, 0, 1);
      });
    }

    if (attack.is_critical) {
      // クリティカルの場合は画面もシェイク
      let etl = chara.battle.window.tl;
      let y = chara.battle.window.y; 

      [...Array(6)].forEach((a, i) => {
        etl = etl.moveBy(0, random(8, 2), 1).moveBy(0, random(8, 2) * -1, 1);
      });
      etl = etl.then(() => { chara.battle.window.y = y; });
    }

    // ダメージの数字
    let pos = chara.battle.sprite.getCenterPos();
    numstr = attack.is_critical ? "yellow" : "";

    // 回復なら緑
    if (damage < 0) { numstr = "green"; }
    let n = damage >= 0 ? damage : damage * -1;
    let number = new CustomNumbers(n, pos.x, pos.y - 40, numstr);
    chara.battle.addChild(number);

    // 左右反転
    if (chara.battle.is_flip) { number.flip();}

    // クリティカル表記
    if (this.is_critical) { 
      number.scaleX *= 1.5;
      number.scaleY *= 1.5
    }

    // ゲージを増減させる
    chara.battleGage.damage(chara, damage, callback);

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
    this._regist(attack);
  },
  _regist: function(attack) {
    // ガードの表記
    let pos = this.sprite.getCenterPos(); 
    let str = new FLabel("Guard!", 14, pos.x, pos.y - 40);
    str.setShadow();
    this.addChild(str);

    // 左右反転
    if (this.is_flip) { str.flip();}

    str.tl
      .moveBy(0, -10, 3)
      .moveBy(0, 5, 3)
      .delay(10)
      .then(() => { attack.finish();})
      .removeFromScene();
  },

  dead: function() {
    this.frame(this.dead_frame);
  },

  exec: function() {
    //攻撃終了か
    this.sprite.tl.cue(this.cue).then(() => {
      // 相手のダメージモーションを元に戻す
      if (this.enemy) { this.enemy.battle.setInit(); }
    }).delay(10).then(() => {
      this.frame(0);
      this.flags.attacked = true;
      this.processEnd();
    }); 
  },

  /**
   * ## processEnd
   * バトルのプロセスが全て終了した時にcallbackを呼ぶ
   */
  processEnd: function() {
    // 全てのフラグが終了済みの場合
    if (Object.keys(this.flags).filter(f => !this.flags[f]).length == 0 ){
      this.callback();
    };
  },

  /**
   * ## setInitAttack
   * バトルアニメーション初期化処理
   * @param attack 
   * @param callback 終了処理
   * @return {Bool} attack処理を続行するか
   */
  setInitAttack: function(attack, callback = null) {
    this.frontMost();
    this.frame(0);
    this.flags.damaged = true;
    this.flags.attacked = false;
    this.flags.self_damaged = true;
    this.cue = {};

    // コールバックセット
    this.callback = callback;

    // ここからは攻撃内容があること前提
    if (!attack) { return; }

    // 相手の構えを元に戻す
    attack.enemy.battle.setInit();

    // ダメージ処理が終了していれば呼ばれる
    // 敵
    this.flags.damaged = false;
    attack.finish = () => {
      this.flags.damaged = true;
      this.processEnd();
    };

    // 味方
    if (attack.self_damage != 0) {
      this.flags.self_damaged = false;
      attack.selfFinish = () => {
        this.flags.self_damaged = true;
        this.processEnd();
      };
    }
    
    // クリティカルの場合はクリティカルモーションに移行
    if (attack.is_critical) {
      this.critical(attack, callback);
      return false;
    }

    return true;
  },

  /**
   * ## showSkillExecEffect 
   * スキル発動エフェクト表示 
   * @param battleChara 
   * @param frame 
   */
  showSkillExecEffect: function(skills, battleChara, frame) {
    this.cue[frame] = () => {
      let right = new FSprite({width: 192, height: 192});
      right.setImage('img/battle/skill.png');
      let pos = battleChara.sprite.getCenterPos();
      right.scaleX = 0.5;
      right.scaleY = 0.5;
      right.x = pos.x - 96;
      right.y = pos.y - 96;
      battleChara.addChild(right);

      let tl = right.tl;
      [...Array(9)].forEach(i => {
        tl = tl.delay(2).then(() => {right.frame++;});
      });
      tl.delay(2).removeFromScene();

      // スキルの起動
      skills.forEach((s, i) => {
        // 発動文字表示
        let print = new PrintSkill(battleChara.chara, s);
        print.y = 0 + i * print.height;
        battleChara.addChild(print);
        console.log(s.name, battleChara.chara, !scenes.battle.isRight(battleChara.chara));
  
        // 文字を移動させる
        print.tl
          .delay(i * 5 + 10)
          .moveBy(print.width * -1, 0, 5)
          .delay(30)
          .moveBy(print.width, 0, 5)
          .removeFromScene();
      });
    };

    return frame + 30;
  },

  /**
   * ## setCharaSkill
   * 攻撃時に発動するスキル 
   * @param attack
   * @param frame 
   */
  setCharaSkill: function(attack, frame) {
    if (!attack || attack.chara_exec.length == 0) {return frame;}

    // スキル発動エフェクト
    frame = this.showSkillExecEffect(attack.chara_exec, attack.chara.battle, frame);

    // スキルの起動
    attack.chara_exec.forEach((s, i) => {
      // 実行関数があれば実行
      if (s.exec) { frame = s.exec(this, frame);};
    });

    return frame + 10;
  },

  /**
   * 攻撃開始前に発動するスキル
   * @param attack 
   * @param frame 
   */
  setCharaStartSkill: function(attack, frame) {
    if (!attack || attack.chara_start_exec.length == 0) {return frame;}

    // スキル発動エフェクト
    frame = this.showSkillExecEffect(attack.chara_start_exec, attack.chara.battle, frame);
    return frame + 10;
  },

  /**
   * ## setEnemySkill
   * 攻撃開始前に敵が発動するスキル 
   * @param attack 
   * @param frame 
   * @return {Int} frame
   */
  setEnemySkill: function(attack, frame) {
    if (!attack || attack.enemy_exec.length == 0) {return frame;}

    // スキル発動エフェクト
    frame = this.showSkillExecEffect(attack.enemy_exec, attack.enemy.battle, frame);

    // スキルの起動
    attack.enemy_exec.forEach((s, i) => {
      // 実行関数があれば実行
      if (s.exec) { frame = s.exec(attack, frame);};
    });

    return frame + 10; 
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

  getPos: function() {
    return new Pos(this.x, this.y);
  },
});