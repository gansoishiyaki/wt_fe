let party = [Chara.hyrein];

enchant();
window.onload = () => {
  window.game = new Game(WINDOW.width, WINDOW.height);
  previewCenter(game);
  game.fps = FPS;

  window.scenes = {};

  preload();
  game.onload = () => {
    // map表示
    scenes.changeTurn = new TurnChangeScene();
    scenes.map = new MapScene(Maps.test);
    scenes.status = new StatusScene();
    scenes.preBattle = new PreBattleScene();
    scenes.battle = new BattleScene();
    scenes.battleResult = new BattleResultScene();
    
    game.pushScene(scenes.map);

    scenes.map.tl.delay(10).then(() => {
      scenes.changeTurn.setScene(CampType.party);
    });
  };

  game.start();

  // preloadをまとめて行う
  function preload() {
    // system
    game.preload(
      'img/system/gagebase.png', 
      'img/system/gagegreen.png',
      'img/system/gagewhite.png',
      'img/system/gageyellow.png',
      'img/system/button.png',
      'img/system/numbers.png',
      'img/system/numbersyellow.png',
      'img/system/mini_status.png',
      'img/system/enemy_mini_status.png',
      'img/system/player_turn.png',
      'img/system/enemy_turn.png',
      'img/system/player_turn_bar.png',
      'img/system/enemy_turn_bar.png',
    )

    // party
    party.forEach(chara => {
      preload_chara(chara);
    });

    // map
    for (key in Maps) {
      let map = Maps[key];
      game.preload(`img/map/${map.chip.file}.png`);
      map.enemies.forEach( enemy => {
        preload_chara(enemy.chara);
      });
    }
  };

  // キャラクターのpreload
  function preload_chara(chara) {
    game.preload(`img/chara/map/${chara.id}.png`);
    game.preload(`img/chara/status/${chara.id}.png`);
    game.preload(`img/chara/battle/${chara.id}.png`);

    for (key in chara.images) {
      game.preload(chara.images[key]);
    }
  }

  function previewCenter ( game ){
    // ゲームを中央寄せする
    var left = ( window.innerWidth - ( game.width * game.scale )) /2;
    var top= ( window.innerHeight - ( game.height * game.scale )) /2;
    var target = document.getElementById("enchant-stage");
    target.style.left = `${left}px`;
    target.style.top = `${top}px`;
    game._pageX = left;
    game._pageY = top;
  }
};

