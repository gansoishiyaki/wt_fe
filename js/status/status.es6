var StatusScene = enchant.Class.create(enchant.Scene, {
  margin: 10,
  skill_flag: false,
  initialize: function() {
    enchant.Scene.call(this);

    // 黒背景
    this.back = new Square(WINDOW.width, WINDOW.height);
    this.back.opacity = 0.5;
    this.addChild(this.back);

    // window表示
    this.main = new Group();
    this.main.x = this.margin;
    this.main.y = this.margin * 4;
    this.addChild(this.main);

    this.on(Event.TOUCH_END, e => {
      if(this.skill_flag) {return;}
      // ウィンドウ削除
      game.popScene(this);
    });
  },

  setChara: function(chara) {
    this.chara = chara;

    // ウィンドウ
    let window_width = WINDOW.width - this.margin * 2;
    let window_height = WINDOW.height - this.margin * 8;
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
    let trigger = new Group();
    trigger.x = this.margin;
    trigger.y = 70;
    this.main.addChild(trigger);

    // トリガーウィンドウ
    let trigger_window = new FSprite({width: 203, height: 51});
    trigger_window.setImage('img/system/trigger_window.png');
    trigger.addChild(trigger_window);

    // トリガー名
    let skill_text = new FLabel(chara.trigger().name, 11, 10, 15);
    skill_text.setShadow();
    trigger.addChild(skill_text);

    // トリガー威力
    let skill_power_label = new FLabel("威力", 12, 15, 33);
    skill_power_label.setShadow();
    trigger.addChild(skill_power_label);
    let skill_power = new FLabel(chara.trigger().atk, 12, 45, 33);
    skill_power.setShadow();
    trigger.addChild(skill_power);

    // トリガー命中
    let skill_hit_label = new FLabel("命中", 12, 75, 33);
    skill_hit_label.setShadow();
    trigger.addChild(skill_hit_label);
    let skill_hit = new FLabel(chara.trigger().atk, 12, 105, 33);
    skill_hit.setShadow();
    trigger.addChild(skill_hit);

    // トリガークリティカル
    let skill_cri_label = new FLabel("必殺", 12, 135, 33);
    skill_cri_label.setShadow();
    trigger.addChild(skill_cri_label);
    let skill_cri = new FLabel(`${chara.trigger().cri}`, 12, 165, 33);
    skill_cri.setShadow();
    trigger.addChild(skill_cri);

    // ステータス
    this.status = new Group();
    this.status.x = this.margin + 3;
    this.status.y = 130;
    this.main.addChild(this.status);

    let values = [
      chara.maxhp,
      chara.getAtk(),
      chara.getDef(),
      chara.getSpd(),
      chara.getTeh(),
      chara.getLuk(),
      chara.getPower(),
      chara.getHit(),
      chara.getAvo(),
      chara.getCri(),
      chara.getCriAvo()
    ]

    Object.keys(Status).forEach((key, i) => {
      // ステータスラベル
      var y = i * 20;
      var x = 0;
      if (i > 5) {
         y = (i - 6) * 20;
         x = 100;
      }
      var status_label = new FLabel(Status[key], 12, x, y);
      status_label.setShadow();
      this.status.addChild(status_label);

      // ステータスのゲージのmaxの指定
      // hpの場合は80, 他は30
      var max = 30;
      var gage_str = "gagewhite";
      var num_str = "";
      if (key == 'maxhp') { max = 80; }
      if (i > 5) { max = 150;}
      if (values[i] >= max) { 
        // max値より高い場合は色を黄色にする
        num_str = "yellow";
      }

      // ステータス
      var number = new CustomNumbers(values[i], x + 55, y - 1, num_str);
      number.alignRight();
      this.status.addChild(number);
    });

    let skills = new Group();
    skills.x = 15;
    skills.y = 285;
    this.addChild(skills);

    chara.skills.forEach((s, i) => {
      let skill = new Group();
      skill.y = i * 20;
      skills.addChild(skill);

      // スキル画像
      let img = s.image();
      img.scale(0.6, 0.6);
      skill.addChild(img);

      let str = new FLabel(s.name, 11, 32, 10);
      skill.addChild(str);

      // タッチしたらスキル説明文
      skill.on(Event.TOUCH_END, e => {
        this.skill_flag = true;
        scenes.skill.setSkill(s, () => {
          this.skill_flag = false;
        });
      });
    });

    // シーン表示
    game.pushScene(this);
  },
});