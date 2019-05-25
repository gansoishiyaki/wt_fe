var SelectMap = enchant.Class.create(enchant.Scene, {
  initialize: function() {
    enchant.Scene.call(this);
  },

  setScene: function() {
    this.removeAll();

    // 背景表示
    let back = new GradSquare(WINDOW.width, WINDOW.height, COLOR.window.player);
    this.addChild(back);
    let backBlack = new Square(WINDOW.width, WINDOW.height);
    backBlack.opacity = 0.75;
    this.addChild(backBlack);

    // パーティ
    let party = new DisplayParty();
    this.addChild(party);

    // マップ選択
    let selectMaps = new SelectStageGroup();
    selectMaps.y = CHIP_SIZE * 2.5;
    this.addChild(selectMaps);

    game.pushScene(this);
  },
});

/**
 * マップ選択
 */
var SelectStageGroup = enchant.Class.create(enchant.Group, {
  initialize: function() {
    enchant.Group.call(this);

    // 各ステージ
    Object.keys(Maps).forEach((key, i) => {
      let map = Maps[key];
      let button = new SelectStage(map);
      button.x = 5;
      button.y = i * 70 + 10;
      this.addChild(button);
    });
  },
});

var SelectStage = enchant.Class.create(enchant.Group, {
  initialize: function(map) {
    enchant.Group.call(this);

    // 背景
    let back = new GradSquare(WINDOW.width - 10, 65, COLOR.window.player);
    this.addChild(back);

    // マップ名
    let name = new FLabel(map.name, 12, 5, 5);
    name.setShadow();
    this.addChild(name);

    let charas = new Group();
    charas.x = 5;
    charas.y = 20;
    this.addChild(charas);

    map.enemies.forEach((e, i) => {
      let enemy = e.chara.mapImage();
      enemy.x = i * 40;
      charas.addChild(enemy);
    });

    this.on(Event.TOUCH_END, e => {
      // マップ再表示
      scenes.map = new MapScene(map);
      game.popScene(this);
      game.pushScene(scenes.map);

      // ゲームリスタート
      scenes.map.tl.delay(10).then(() => {
        scenes.changeTurn.setScene(CampType.party);
      });
    });
  },
});

/**
 * パーティ表示
 */
var DisplayParty = enchant.Class.create(enchant.Group, {
  initialize: function() {
    enchant.Group.call(this);

    let back = new GradSquare(WINDOW.width, CHIP_SIZE * 2.5, COLOR.window.player);
    this.addChild(back);

    // 顔グラ表示
    userData.party.forEach((c, i) => {
      var image;

      if (!c) {
        // 空の場合はEmpty
        image = new FSprite({width: 50, height: 50});
        image.setImage('img/system/chara_empty.png');
        image.opacity = 0.5;
      } else {
        image = c.faceImage();
        image.on(Event.TOUCH_END, e => {
          let chara = new MapCharactor(c);
          scenes.status.setChara(chara);
        });
      }

      image.x = i * 55 + 10;
      image.y = 10;
      this.addChild(image);
    });
  },
});