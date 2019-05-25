let MapStatus = {
  test: {
    file: "town",
    type: {
      12: { hit: false },
      16: { hit: true },
      17: { hit: true },
      18: { hit: true },
      40: { hit: true },
      41: { hit: true},
      102: { hit: true},
      110: { hit: true},
      135: { hit: true},
      143: { hit: true},
      151: { hit: true},
      157: { hit: true},
      186: { hit: true},
      187: { hit: true},
      369: { hit: true},
    },
  }
};

let RoutineType = {
  none: 0, // 猪突猛進
};

var MapPointData = {
  test: [[
    [12,12,12,12,12,12],
    [12,12,12,12,12,12],
    [12,12,12,12,12,12],
    [12,12,12,12,12,12],
    [12,12,12,12,12,12],
    [12,12,12,12,12,12],
    [12,12,12,12,12,12],
    [12,12,12,12,12,12]
  ],[
    [-1,40,41,41,41,41],
    [-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,157,-1,135],
    [-1,186,187,-1,-1,143],
    [-1,-1,-1,-1,369,143],
    [-1,369,-1,-1,-1,151],
    [-1,-1,16,17,17,17]
  ],[
    [-1,102,-1,-1,-1,-1],
    [-1,110,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1]
  ]],
};

let Maps = {
  enedora: {
    name: "vs エネドラ",
    chip: MapStatus.test,
    data: MapPointData.test,
    enemies: [{
      chara: new Chara(CharaData.enedora),
      x: 3,
      y: 1,
      routine: RoutineType.none,
    },],
    players: [
      {x: 3, y: 5},
      {x: 2, y: 5},
    ],
  },
  hyrein: {
    name: "vs ハイレイン",
    chip: MapStatus.test,
    data: MapPointData.test,
    enemies: [{
      chara: new Chara(CharaData.hyrein),
      x: 3,
      y: 1,
      routine: RoutineType.none,
    },],
    players: [
      {x: 3, y: 5},
      {x: 2, y: 5},
    ],
  },
  enehy: {
    name: "vs エネドラ&ハイレイン",
    chip: MapStatus.test,
    data: MapPointData.test,
    enemies: [{
      chara: new Chara(CharaData.enedora),
      x: 4,
      y: 1,
      routine: RoutineType.none,
    },{
      chara: new Chara(CharaData.hyrein),
      x: 3,
      y: 1,
      routine: RoutineType.none,
    },],
    players: [
      {x: 3, y: 5},
      {x: 2, y: 5},
    ],
  },
};