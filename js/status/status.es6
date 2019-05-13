var StatusScene = enchant.Class.create(enchant.Scene, {
  margin: 10,

  initialize: function() {
    enchant.Scene.call(this);

    // 黒背景
    this.back = new Square(WINDOW.width, WINDOW.height);
    this.back.opacity = 0.5;
    this.addChild(this.back);

    // window表示
    this.main = new Group();
    this.main.x = this.margin;
    this.main.y = this.margin * 8;
    this.addChild(this.main);

    this.on(Event.TOUCH_END, e => {
      // ウィンドウ削除
      game.popScene(this);
    });
  },

  setChara: function(chara) {
    this.chara = chara;

    // ウィンドウ
    let window_width = WINDOW.width - this.margin * 2;
    let window_height = WINDOW.height - this.margin * 16;
    this.window = new GradSquare(window_width, window_height, COLOR.window.player);
    this.main.addChild(this.window);

    // 顔グラ表示
    this.image = new Sprite(50, 50);
    this.image.image = game.assets[`img/chara/status/${chara.data.id}.png`]; 
    this.image.x = this.margin;
    this.image.y = this.margin;
    this.main.addChild(this.image);

    // 名前
    this.name_text = new FLabel(chara.data.name, 13, 70, this.margin);
    this.name_text.setShadow();
    this.main.addChild(this.name_text)

    // role
    this.role_text = new FLabel(chara.data.role, 10, 70, this.margin * 3);
    this.role_text.setShadow();
    this.main.addChild(this.role_text);

    // トリガー
    this.trigger = new Group();
    this.trigger.x = this.margin;
    this.trigger.y = 70;
    this.main.addChild(this.trigger);

    // トリガー名
    this.skill_text = new FLabel(chara.trigger().name, 11, 0, 0);
    this.skill_text.setShadow();
    this.trigger.addChild(this.skill_text);

    // トリガー説明
    this.description = new FLabel(chara.trigger().description, 10, 3, 18);
    this.trigger.addChild(this.description);

    // ステータス
    this.status = new Group();
    this.status.x = this.margin + 3;
    this.status.y = 130;
    this.main.addChild(this.status);

    Object.keys(Status).forEach((key, i) => {
      // ステータスラベル
      var height = i * 25;
      var status_label = new FLabel(Status[key], 12, 0, height);
      status_label.setShadow();
      this.status.addChild(status_label);

      // ステータスのゲージのmaxの指定
      // hpの場合は80, 他は30
      var max = 30;
      var gage_str = "gagewhite";
      var num_str = "";
      if (key == 'maxhp') { max = 80; }

      // ステータスゲージ
      var margin_left = 60;
      var gage_base_width = window_width - margin_left - 25;
      var gage_width = chara.data[key] / max * gage_base_width;
      if (gage_width >= gage_base_width) { 
        // max値より高い場合はゲージをmaxに納めて、色を黄色にする
        gage_width = gage_base_width;
        gage_str = "gageyellow";
        num_str = "yellow";
      }

      var gage_base = new Gage("gagebase", margin_left, height + 3, gage_base_width, FILESIZE.gage);
      var gage = new Gage(gage_str, margin_left, height + 3, gage_width, FILESIZE.gage);
      this.status.addChild(gage_base);
      this.status.addChild(gage);

      // ステータス
      var number = new CustomNumbers(chara.data[key], 55, height - 1, num_str);
      number.alignRight();
      this.status.addChild(number);
    });

    // シーン表示
    game.pushScene(this);
  },
});