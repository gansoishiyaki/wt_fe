var SkillScene = enchant.Class.create(enchant.Scene, {
  margin: 10,

  initialize: function() {
    enchant.Scene.call(this);

    // 黒背景
    this.back = new Square(WINDOW.width, WINDOW.height);
    this.back.opacity = 0.5;
    this.addChild(this.back);

    // window表示
    this.main = new Group();
    this.size = {width: WINDOW.width - this.margin * 2, height: CHIP_SIZE * 4};
    this.main.x = this.margin;
    this.main.y = (WINDOW.height - this.size.height) / 2;
    this.addChild(this.main);

    this.on(Event.TOUCH_END, e => {
      // ウィンドウ削除
      game.popScene(this);
    });
  },

  setSkill: function(skill) {
    this.main.removeAll();

    // ウィンドウ
    this.window = new GradSquare(this.size.width, this.size.height, COLOR.window.player);
    this.main.addChild(this.window);

    // スキル画像
    let image = skill.image();
    image.x = this.margin / 2;
    image.y = this.margin / 2;
    this.main.addChild(image);

    // スキル名
    let name = new FLabel(skill.name, 13, 40, this.margin + 5);
    name.setShadow();
    this.main.addChild(name)
    // スキル説明
    let description = new FLabel(skill.description, 12, this.margin, 40);
    description.main.width = this.size.width - this.margin * 2;
    this.main.addChild(description);
    
    game.pushScene(this);
  },
});