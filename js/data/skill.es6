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
  }
}

let SkillData = {
  alektor: {
    id: "alektor",
    name: "キューブ化",
    description: "相手の防御力を半減して攻撃する",
    type: SkillExecType.battle,
    target: SkillTarget.enemy,
    rate: function(attack) {
      // 相手の防御半分ダメージ加算
      attack.damage += attack.enemy.getDef(this.chara) / 2;
      this.setExec(attack.chara_start_exec);
    },
  },

  alektor_drain: {
    id: "cube",
    name: "キューブ吸収",
    description: "技%で発動。与えたダメージ分吸収する。",
    type: SkillExecType.battle,
    target: SkillTarget.enemy,
    rate: function(attack) {
      // 技%で発動
      let teh = attack.chara.getTeh(attack.enemy);
      if (random(100) <= teh) {
        attack.is_drain = true;
        this.setExec(attack.chara_start_exec);
      }
    },
  },

  alektor_guard: {
    id: "fish",
    name: "生物弾ガード",
    description: "技*1.5%で発動。攻撃を無効化する。",
    type: SkillExecType.battle,
    target: SkillTarget.mine,
    rate: function(attack) {
      // 技*1.5%で発動。
      let teh = attack.enemy.getTeh(attack.chara) * 1.5;

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
    description: "技%で発動。連続して攻撃する",
    type: SkillExecType.battle,
    target: SkillTarget.enemy,
    rate: function(attack) {
      // 技%で発動
      let teh = attack.chara.getTeh(attack.enemy);
      if (random(100) <= teh) {
        attack.is_rengeki;
      }
    },
  },

  load: {
    id: "load",
    name: "侵攻部隊隊長",
    description: "3マス以内の相手の命中・回避率を10%下げる",
    type: SkillExecType.field,
    target: SkillTarget.camp,
    status: [Status.hit, Status.avo],
    rate: (chara, taeget) => {
    },
  },
}