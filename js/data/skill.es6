let SkillExecType = {
  allways: 0, // 常時発動
  field: 1, // フィールドの条件で発動
  battle: 2, // 戦闘中 
  damage: 3, // 戦闘、受け手側
  other: 4 // その他
}

let SkillTarget = {
  enemy: 0,
  mine: 1,
  cmap: 2,
  all: 3
}

var Skill = function(skill) {
  Object.assign(this, skill);
}

let SkillData = {
  alektor: {
    id: "alektor",
    name: "キューブ化",
    description: "相手の防御力を半減して攻撃する",
    type: SkillExecType.battle,
    target: SkillTarget.enemy,
    rate: attack => {
      // スキル実行
      attack.chara_start_exec.push(this);

      // 相手の防御半分ダメージ加算
      attack.damage += attack.enemy.getDef(this.chara) / 2;
    },
  },

  alektor_drain: {
    id: "cube",
    name: "キューブ吸収",
    description: "技%で発動。与えたダメージ分吸収する。",
    type: SkillExecType.battle,
    target: SkillTarget.enemy,
    rate: attack => {
      // 技%で発動
      let teh = attack.chara.getTeh(attack.enemy);
      if (random(100) <= teh) {
        attack.is_drain = true;
        attack.chara_start_exec.push(this);
      }
    },
  },

  alektor_guard: {
    id: "fish",
    name: "生物弾ガード",
    description: "技*1.5%で発動。攻撃を無効化する。",
    type: SkillExecType.damage,
    target: SkillTarget.mine,
    rate: attack => {
      // 技*1.5%で発動。
      let teh = attack.chara.getTeh(attack.enemy) * 1.5;

      // 攻撃を無効化する
      if (random(100) <= teh) {
        attack.is_regist = true;
        attack.enemy_exec.push(this);
      }
    },
    exec: battleChara => {
      // 生物弾を表示
      return battleChara.fish();
    },
  },

  rengeki: {
    id: "rengeki",
    name: "連撃",
    description: "技%で発動。連続して攻撃する",
    type: SkillExecType.attack,
    target: SkillTarget.enemy,
    rate: attack => {
      // 技%で発動
      let teh = attack.chara.getTeh(attack.enemy);
      if (random(100) <= teh) {
        attack.is_rengeki;
      }
    },
  },

  load: {
    id: "load",
    name: "四大領主",
    description: "味方全員の回避、命中を10%上昇させる",
    type: SkillExecType.field,
    target: SkillTarget.cmap,
    rate: (chara) => {

    },
  },
}