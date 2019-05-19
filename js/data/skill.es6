let SkillExecType = {
  allways: 0, // 常時発動
  field: 1, // フィールドの条件で発動
  battle: 2, // 戦闘中 
  other: 3 // その他
}

let SkillTarget = {
  enemy: 0,
  mine: 1,
  camp: 2,
  all: 3
}

var Skill = function(skill) {
  Object.assign(this, skill);
  
  this.setExec = function(array) {
    array = array.push(this);
  };

  this.image = function() {
    let image = new FSprite({width: 30, height: 30});
    image.setImage(`img/system/skill/${this.id}.png`); 
    return image;
  };
}

let SkillData = {
  alektor: {
    id: "alektor",
    name: "キューブ化",
    description: "技*3%で発動。<br>相手の防御力を半減して攻撃する。",
    type: SkillExecType.battle,
    target: SkillTarget.enemy,
    rate: function(attack) {
      // 技*2%で発動
      let teh = attack.chara.getTeh(scenes.map, attack.enemy) * 3;
      if (random(100) <= teh) {
        // 相手の防御半分ダメージ加算
        attack.damage += attack.enemy.getDef(scenes.map, this.chara) / 2;
        this.setExec(attack.chara_exec);
      }
    },
  },

  alektor_drain: {
    id: "cube",
    name: "キューブ吸収",
    description: "技%で発動。<br>与えたダメージ分吸収する。",
    type: SkillExecType.battle,
    target: SkillTarget.enemy,
    rate: function(attack) {
      // 技%で発動
      let teh = attack.chara.getTeh(scenes.map, attack.enemy);
      if (random(100) <= teh) {
        attack.is_drain = true;
        this.setExec(attack.chara_exec);
      }
    },
  },

  alektor_guard: {
    id: "fish",
    name: "生物弾ガード",
    description: "技%で発動。<br>相手の攻撃を無効化する。",
    type: SkillExecType.battle,
    target: SkillTarget.mine,
    rate: function(attack) {
      // 技*1.5%で発動。
      let teh = attack.enemy.getTeh(scenes.map, attack.chara);

      // 攻撃を無効化する
      if (random(100) <= teh) {
        attack.is_regist = true;
        this.setExec(attack.enemy_exec);
      }
    },
    exec: (attack, frame) => {
      // 生物弾を表示
      return attack.chara.battle.fish(attack, frame);
    },
  },

  rengeki: {
    id: "rengeki",
    name: "連撃",
    description: "技%で発動。<br>連続して攻撃する",
    type: SkillExecType.battle,
    target: SkillTarget.enemy,
    rate: function(attack) {
      // 技%で発動
      let teh = attack.chara.getTeh(scenes.map, attack.enemy);
      if (random(100) <= teh) {
        this.setExec(attack.chara_next_exec);
      }
    },
  },

  load: {
    id: "load",
    name: "侵攻部隊隊長",
    description: "周囲3マス以内の<br>相手の命中・回避率を10%下げる。",
    type: SkillExecType.field,
    target: SkillTarget.enemy,
    target_range: 3,
    status: [Status.hit, Status.avo],
    exec: (chara, by) => {
      return -10;
    },
  },
}