var TurnChangeScene = enchant.Class.create(enchant.Scene, {
  initialize: function() {
    enchant.Scene.call(this);
  },

  setScene: function(camp) {
    this.removeAll();

    // 真ん中の文字
    var main = this.getImage(camp);
    main.scaleY = 0;
    this.addChild(main);

    /*
    let margin = 35;

    // 上の線
    var header = this.getBarImage(camp);
    header.y = main.y - margin + 8;
    this.addChild(header);

    // 下の線
    var footer = this.getBarImage(camp);
    footer.y = main.y + margin - 5;
    footer.scaleX = -1;
    footer.x *= -1;
    footer.x += 18;
    this.addChild(footer);


    header.tl
      .moveBy(WINDOW.width * -1, 0, FPS / 4, enchant.Easing.QUAD_EASEINOUT)
      .delay(10)
      .moveBy(WINDOW.width * -1.1, 0, FPS / 4, enchant.Easing.QUAD_EASEINOUT);

    footer.tl
      .moveBy(WINDOW.width, 0, FPS / 4, enchant.Easing.QUAD_EASEINOUT)
      .delay(10)
      .moveBy(WINDOW.width * 1.1, 0, FPS / 4, enchant.Easing.QUAD_EASEINOUT);
    */

    game.pushScene(this);

    // 文字のアニメーション
    main.tl
      .scaleTo(1, 1, FPS / 4, enchant.Easing.QUAD_EASEINOUT)
      .delay(10)
      .scaleTo(1, 0, FPS / 4, enchant.Easing.QUAD_EASEINOUT)
      .then(() => {
        game.popScene(this);
        scenes.map.next();
      });
  },

  getImage: function(camp) {
    var main;
    switch (camp) {
      case CampType.party:
        main = new FSprite({width: 200, height:38});
        main.setImage('img/system/player_turn.png');
        break;
      case CampType.enemy:
        main = new FSprite({width: 202, height:33});
        main.setImage('img/system/enemy_turn.png');
        break;
    }

    main.y = WINDOW.height / 2;
    main.x = WINDOW.width / 2;
    main.alignCenter();

    return main;
  },

  getBarImage: function(camp) {
    var main;
    main = new FSprite({width: 226, height:29});
    switch (camp) {
      case CampType.party:
        main.setImage('img/system/player_turn_bar.png');
        break;
      case CampType.enemy:
        main.setImage('img/system/enemy_turn_bar.png');
        break;
    }

    main.x = WINDOW.width;

    return main;
  }
});