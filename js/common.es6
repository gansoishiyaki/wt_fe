// マス目のサイズ
let CHIP_SIZE = 40;

// マップは6*8
let MAP = {width: 6, height: 8};
let GAGE = {width: 4, height: 6};

// メニュー用に上に2, 下に1マス分とる
let WINDOW = {
  width: CHIP_SIZE * MAP.width,
  height: CHIP_SIZE * (MAP.height + 2 + 1)
};

let COLOR = {
  move: "#2222ff",
  attack: "#ff4500",
  player: "#00ff7f",
  enemy: "#ff6347"
};

let RangeType = {
  move: 1,
  attack: 2
};

let DIRECTIONS = [
  {x: 0, y: -1},
  {x: -1, y: 0},
  {x: 0, y: 1},
  {x: 1, y: 0}
];

let FPS = 20;

var Common = {
  // マップサイズ分の空の配列を提供する
  getEmptyArray: function(initNum = 99) {
    return [...Array(MAP.height)].map(i => {
      return [...Array(MAP.width)].map(i => initNum);
    });
  }
};