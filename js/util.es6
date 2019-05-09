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



