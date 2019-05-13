// バージョン
Version = "0.1";

// マス目のサイズ
let CHIP_SIZE = 40;

// マップは6*8
let MAP = {width: 6, height: 8};
let GAGE = {width: 4, height: 6};
let BUTTON = {
  size: {
    width: 25,
    height: 33
  },
};

// メニュー用に上に2, 下に1マス分とる
let WINDOW = {
  width: CHIP_SIZE * MAP.width,
  height: CHIP_SIZE * (MAP.height + 2 + 1),
};

let COLOR = {
  move: "#2222ff",
  attack: "#ff4500",
  player: "#00ff7f",
  enemy: "#ff6347",
  window: {
    player: {
      start: "#409982",
      end: "#294840"
    },
    enemy: {
      start: "#7b3a3a",
      end: "#331212"
    }
  }
};

let RangeType = {
  move: 1,
  attack: 2
};

let CampType = {
  party: 0,
  enemy: 1,
}

let TouchMode = {
  disable: -1,
  none: 0,
  single: 1,
  move: 2,
  attack: 3
}

let TurnType = {
  ready: -1,
  player: -0,
  enemy: 1
}

let FPS = 20;

var Common = {
  // マップサイズ分の空の配列を提供する
  getEmptyArray: function(initNum = Infinity) {
    return [...Array(MAP.height)].map(i => {
      return [...Array(MAP.width)].map(i => initNum);
    });
  },

  // posがマップ外か
  checkPosIsOver: function(pos) {
    if (pos.x < 0 || pos.y < 0) { return true; }
    if (pos.x >= MAP.width || pos.y >= MAP.height) { return true;}
    return false;
  },
};

var FButton = enchant.Class.create(Gage, {
  initialize: function(str, x, y, width, filename = "button") {
    Gage.call(this, filename, x, y, width, BUTTON.size);

    this.str = new FLabel(str, 14, width / 2 + 3, 10);
    this.str.setShadow();
    this.str.alignCenter();
    this.addChild(this.str);
  },
});

/**
 * ## postTwitter
 * @param msg 
 */
var postTwitter = msg => {
  let str = `${msg}\n\n#ワートリFE\nhttps://gansoishiyaki.sakura.ne.jp/game/wt/srpg/`;
  tweetMsg(str);
}