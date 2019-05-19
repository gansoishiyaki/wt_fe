let TriggerRangeType = {
  normal: 0,
  line: 1
}

let Trigger = {
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
    type: TriggerRangeType.normal,
  },
  bolboros: {
    id: "bolboros",
    name: "【泥の王(ボルボロス)】",
    pre_name: "泥の王",
    atk: 10,
    rank: "s",
    hit: 80,
    cri: 30,
    is_black: true,
    range: 2,
    type: TriggerRangeType.normal,
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