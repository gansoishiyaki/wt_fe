var BattleResultScene = enchant.Class.create(enchant.Scene, {
  initialize: function() {
    enchant.Scene.call(this);

    // 黒背景
    this.back = new Square(WINDOW.width, WINDOW.height);
    this.back.opacity = 0.5;
    this.addChild(this.back);

    this.main = new Group();
    this.main.y = CHIP_SIZE * 2 + 20;
    this.addChild(this.main);
  },

  setScene: function(result) {
    this.main.removeAll();

    let width = WINDOW.width;
    let height = CHIP_SIZE * 7;

    // ウィンドウ
    let color = result ? COLOR.window.player : COLOR.window.enemy;
    this.window = new GradSquare(width, height, color);
    this.main.addChild(this.window);

    let charas = scenes.map.charas.concat(scenes.map.deadCharas);
    let players = charas.filter(c => c.is_player());
    let enemies = charas.filter(c => c.is_enemy());

    // 結果
    let str = result ? "- 勝利 -" : "- 敗北 -";
    var result_str = new FLabel(str, 15, width / 2, 5);
    result_str.alignCenter();
    result_str.setShadow();
    this.main.addChild(result_str);

    var twitter_msg = result ? "勝利!" : "負けてしまった……\n相手:";

    // 敵のラベル
    var enemy_str = new FLabel("相手ユニット", 13, 10);
    enemy_str.y = 25;
    enemy_str.setShadow();
    this.main.addChild(enemy_str);

    // 敵表示
    var enemie_images = new Group();
    enemie_images.y = 45;
    this.main.addChild(enemie_images);
    enemies.forEach((e, i) => {
      var image = new FSprite({width: 50, height: 50});
      image.x = i * 55 + 5;
      image.setImage(`img/chara/status/${e.data.id}.png`);
      if (e.isDead()) {image.setGrayImage();}

      enemie_images.addChild(image);
      twitter_msg += `${e.data.name}/`
    });

    twitter_msg += "\nキャラ:";

    // 敵のラベル
    var player_str = new FLabel("あなたのユニット", 13, 10);
    player_str.y = 110;
    player_str.setShadow();
    this.main.addChild(player_str);

    // 敵表示
    var player_images = new Group();
    player_images.y = 130;
    this.main.addChild(player_images);
    players.forEach((e, i) => {
      var image = new FSprite({width: 50, height: 50});
      image.x = i * 55 + 5;
      image.setImage(`img/chara/status/${e.data.id}.png`);
      if (e.isDead()) {image.setGrayImage();}

      player_images.addChild(image);
      twitter_msg += `${e.data.name}/`
    });

    // 再戦ボタン
    var replayButton = new FButton("再戦する", width / 2 - 70, 3, 140);
    replayButton.y = 195;
    this.main.addChild(replayButton);

    // 再戦
    replayButton.on(Event.TOUCH_START, e => {
      // マップのデータをクリア
      let data = scenes.map.data;
      game.removeScene(scenes.map);
      scenes.map = null;

      // マップ再表示
      scenes.map = new MapScene(data);
      game.popScene(this);
      game.pushScene(scenes.map);

      // ゲームリスタート
      scenes.map.tl.delay(10).then(() => {
        scenes.changeTurn.setScene(CampType.party);
      });
    });

    // ツイートボタン
    var tweetButton = new FButton("結果をTweet", width / 2 - 70, 3, 140);
    tweetButton.y = 235;
    this.main.addChild(tweetButton);

    // 結果をツイート
    tweetButton.on(Event.TOUCH_START, e => {
      postTwitter(twitter_msg);
    });

    // postTwitter(`負けてしまった・・・`);

    game.pushScene(this);
  },
});