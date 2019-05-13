let DIRECTIONS = [
  {x: 0, y: -1},
  {x: -1, y: 0},
  {x: 0, y: 1},
  {x: 1, y: 0}
];

var random = function(max, min = 0) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

var Pos = function(x = 0, y = 0){
  this.x = x;
  this.y = y;

  this.localPos = () => {
    return {x: this.x * CHIP_SIZE, y: this.y * CHIP_SIZE};
  },

  this.equal = pos => {
    return this.x == pos.x && this.y == pos.y;
  },

  this.copy = () => {
    return new Pos(this.x, this.y);
  },

  this.abs = (pos = {x: 0, y: 0}) => {
    return Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y);
  },

  this.add = pos => {
    return new Pos(this.x + pos.x, this.y + pos.y);
  },

  this.multi = num => {
    return new Pos(this.x * num, this.y * num);
  }
}

var Range = function(range = []) {
  this.contain = pos => {
    return range.find(p => p.equal(pos)) != undefined;
  }
}

// カスタム画像クラス
var FSprite = enchant.Class.create(enchant.Sprite, {
  initialize: function(size){
    enchant.Sprite.call(this, size.width, size.height);
    this.size = size;
  },

  setImage: function(filename) {
    this.assetfile = game.assets[filename];
    this.image = this.assetfile;
  },

  setGtayImage: function() {
    this.sur = new Surface(this.size.width, this.size.height);
    this.sur.draw(this.assetfile, 0, 0, this.size.width, this.size.height);
    
    for (var i=0; i < this.size.width; ++i) {
	    for (var j=0; j< this.size.height; ++j) {
        var p = this.sur.getPixel(j, i);
        // グレイスケールを求める
        var grayscale = p[0]*0.3 + p[1]*0.59 + p[2]*0.11;
        p[0] = grayscale;
        p[1] = grayscale;
        p[2] = grayscale;
        // ピクセルセット
        this.sur.setPixel(j, i, p[0], p[1], p[2], p[3]);
      }
    }

    this.image = this.sur;
  },

  alignCenter: function() {
    this.x = this.x - this.size.width / 2;
  },

  alignRight: function() {
    this.x = this.x - this.size.width;
  },
});

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

  alignCenter: function() {
    this.x = this.x - this.main._boundWidth / 2;
  },

  alignRight: function() {
    this.x = this.x - this.main._boundWidth;
  },

  // 左右反転
  flip: function() {
    this.scaleX = -1;
    this.x += this.main._boundWidth;
  },
});

var Gage = enchant.Class.create(enchant.Group, {
  initialize: function(filename, x, y, width, size){
    enchant.Group.call(this);

    let image = game.assets[`img/system/${filename}.png`];

    this.x = x;
    this.y = y;
    this.size = size;
    this.width = width;
    this.left = new Sprite(size.width, size.height);
    this.left.image = image;
    this.addChild(this.left);
    this.right = new Sprite(size.width, size.height);
    this.right.image = image;
    this.right.frame = 2;
    this.addChild(this.right);
    this.main = new Sprite(size.width, size.height);
    this.main.image = image;
    this.main.frame = 1;
    this.addChild(this.main);

    this.print();
  },

  setWidth: function(width) {
    this.size.width = width();
    this.print();
  },

  print: function() {
    this.right.x = this.width - this.size.width;

    this.main.scale((this.width - this.size.width * 2) / this.size.width, 1);
    this.main.x = (this.main.scaleX + 1) * this.size.width / 2;
  }
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

  alignCenter: function() {
    this.x = this.x - this.main._boundWidth / 2;
  },

  alignRight: function() {
    this.x = this.x - this.str_width;
  },

  // 左右反転
  flip: function() {
    this.scaleX = -1;
    this.x += this.str_width;
  },
});

var Square = enchant.Class.create(enchant.Sprite, {
  initialize: function(width, height, color = "black") {
    enchant.Sprite.call(this, width, height);

    this.sur = new Surface(width, height);
    this.image = this.sur;

    this.sur.context.fillStyle = color;
    this.sur.context.fillRect(0, 0, width, height);
  },
});

var GradSquare = enchant.Class.create(enchant.Sprite, {
  initialize: function(width, height, colors = {start: "whire", end: "black"}) {
    enchant.Sprite.call(this, width, height);

    var sur = new Surface(width, height);
    this.image = sur;

    var grad = sur.context.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, colors.start);
    grad.addColorStop(1, colors.end);
    
    sur.context.fillStyle = grad;
    sur.context.fillRect(0, 0, width, height);
  },
});