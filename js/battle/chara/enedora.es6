var Enedora = enchant.Class.create(BattleChara, {
  brades: [],
  initialize: function(chara, enemy) {
    BattleChara.call(this, chara, enemy);

    this.data = Chara.enedora;
    this.size = {width: 60, height: 60};
    this.main(this.size);
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

  clear: function() {
    // ブレードを削除する
    this.brades.forEach(e => {
      this.removeChild(e);
    });
  },

});