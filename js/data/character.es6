let TriggerRangeType = {
  normal: 0,
  line: 1
}

let Skill = {
  alektor: {
    id: "alektor",
    name: "【卵の冠(アレクトール)】",
    pre_name: "卵の冠",
    atk: 12,
    rank: "s",
    hit: 70,
    cri: 0,
    is_black: true,
    description: "与えたダメージを吸収する。<br>※ハイレイン専用",
    range: 2,
    type: TriggerRangeType.normal
  },
  lambillis: {
    id: "lambillis",
    name: "【蝶の盾(ランビリス)】",
    pre_name: "蝶の盾",
    atk: 8,
    rank: "a",
    hit: 80,
    cri: 0,
    is_black: false,
    description: "攻撃後、敵を自分の隣に隣接させる。<br>※ヒュース専用",
    range: 2,
    type: TriggerRangeType.normal
  }
}
let Status = {
 maxhp: "ＨＰ",
 atk: "攻撃",
 def: "防御",
 spd: "機動",
 teh: "技術",
 luk: "運",
}

let Chara = {
  hyrein: {
    id: "hyrein",
    name: "ハイレイン",
    role: "アフトクラトル遠征部隊隊長",
    type: 1,
    maxhp: 80,
    atk: 28,
    def: 30,
    teh: 28,
    spd: 22,
    luk: 3,
    move: 2,
    main_trigger: Skill.alektor,
    trigger: [],
    images: {
      bard: "img/battle/bard.png"
    }
  },
  hyuse: {
    id: "hyuse",
    name: "ヒュース",
    role: "ハイレイン隊",
    type: 1,
    maxhp: 42,
    atk: 23,
    def: 20,
    teh: 25,
    spd: 26,
    luk: 12,
    move: 2,
    main_trigger: Skill.lambillis,
    trigger: [],
    images: {}
  }, 
}

