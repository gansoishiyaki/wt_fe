//////////////////////////////
// MapCharactor Mapに表示するキャラクター
// 攻撃範囲計算などを行う
//////////////////////////////

var MapCharactor = enchant.Class.create(enchant.Group, {
  camp: CampType.party,
  map: null,
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
    this.skills = data.skills.map(s => new Skill(s));
    this.camp = camp;
    
    // mainスプライト
    this.main = this.mainSprite();
    this.addChild(this.main);

    // キャラクター下部のHP表示
    this.gage = new MiniGage(this);
    this.addChild(this.gage);
    
    this.touch_start = this.main.on(Event.TOUCH_START, e => {
      // プレイヤーターン以外は何もできない
      if (scenes.map.turn != TurnType.player) { return; }

      let map = scenes.map;
      this.is_touch = true;

      // イベント貼り直し
      if (this.timeline) { this.timeline.clear();}

      // キャラ選択中の時は反応しない
      if (map.touchMode != TouchMode.none) { return; }

      map.touchMode = TouchMode.single;

      // 未行動の味方の場合は選択中にする
      if (!this.move_flag && this.is_player()) {
        this.beforePos = this.pos.copy();
        map.lastPos = this.pos.copy();
      }

      map.selectChara = this;

      // 0.5秒後にtouch判定が消えてなかったらロングタップ判定
      this.timeline = this.tl.delay(FPS).then(() => {
        if (!this.is_touch) { return; }
        this.is_touch = false;

        if (map.touchMode != TouchMode.single) {return;}

        // キャラクターステータス表示
        if (this !== map.selectChara) { return; }
        scenes.status.setChara(this);

        // 選択終了
        scenes.map.selectEnd();
      });
    });

    this.main.on(Event.TOUCH_END, e => {
      let map = scenes.map;
      this.is_touch = false;

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
          } else if (map.hitChara(map.lastPos, this))  {
            //敵に攻撃する
            scenes.preBattle.setChara(this, map.hitChara(map.lastPos, this));
            map.selectEnd();
          } else {
            // キャラクターの移動
            map.moveTo(this, map.lastPos);
          }
          break;
        default:
          break;
      }

    });
  },

  setMap: function(map) {
    this.map = map;
  },

  isMap: function() {
    return this.map != null;
  },

  // ターン開始され、移動可能に
  canMove: function() {
    this.move_flag = false;
    this.main.main.resetGrayImage();
  },

  setFullColor: function() {
    this.main.main.resetGrayImage();
  },

  // 行動終了
  moved: function() {
    this.move_flag = true;
    this.main.main.setGrayImage();

    // ターン終了チェック
    scenes.map.checkTurn();
  },

  isMoved: function() {
    return this.move_flag;
  },

  // 本体の画像取得
  mainSprite: function() {
    var group = new Group();
    var sprite = new FSprite({width: CHIP_SIZE, height: CHIP_SIZE});
    sprite.setImage(`img/chara/map/${this.data.id}.png`);
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

  damage: function(damage) {
    this.hp -= damage;
    this.hp = this.hp <= 0 ? 0 : this.hp;
    this.hp = this.hp >= this.maxhp ? this.maxhp : this.hp;
    this.gage.setHP();
  },

  isDead: function() {
    return this.hp <= 0;
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

  isMoreAttack: function(map = false, enemy = null) {
    return (this.getSpd(map, enemy) - enemy.getSpd(map, this)) >= 4;
  },

  // 威力
  getPower: function(map = false, enemy = null) {
    var power = this.getAtk(map, enemy) + this.trigger().atk;
    if (enemy) { power -= enemy.getDef(map, this); }

    return power;
  },

  getDef: function(map = false, enemy = null) {
    return this.data.def;
  },

  getHit: function(map = false, enemy = null) {
    var hit = this.getTeh(map, enemy) * 2 + this.getLuk(map, enemy) / 2 + this.trigger().hit;

    // マップスキル
    if (this.isMap()) {
      let skills = this.map.getFloorSkill(this, Status.hit);
      skills.forEach(s => {hit += s.skill.exec(s.chara, s.by);});
    }

    if (enemy) { hit -= (enemy.getAvo(map, this));}
    hit = Math.floor(hit);

    return hit;
  },

  getAvo: function(map = false, enemy = null) {
    var avo = this.getSpd(map, enemy) * 2 + this.getLuk(map, enemy);

    // allのスキル
    this.skills.filter(s => {
      return s.type == SkillExecType.allways && s.target == SkillTarget.mine && s.status.includes(Status.avo);
    }).forEach(s => {
      avo += s.exec();
    });

    // マップスキル
    if (this.isMap()) {
      let skills = this.map.getFloorSkill(this, Status.avo);
      skills.forEach(s => {avo += s.skill.exec(s.chara, s.by);});
    }

    return avo;
  },

  getCri: function(map = false, enemy = null) {
    var cri = this.getTeh(map, enemy) / 2 + this.trigger().cri;
    if (enemy) { cri -= (enemy.getCriAvo(map, this));}

    return Math.floor(cri);
  },

  getCriAvo: function(map = false, enemy = null) {
    return this.getLuk(map, enemy);
  },

  getAtk: function(map = false, enemy = null) {
    return this.data.atk;
  },

  getSpd: function(map = false, enemy = null) {
    return this.data.spd;
  },

  getTeh: function(map = false, enemy = null) {
    return this.data.teh;
  },

  getLuk: function(map = false, enemy = null) {
    return this.data.luk;
  },

  getMove: function(map = false, enemy = null) {
    return this.data.move;
  },

  getColor: function() {
    return this.is_player() ? COLOR.player : COLOR.enemy;
  },

  getColors: function() {
    return this.is_player() ? COLOR.window.player : COLOR.window.enemy;
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

  // 優先度の高いキャラを取得する
  getMostPriority: function(charas) {
    return charas.reduce((c, result) => {
      let expected = this.getExpected(c);
      let result_expected = this.getExpected(result);
      return expected > result_expected ? c : result;
    });
  },

  // 期待値を取得する
  getExpected: function(chara) {
    let power = this.getPower(this.map, chara);
    let hit = this.getHit(this.map, chara);
    let cri = this.getCri(this.map, chara);
    let cri_power = power + this.getPower();

    var expected = hit * cri * cri_power;
    expected += hit * (100 - cri) * power;
    return expected;
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
    this.gage_width = CHIP_SIZE - this.fontsize;
    this.gage_height = 6;
    this.line = 1;

    this.gage = new Group();
    this.gage.x = this.fontsize - 2;
    this.gage.y = 4;

    // gageの枠
    this.gage.base = new Square(this.gage_width, this.gage_height, "#222222");
    this.gage.addChild(this.gage.base);
    this.addChild(this.gage);

    this.main_height = this.gage_height - this.line * 2;
    this.main_width = this.gage_width - this.line * 2;
    this.gage.main = new GradSquare(this.main_width, this.main_height, {start: "white", end: this.chara.getColor()});
    this.gage.main.x = this.line;
    this.gage.main.y = this.line;
    this.gage.addChild(this.gage.main);

    // hp
    this.setHP();
  },

  setHP: function() {
    // ゲージ
    this.gage.main.scaleX = this.chara.hp / this.chara.maxhp; 
    this.gage.main.x = 1 - this.main_width * (this.chara.maxhp -this.chara.hp) / this.chara.maxhp / 2;

    // 表示HP
    if (this.hp_sprite) {this.removeChild(this.hp_sprite);}
    this.hp_sprite = new FLabel(`${this.chara.hp}`, this.fontsize, 0, 0);
    this.hp_sprite.main.color = this.chara.getColor();
    this.hp_sprite.setShadow();
    this.addChild(this.hp_sprite);
  },
});