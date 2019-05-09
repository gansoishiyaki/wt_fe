let party = [Chara.hyuse];

enchant();
window.onload = () => {
  window.game = new Game(WINDOW.width, WINDOW.height);
  previewCenter(game);
  game.fps = 20;

  window.scenes = {};
  var playing_map;
  var selected_chara;
  var move_flag = false;
  let touchstart = 0;

  preload();
  game.onload = () => {
    // map表示
    //set_map(Maps.test);
    scenes.map = new FMap(Maps.test);
    game.pushScene(scenes.map);
  };

  game.start();

  function preload() {
    // system
    game.preload(
      'img/system/gagebase.png', 
      'img/system/gagegreen.png',
      'img/system/mini_status.png',
      'img/system/enemy_mini_status.png')

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

  function preload_chara(chara) {
    game.preload(`img/chara/map/${chara.id}.png`);
    game.preload(`img/chara/status/${chara.id}.png`);
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

