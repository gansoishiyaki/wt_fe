var Common = {
  // マップサイズ分の空の配列を提供する
  getEmptyArray: function(initNum = 99) {
    return [...Array(MAP.height)].map(i => {
      return [...Array(MAP.width)].map(i => initNum);
    });
  }
};

var FLabel = enchant.Class.create(enchant.Group, {
  initialize: function(str, fontsize, x, y) {
    enchant.Group.call(this);
    this.str = str;
    this.x = x;
    this.y = y;
    this.fontsize = fontsize;

    this.main = new Label(this.str);
    this.main.font = `${this.fontsize}px PixelMplus10`;
    this.main.color = "#ffffff"
    this.addChild(this.main);
  },

  setShadow: function(color = "#000000"){
    // 影表示
    this.shadow = new Label(this.str);
    this.shadow.font = `${this.fontsize}px PixelMplus10`;
    this.shadow.color = color;
    this.shadow.x = 1;
    this.shadow.y = 1;

    // 順番入れ替え
    this.removeChild(this.main);
    this.addChild(this.shadow);
    this.addChild(this.main);
  },

  alignRight: function() {
    this.x = this.x - this.main._boundWidth;
  },
});

var Gage = enchant.Class.create(enchant.Group, {
  initialize: function(filename, x, y, width, height){
    enchant.Group.call(this);

    let image = game.assets[`img/system/${filename}.png`];

    this.x = x;
    this.y = y;

    this.left = new Sprite(GAGE.width, height);
    this.left.image = image;
    this.addChild(this.left);

    this.right = new Sprite(GAGE.width, height);
    this.right.image = image;
    this.right.x = width - GAGE.width;
    this.right.frame = 2;
    this.addChild(this.right);

    this.main = new Sprite(GAGE.width, height);
    this.main.image = image;
    this.main.scale((width - GAGE.width * 2)/GAGE.width, 1);
    this.main.x = (this.main.scaleX + 1) * GAGE.width / 2;
    this.main.frame = 1;
    this.addChild(this.main);
  },
});

var CustomNumbers = enchant.Class.create(enchant.Group, {
  width: 10,
  height: 14,

  initialize: function(num, x, y, color = "") {
    enchant.Group.call(this);
    
    let image = game.assets[`img/system/numbers${color}.png`];
    let str = `${num}`;

    this.x = x;
    this.y = y;

    str.split("").forEach((s, i) => {
      var sprite = new Sprite(this.width, this.height);
      sprite.image = image;
      sprite.frame = Number(s);
      sprite.x = i * (this.width - 1);
      this.addChild(sprite);
    });

    this.str_width = str.length * (this.width - 1);
  },

  alignRight: function() {
    this.x = this.x - this.str_width;
  },
});

