var BattleTaskType = {
  player: 0,
  enemy: 1,
  finish: 2
};

var BattleScene = enchant.Class.create(enchant.Scene, {

  initialize: function() {
    enchant.Scene.call(this);

    // 黒背景と少し白も入れる
    this.back = new Square(WINDOW.width, WINDOW.height);
    this.back.opacity = 0.75;
    this.addChild(this.back);
    this.white = new Square(WINDOW.width, WINDOW.height, "white");
    this.white.opacity = 0.15;
    this.addChild(this.white);

    this.flashback = new Square(WINDOW.width, WINDOW.height, "white");
    this.flashback.opacity = 0;
    this.addChild(this.flashback);

    // header
    this.header = new Square(WINDOW.width, CHIP_SIZE * 2);
    this.addChild(this.header);

    // footer
    this.footer = new Square(WINDOW.width, CHIP_SIZE * 2);
    this.footer.y = CHIP_SIZE * 9;
    this.addChild(this.footer);

    this.main = new Group();
    this.addChild(this.main);
  },

  setChara: function(player, enemy) {
    this.main.removeAll();

    this.player = player;
    this.enemy = enemy;

    // 敵側からの攻撃の時は左右逆転させる
    this.is_flip = enemy.is_player() && !player.is_player();

    this.enemy_animation = this.setAnimation(enemy, player);
    this.main.addChild(this.enemy_animation);

    this.player_animation = this.setAnimation(player, enemy);
    this.main.addChild(this.player_animation);

    this.player_window = new BattleStatusWindow(player, enemy);
    this.main.addChild(this.player_window);

    this.enemy_window = new BattleStatusWindow(enemy, player);
    this.main.addChild(this.enemy_window);

    this.enemy_animation.window = this.enemy_window;
    this.player_animation.window = this.player_window;

    if (this.is_flip) {
      this.enemy_window.x = WINDOW.width / 2;
      this.player_animation.setFlip();
    } else {
      this.player_window.x = WINDOW.width / 2;
      this.enemy_animation.setFlip();
    }

    game.pushScene(this);

    // バトル実行の流れ
    this.cue = [];
    this.cue.push(new BattlePhase(BattleTaskType.player, player, enemy));
    this.cue.push(new BattlePhase(BattleTaskType.enemy, enemy, player));

    if (player.isMoreAttack(enemy)) {
      this.cue.push(new BattlePhase(BattleTaskType.player, player, enemy));
    }
    if (enemy.isMoreAttack(player)) {
      this.cue.push(new BattlePhase(BattleTaskType.enemy, enemy, player));
    }

    this.cue.push(new BattlePhase(BattleTaskType.finish));

    // タスク実行
    var i = 0;
    var exec = () => {
      let phase = this.cue[i];
      var taskType = phase.type;
      i++;

      // 攻撃不可の場合は飛ばす
      if (!phase.isFinish() && 
          !scenes.map.isContainAttackRange(phase.player, phase.enemy.pos)) {
        exec();
        return;
      }

      // どちらかが死んだ場合は攻撃しない
      if (player.isDead() || enemy.isDead()) {
        taskType = BattleTaskType.finish;
      }

      switch(taskType) {
        case BattleTaskType.player:
          // 味方の攻撃
          this.player_animation.attack(phase.attack, () => { exec(); });
          break;
        case BattleTaskType.enemy:
          // 敵の攻撃
          this.enemy_animation.attack(phase.attack, () => { exec(); });
          break;
        case BattleTaskType.finish:
          game.popScene(this);
          scenes.map.finishBattle(player, enemy);
          break;
      }
    };

    exec();
  },

  // キャラクターごとのアニメーションクラスを呼び出す
  setAnimation: function(player, enemy) {
    switch (player.data.id){
      case "hyrein":
        return new Hyrein(player, enemy);
      default:
        return new Hyrein(player, enemy);
    }
  },

  flash: function() {
    return () => {this.flashback.tl.fadeIn(5).fadeOut(5);}
  },

  /**
   * 自分の位置がどちらか確かめる
   * @param chara 
   * @return {Bool} 右側か
   */
  isRight: function(chara) {
    return this.is_flip ? this.enemy === chara : this.player === chara;
  },
});

var BattlePhase = function(type, player = null, enemy = null, beforeAttack = null) {
  this.type = type;
  this.player = player;
  this.enemy = enemy;

  this.isFinish = () => {
    return type == BattleTaskType.finish;
  };

  if (type == BattleTaskType.finish) { return; }
  this.attack = new BattleAttack(player, enemy);

  // 連続攻撃処理
  if (this.attack.is_rengeki) {
    // すでに発動済みの場合は処理しない
    if (beforeAttack && beforeAttack.is_rengeki) { return;}
    scenes.battle.cue.push(new BattlePhase(type, player, enemy, this.attack));
  }
};

/////////////////////////
// 攻撃
// is_hit 命中
// damage 威力
/////////////////////////
var BattleAttack = function(chara, enemy) {
  this.chara = chara;
  this.enemy = enemy;

  this.is_regist = false;
  this.is_rengeki = false;

  // 発動したスキル
  this.chara_start_exec = [];
  this.chara_end_exec = [];
  this.enemy_exec = [];
  this.enemy_before_damage = [];

  // 命中判定
  let hit = chara.getHit(enemy);
  this.is_hit = random(100) <= hit;
  this.damage = chara.getPower(enemy);
  this.self_damage = 0;

  // スキル判定
  chara.skills.filter(s => {
    return s.type == SkillExecType.battle;
  }).filter(s => { s.rate(this);});

  // クリティカル判定
  let cri = chara.getCri(enemy);
  this.is_critical = random(100) <= cri;
  if (this.is_critical) {
    this.damage = this.damage + chara.getPower();
  }

  // 吸収行為があった場合はダメージ分回復させる
  if (this.is_drain) {
    this.self_damage = this.damage * -1;
  }
  
  this.finish = () => {};
  this.selfFinish = () => {};
};

/////////////////////////
// バトル予測ステータス画面
/////////////////////////
var BattleStatusWindow = enchant.Class.create(enchant.Group, {
  initialize: function(chara, enemy) {
    enchant.Group.call(this);
    
    // 攻撃できる位置か
    this.isContainAttackRange = scenes.map.isContainAttackRange(chara, enemy.pos);

    let width = WINDOW.width / 2;
    let height = CHIP_SIZE * 3;
    this.y = CHIP_SIZE * 6;

    this.window = new GradSquare(width, height, chara.getColors());
    this.addChild(this.window);

    // 名前
    this.name_text = new FLabel(chara.data.name, 13, 7, 7);
    this.name_text.setShadow();
    this.addChild(this.name_text);
    if (chara.is_player()) {
      this.name_text.x = width - 6;
      this.name_text.alignRight();
    }

    // トリガー名
    this.skill_text = new FLabel(chara.trigger().pre_name, 11, 7, 25);
    this.skill_text.setShadow();
    this.addChild(this.skill_text);
    if (chara.is_player()) {
      this.skill_text.x = width - 7;
      this.skill_text.alignRight();
    }

    // ゲージ
    this.gage = new BattleHPGage(chara);
    this.gage.y = 40;
    this.gage.x = 7;
    this.addChild(this.gage);

    // ステータス
    this.status = new Group();
    this.status.x = 10;
    this.status.y = 73;
    this.addChild(this.status);

    // 表示パラメータ
    let param_strs = ["威力", "命中", "必殺"];
    let params = [
      chara.getPower(enemy),
      chara.getHit(enemy),
      chara.getCri(enemy)
    ];

    param_strs.forEach((param_str, i) => {
      // ステータスラベル
      var status_height = i * 15;
      var status_label = new FLabel(param_str, 11, 0, status_height);
      status_label.setShadow();
      this.status.addChild(status_label);

      var num_str = "";

      if (param_str == "威力" && chara.isMoreAttack(enemy)) {
        num_str = "yellow";
      }

      if (this.isContainAttackRange) {
        var number = new CustomNumbers(params[i], width - 20, status_height - 1, num_str);
        number.alignRight();
        this.status.addChild(number);
      } else {
        // 攻撃できない位置関係の時は表示しない
        var number = new FLabel("--", 12, width - 27, status_height);
        number.setShadow();
        number.alignCenter();
        this.status.addChild(number);
      }
    });
  }
});

/////////////////////////
// HPゲージ
/////////////////////////
var BattleHPGage = enchant.Class.create(enchant.Group, {
  initialize: function(chara) {
    enchant.Group.call(this);

    this.chara = chara;
    chara.battleGage = this;

    let size = {width: 2, height: 8};

    this.gages = [...Array(chara.maxhp).keys()].map(i => {
      let x = i % 36 * (size.width + 1);
      let y = Math.floor(i / 36) * (size.height + 1);

      var base = new Square(size.width, size.height);
      base.x = x;
      base.y = y;
      this.addChild(base);
      
      var gage = new Square(size.width, size.height, COLOR.player);
      this.addChild(gage);
      gage.x = x;
      gage.y = y;

      if(chara.hp <= i) {
        gage.opacity = 0;
      }

      return gage;
    });

    this.setHP(chara.hp);
  },

  damage: function(chara, damage, callback = null) {
    chara.damage(damage);

    let sa = Math.abs(this.hp - chara.hp);
    var frame = sa >= 10 ? 1 : 2;

    let cue = {};
    [...Array(sa).keys()].forEach(i =>{
      cue[i * frame] = () => {
        let change = this.hp >= chara.hp ? -1 : 1;
        this.setHP(this.hp + change);
      };
    });

    var delay = chara.isDead() ? 60 : 10;

    if (chara.isDead()) {
      cue[40] = () => {chara.battle.dead();}
    }

    this.tl.cue(cue).delay(delay).then(() => {
        // 攻撃終了のcallback
        if(callback) { callback() };
      });
  },

  setHP: function(hp) {
    this.hp = hp;
    this.gages.forEach((gage, i) => {
      gage.opacity = hp > i ? 1 : 0;
    });
  },
});

var PrintSkill = enchant.Class.create(enchant.Group, {

  /**
   * @constructor
   * @param chara 
   * @param skill 
   */
  initialize: function(chara, skill) {
    enchant.Group.call(this);
    this.height = 15;
    
    this.label = new FLabel(skill.name, 10, 2, 4);

    this.width = this.label.main._boundWidth + 4;
    this.back = new Square(this.width, this.height);
    this.back.opacity = 0.5;

    this.addChild(this.back);
    this.addChild(this.label);

    this.x = WINDOW.width;

    if (!scenes.battle.isRight(chara)) {
      this.setFlip();
    };
  },

  // 左右逆転
  setFlip: function() {
    this.label.flip();
  },
});