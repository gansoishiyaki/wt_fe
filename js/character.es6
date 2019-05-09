var Charactor = enchant.Class.create(enchant.Group, {
  is_enemy: false,
  hp: 0,
  maxhp: 0,

  initialize: function(data, is_enemy = false) {
    enchant.Group.call(this);
    
    this.data = data;
    this.maxhp = data.maxhp;
    this.hp = this.maxhp;
    this.pos = {x: 0, y: 0};
    this.move_flag = false;
    this.range = {};
    this.is_enemy = is_enemy;
    
    // mainスプライト
    this.main = new Sprite(CHIP_SIZE, CHIP_SIZE);
    this.main.image = game.assets[`img/chara/map/${data.id}.png`];
    this.addChild(this.main);

    this.gage = new MiniGage(this);
    this.addChild(this.gage);
    
    this.main.on(Event.TOUCH_START, e => {
      touchstart = (new Date()).getTime();
    });

    this.main.on(Event.TOUCH_END, e => {
      let timerange = (new Date()).getTime() - touchstart;
      if(timerange >= 500) {
        console.log("longtouch", this);
      } else {
        scenes.map.set_chara(this);
      }
    });
  },

  setPos: function(x, y) {
    this.pos.x = x;
    this.pos.y = y;
    this.x = CHIP_SIZE * x;
    this.y = CHIP_SIZE * y;
  },

  getMove: function() {
    return this.data.move;
  },

  getColor: function() {
    return this.is_enemy ? COLOR.enemy : COLOR.player;
  },
});

var MiniGage = enchant.Class.create(enchant.Group, {
  fontsize: 12,

  initialize: function(chara) {
    enchant.Group.call(this);
    this.chara = chara;
    this.y = CHIP_SIZE - this.fontsize;

    // hp
    this.hp = this.chara.hp;
    this.hp_sprite = new FLabel(`${this.hp}`, this.fontsize, 0, 0);
    this.hp_sprite.main.color = this.chara.getColor();
    this.hp_sprite.setShadow();
    this.addChild(this.hp_sprite);

    let gage_width = CHIP_SIZE - this.fontsize;
    let gage_height = 6;
    let line = 1;

    this.gage = new Group();
    this.gage.x = this.fontsize;
    this.gage.y = 4;

    this.gage.base = new Sprite(gage_width, gage_height);
    let base_sur = new Surface(gage_width, gage_height);
    base_sur.context.fillStyle = "#222222";
    base_sur.context.fillRect(0, 0, gage_width, gage_height);
    this.gage.base.image = base_sur;
    this.gage.addChild(this.gage.base);

    let main_width = this.hp / this.chara.maxhp * (gage_width - line * 2);
    let main_height = gage_height - line * 2;
    this.gage.main = new Sprite(main_width, main_height);
    this.gage.main.x = line;
    this.gage.main.y = line;

    let main_sur = new Surface(main_width, main_height);

    //グラデーション
    var grad = main_sur.context.createLinearGradient(0, 0, 0, main_height);
    grad.addColorStop(0, 'white'); 
    grad.addColorStop(1, this.chara.getColor()); 

    main_sur.context.fillStyle = grad; 
    //main_sur.context.fillStyle = this.chara.getColor();
    main_sur.context.fillRect(0, 0, main_width, main_height);

    this.gage.main.image = main_sur;

    this.gage.addChild(this.gage.main);

    this.addChild(this.gage);
  },
});