var Enedora = enchant.Class.create(BattleChara, {
  brades: [],
  damaged_frame: 22,
  dead_frame: 23,
  initialize: function(chara, enemy) {
    BattleChara.call(this, chara, enemy);

    this.data = new Chara(CharaData.enedora);
    this.size = {width: 60, height: 60};
    this.main(this.size);
  },

  avoid: function(attack) {
    let tl = this.sprite.tl;
    [...Array(6).keys()].forEach(i => {
      tl = tl.delay(1).then(() => {
        this.frame(16 + i);
      });
    });
    attack.finish();
    this._avoid();
  },

  attack: function(attack, callback) {    
    // アニメーションフラグ初期化
    this.brades = [];
    if (!this.setInitAttack(attack, callback)) { return; }

    var frame = 5;
    frame = this.setCharaStartSkill(attack, frame);

    // 構える
    this.cue[frame] = () => { this.frame(1); };
    frame += 3;
    this.cue[frame] = () => { this.frame(2); };
    frame += 3;
    this.cue[frame] = () => { this.frame(3); };
    frame += 3;

    // このタイミングで発動するスキル表示はあるか
    frame = this.setCharaSkill(attack, frame);
    frame = this.setEnemySkill(attack, frame);

    this.cue[frame] = () => { this.frame(4); };
    frame += 3;
    this.cue[frame] = () => { this.frame(5); };
    frame += 3;

    // ブレードを出す
    this.cue[frame + 10] = () => {
      var brade = new FSprite({width: 60, height: 60});
      brade.setImage(this.data.images.brade);
      this.addChild(brade);

      let pos = this.getEnemyPos();

      brade.x = pos.x;
      brade.y = pos.y - 5;
      brade.scale(1.2, 1.2);
      brade.tl.delay(2).then(() => {
        brade.frame = 1;
      });
      this.brades.push(brade);
    };

    // ダメージ処理
    this.cue[frame + 11] = ()=> {
      this.enemy.battle.damage(attack);
    };

    //マントバサバサ && ブレード出現
    let basa = 3;
    [...Array(10)].forEach(a => {
      this.cue[frame] = () => { this.frame(6); };
      frame += basa;
      this.cue[frame] = () => { this.frame(7); };
      frame += basa;
    });
    frame += 5;

    this.exec();
  },

  critical: function(attack, callback) {    
    var frame = 5;
    frame = this.setCharaStartSkill(attack, frame);

    // 構える
    this.cue[frame] = () => { this.frame(8); };
    frame += 3;
    this.cue[frame] = () => { this.frame(9); };
    frame += 10;

    // クリティカルフラッシュ
    this.cue[frame] = scenes.battle.flash();
    frame += 10;

    // このタイミングで発動するスキル表示はあるか
    frame = this.setCharaSkill(attack, frame);
    frame = this.setEnemySkill(attack, frame);

    this.cue[frame] = () => { this.frame(10); };
    frame += 3;
    this.cue[frame] = () => { this.frame(11); };
    frame += 3;

    // ククククク
    let time = 3;
    [...Array(7)].forEach(a => {
      this.cue[frame] = () => { this.frame(12); };
      frame += time;
      this.cue[frame] = () => { this.frame(13); };
      frame += time;
    });

    // ブレードを出す
    this.cue[frame + 10] = () => {
      var brade = new FSprite({width: 60, height: 60});
      brade.setImage(this.data.images.brade_enemy);
      this.addChild(brade);

      let pos = this.getEnemyPos();

      brade.x = pos.x;
      brade.y = pos.y;
      brade.scale(1.2, 1.2);
      brade.tl.delay(2).then(() => {
        brade.frame = 1;
      }).delay(30).then(() => {
        this.removeChild(brade);
      });
      this.brades.push(brade);
    };

    // ダメージ処理
    this.cue[frame + 11] = ()=> {
      this.enemy.battle.damage(attack);
    };

    // ワハハハハ
    [...Array(12)].forEach(a => {
      this.cue[frame] = () => { this.frame(14); };
      frame += time;
      this.cue[frame] = () => { this.frame(15); };
      frame += time;
    });
    frame += 5;

    this.exec();
  },

  clear: function() {
    // ブレードを削除する
    this.brades.forEach(e => {
      this.removeChild(e);
    });
  },

});