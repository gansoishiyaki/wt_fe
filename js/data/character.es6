let Skill = {
  alektor: {
    id: "alektor",
    name: "【卵の冠(アレクトール)】",
    atk: 12,
    rank: "s",
    hit: 60,
    is_black: true,
    description: "与えたダメージを吸収する。<br>※ハイレイン専用",
    range: RANGE.range_2
  },
  lambillis: {
    id: "lambillis",
    name: "【蝶の盾(ランビリス )】",
    atk: 8,
    rank: "a",
    hit: 70,
    is_black: false,
    description: "攻撃後、敵を自分の隣に隣接させる。<br>※ヒュース専用",
    range: RANGE.range_2
  }
}

let Chara = {
  hyrein: {
    id: "hyrein",
    name: "ハイレイン",
    type: 1,
    maxhp: 80,
    atk: 28,
    def: 30,
    teh: 28,
    spd: 22,
    luk: 3,
    move: 2,
    main_trigger: Skill.alektor,
    trigger: []
  },
  hyuse: {
    id: "hyuse",
    name: "ヒュース",
    type: 1,
    maxhp: 42,
    atk: 23,
    def: 20,
    teh: 25,
    spd: 26,
    luk: 12,
    move: 2,
    main_trigger: Skill.lambillis,
    trigger: []
  }, 
}

