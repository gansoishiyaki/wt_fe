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
  }
}

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
  initialize: function(filename, x, y, width, size){
    enchant.Group.call(this);

    let image = game.assets[`img/system/${filename}.png`];

    this.x = x;
    this.y = y;

    this.left = new Sprite(size.width, size.height);
    this.left.image = image;
    this.addChild(this.left);

    this.right = new Sprite(size.width, size.height);
    this.right.image = image;
    this.right.x = width - size.width;
    this.right.frame = 2;
    this.addChild(this.right);

    this.main = new Sprite(size.width, size.height);
    this.main.image = image;
    this.main.scale((width - size.width * 2) / size.width, 1);
    this.main.x = (this.main.scaleX + 1) * size.width / 2;
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

var Square = enchant.Class.create(enchant.Sprite, {
  initialize: function(width, height, color = "black") {
    enchant.Sprite.call(this, width, height);

    this.sur = new Surface(width, height);
    this.image = this.sur;

    this.sur.context.fillStyle = color;
    this.sur.context.fillRect(0, 0, width, height);
  },
});