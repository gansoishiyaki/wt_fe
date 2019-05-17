var Hyrein = enchant.Class.create(BattleChara, {
  bards: [],
  fishs: [],
  damaged_frame: 17,
  dead_frame: 18,
  initialize: function(chara, enemy) {
    BattleChara.call(this, chara, enemy);

    this.data = Chara.hyrein;
    this.size = {width: 60, height: 58};
    this.main(this.size);
  },

  attack: function(attack, callback) {
    // アニメーションフラグ初期化
    this.bards = [];
    if (!this.setInitAttack(attack, callback)) { return; }

    var frame = 5;

    // 構える
    this.cue[frame] = () => { this.frame(1); };

    // このタイミングで発動するスキル表示はあるか
    frame = this.setCharaStartSkill(attack, frame);
    frame = this.setEnemySkill(attack, frame);

    //マントバサバサ && 鳥さん飛ばす
    let basa = 3;
    [...Array(6)].forEach(a => {
      this.cue[frame] = () => { this.frame(2); this.bard(); this.bard(); this.bard(); this.bard(); this.bard(); };
      frame += basa;
      this.cue[frame] = () => { this.frame(3); this.bard(); this.bard(); this.bard(); this.bard(); this.bard(); };
      frame += basa;
    });
    frame += 5;

    this.cue[frame] = () => { this.frame(4); };
    frame += 5;

    this.cue[frame] = () => { this.frame(5); };
    frame += 1;

    // 鳥さんを敵に飛ばす
    // 目標地点
    this.cue[frame] = () => { this.moveBard(); };

    // ダメージ処理
    this.cue[frame + 27] = ()=> {
      this.enemy.battle.damage(attack);
    };

    // 再びバサバサ
    frame += 5;
    [...Array(10)].forEach(a => {
      this.cue[frame] = () => { this.frame(6); };
      frame += basa;
      this.cue[frame] = () => { this.frame(7); };
      frame += basa;
    });

    this.exec();
  },

  critical: function(attack, callback) {
    // 構える
    this.cue[5] = () => { this.frame(8);}; 

    // 後ろを向く
    var frame = 8;
    this.cue[frame] = () => { this.frame(9); };
    frame += 3;
    this.cue[frame] = () => { this.frame(10); };
    frame += 3;
    this.cue[frame] = () => { this.frame(11); };
    frame += 8;

    // クリティカルフラッシュ
    this.cue[frame] = scenes.battle.flash();
    frame += 10;

    // このタイミングで発動するスキル表示はあるか
    frame = this.setCharaStartSkill(attack, frame);
    frame = this.setEnemySkill(attack, frame);
    frame += 5;

    // 鳥さんをだす
    this.cue[frame] = () => {
      [...Array(300)].forEach(e => {this.bard(100, 0.75);});
    }
    frame += 5;

    this.cue[frame] = () => { this.frame(12); };
    frame += 3;
    this.cue[frame] = () => { this.frame(13); };
    frame += 3;
    this.cue[frame] = () => { this.frame(14); };

    // 鳥さんを敵に飛ばす
    // 目標地点
    this.cue[frame + 1] = () => { this.moveBard(60, true); }; 

    frame += 25;

    // ダメージ処理
    this.cue[frame + 25] = () => {
      this.enemy.battle.damage(attack);
    };

    // 再びバサバサ
    var basa = 2;
    [...Array(20)].forEach(a => {
      this.cue[frame] = () => { this.frame(15); };
      frame += basa;
      this.cue[frame] = () => { this.frame(16); };
      frame += basa;
    });

    this.exec();
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

  fish: function(attack, frame) {
    this.cue[frame] = () => { attack.enemy.battle._fish(); };

    return frame;
  },

  _fish: function(chara) {

    this.frame(4);

    let pos = this.sprite.getCenterPos();

    // 魚をブワッとだす
    this.tl.delay(10).then(() => {
      this.fishs = [...Array(100)].map(i => {
        var fish = new FSprite({width: 30, height: 30});
        fish.setImage(this.data.images.fish);
        let x = pos.x - this.size.width / 2 - 5;
        fish.x = x;
        let rand = -10 + random(20); 
        fish.y = pos.y + rand - 15;
        fish.scaleX = 0.15;
        fish.scaleY = 0.15;
        let y = fish.y;
        let movex = this.size.width / 2 + 20;
        let movey = rand * 2;
        let speed = random(5, 40);
  
        fish.tl
          .fadeIn(1)
          .moveBy(movex / 2, movey, speed, enchant.Easing.SIN_EASEIN)
          .and()
          .scaleTo(0.4, 0.4, speed, enchant.Easing.SIN_EASEIN)
          .moveBy(movex / 2, -movey, speed, enchant.Easing.SIN_EASEOUT)
          .and()
          .scaleTo(0.15, 0.15, speed, enchant.Easing.SIN_EASEOUT)
          .fadeOut(1)
          .moveTo(x, y, 1)
          .loop();
  
        this.addChild(fish);
        return fish;
      });
    });
  },

  clear: function() {
    // 魚を削除する
    this.fishs.forEach(fish => {
      fish.tl.removeFromScene();
    });
  },
});