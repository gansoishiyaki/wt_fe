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
      if(timerange >= 1000) {
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

  trigger: function() {
    return this.data.main_trigger;
  },

  triggerRange: function() {
    return this.trigger().range;
  },

  // 中心を(0, 0)とした攻撃範囲
  calTriggerRange: function() {
    switch (this.trigger().type) {
      case TriggerRangeType.normal:
        return this.calRangeNormal();
      case TriggerRangeType.line:
        return this.calRangeLine();
    }
  },

  // 通常の攻撃範囲
  calRangeNormal: function() {
    let tr = this.triggerRange();
    let side_length = tr * 2 + 1;
    
    var range = [];
    [...Array(side_length).keys()].forEach(y => {
       [...Array(side_length).keys()].forEach(x => {
        let pos = {x: x - tr, y: y - tr};
        let abs = Math.abs(pos.x) + Math.abs(pos.y);
        if (abs != 0 && abs <= tr) {
          range.push({x: x - tr, y: y - tr});
        }
       });
    });

    return range;
  },

  // 直線上の攻撃範囲
  calRangeLine: function() {
  },

  calAttackRange: function(move_range) {
    // moves[y][x]で取り出せる元の配列を作成する
    var moves = Common.getEmptyArray();
    move_range.forEach(pos => { moves[pos.y][pos.x] = 0;});

    var attacks = Common.getEmptyArray();
    var attack_range = [];

    move_range.forEach(pos => {
      this.calTriggerRange().forEach(d => {
        let x = pos.x + d.x;
        let y = pos.y + d.y;

        // マイナスは処理しない
        if (x < 0 || y < 0) { return; }
        if (x >= MAP.width || y >= MAP.height) {return;}
        
        // 移動範囲に入っていない場合
        if (moves[y][x] == 99 && attacks[y][x] == 99 && !scenes.map.hitCol(x, y)) {
          attacks[y][x] = 1;
          return attack_range.push({x: x, y: y});
        }
      });
    });

    return attack_range; 
  },
});

var MiniGage = enchant.Class.create(enchant.Group, {
  fontsize: 12,

  initialize: function(chara) {
    enchant.Group.call(this);
    this.chara = chara;
    this.y = CHIP_SIZE - this.fontsize;
    this.hp = this.chara.hp;

    // gage
    let gage_width = CHIP_SIZE - this.fontsize;
    let gage_height = 6;
    let line = 1;

    this.gage = new Group();
    this.gage.x = this.fontsize - 2;
    this.gage.y = 4;

    // gageの枠
    this.gage.base = new Sprite(gage_width, gage_height);
    let base_sur = new Surface(gage_width, gage_height);
    base_sur.context.fillStyle = "#222222";
    base_sur.context.fillRect(0, 0, gage_width, gage_height);
    this.gage.base.image = base_sur;
    this.gage.addChild(this.gage.base);

    // gageの中身
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
    main_sur.context.fillRect(0, 0, main_width, main_height);

    this.gage.main.image = main_sur;
    this.gage.addChild(this.gage.main);

    this.addChild(this.gage);

    // hp
    this.hp_sprite = new FLabel(`${this.hp}`, this.fontsize, 0, 0);
    this.hp_sprite.main.color = this.chara.getColor();
    this.hp_sprite.setShadow();
    this.addChild(this.hp_sprite);
  },
});