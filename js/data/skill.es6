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
    name: "キューブ化",
    description: "相手の防御力を半減して攻撃する",
    type: SkillExecType.battle,
    target: SkillTarget.enemy,
    exec: attack => {
    },
  },

  alektor_drain: {
    name: "キューブ吸収",
    description: "技%で発動。与えたダメージ分吸収する。",
    type: SkillExecType.battle,
    target: SkillTarget.enemy,
    exec: attack => {
      // 技%で発動
      attack.chara.getTeh(attack.enemy);
    },
  },

  alektor_guard: {
    name: "生物弾ガード",
    description: "技*1.5%で発動。攻撃を無効化する。",
    type: SkillExecType.damage,
    target: SkillTarget.mine,
    exec: attack => {
      // 技*1.5%で発動。
    },
  },

  rensoku: {
    name: "連撃",
    description: "技%で発動。連続して攻撃する",
    type: SkillExecType.attack,
    target: SkillTarget.mine,
    exec: attack => {

    },
  },

  karisuma: {
    name: "隊長",
    description: "周囲の味方の回避、命中を10%上昇させる",
    type: SkillExecType.field,
    target: SkillTarget.cmap,
    exec: map => {

    },
  },
}