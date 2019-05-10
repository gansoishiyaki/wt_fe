//////////////////////////////
// MapCharactor Mapに表示するキャラクター
// 攻撃範囲計算などを行う
//////////////////////////////

var MapCharactor = enchant.Class.create(enchant.Group, {
  camp: CampType.party,
  hp: 0,
  maxhp: 0,
  is_touch: false,
  is_move: false,
  is_attack: false,
  timeline: null,

  initialize: function(data, camp = CampType.party) {
    enchant.Group.call(this);

    // init status
    this.data = data;
    this.maxhp = data.maxhp;
    this.hp = this.maxhp;
    this.pos = new Pos();
    this.range = {};
    this.move_flag = false;
    this.camp = camp;
    
    // mainスプライト
    this.main = this.mainSprite();
    this.addChild(this.main);

    // キャラクター下部のHP表示
    this.gage = new MiniGage(this);
    this.addChild(this.gage);
    
    this.main.on(Event.TOUCH_START, e => {
      let map = scenes.map;

      // キャラ選択中の時は反応しない
      if (map.touchMode != TouchMode.none) { return; }

      map.touchMode = TouchMode.single;

      // 未行動の味方の場合は選択中にする
      if (!this.move_flag && this.is_player()) {
        map.lastPos = this.pos.copy();
      }

      map.selectChara = this;

      // 0.5秒後にtouch判定が消えてなかったらロングタップ判定
      this.timeline = this.tl.delay(FPS).then(() => {
        if (map.touchMode != TouchMode.single) {return;}

        // キャラクターステータス表示
        if (this !== map.selectChara) { return; }
        scenes.status.setChara(this);

        // 選択終了
        scenes.map.selectEnd();
      });
    });

    this.main.on(Event.TOUCH_END, e => {
      console.log('touchEnd');
      let map = scenes.map;

      // タッチモードが何もない場合は終了
      if (map.touchMode == TouchMode.none) {return}

      // 移動中の場合はキャラクターを移動させる
      switch (map.touchMode) {
        case TouchMode.single:
          // キャラクターのシングルタップ動作
          map.touchedChara(this);
          break;

        // 移動中の場合は移動先確定
        case TouchMode.move:
          // 味方以外は終了
          if (!this.is_player()) { return; }

          // 同じ位置の場合は移動キャンセル
          if (map.lastPos.equal(this.pos)) {
            // 移動キャンセル
            map.selectEnd();
          } else {
            // キャラクターの移動
            map.moveTo(this, map.lastPos);
            //this.move_flag = true;
          }

          break;
        default:
          break;
      }

    });
  },

  // 本体の画像取得
  mainSprite: function() {
    var group = new Group();
    var sprite = new Sprite(CHIP_SIZE, CHIP_SIZE);
    sprite.image = game.assets[`img/chara/map/${this.data.id}.png`];
    group.main = sprite;
    group.addChild(sprite);

    return group;
  },

  is_player: function() {
    return this.camp == CampType.party;
  },

  is_enemy: function() {
    return this.camp == CampType.enemy;
  },

  isCampEqual: function(chara) {
    return this.camp == chara.camp;
  },

  // キャラクターの位置設定
  setPos: function(p) {
    this.pos = p;
    this.x = CHIP_SIZE * p.x;
    this.y = CHIP_SIZE * p.y;
  },

  getMove: function() {
    return this.data.move;
  },

  getColor: function() {
    return this.is_enemy() ? COLOR.enemy : COLOR.player;
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
        let pos = new Pos(x - tr, y - tr);
        let abs = pos.abs();
        if (abs > 0 && abs <= tr) {
          range.push(new Pos(x - tr, y - tr));
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
        let p = pos.add(d);

        // マップ外の場合は処理しない
        if (Common.checkPosIsOver(p)) { return; }
        
        // 移動範囲に入っていない場合
        if (moves[p.y][p.x] == Infinity && attacks[p.y][p.x] == Infinity) {
          attacks[p.y][p.x] = 1;
          return attack_range.push(p);
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