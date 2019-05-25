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
    hit: 80,
    cri: 0,
    is_black: true,
    range: 2,
    type: TriggerRangeType.normal,
  },
  borboros: {
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
    range: 2,
    type: TriggerRangeType.normal
  }
}