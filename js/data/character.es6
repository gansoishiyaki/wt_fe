var Chara = function(chara) {
  this.neighbor = false;
  Object.assign(this, chara);

  /**
   * 顔グラ取得
   */
  this.faceImage = function() {
    let image = new FSprite({width: 50, height: 50});
    image.setImage(`img/chara/status/${this.id}.png`);
    return image;
  };

  this.mapImage = function() {
    let image = new FSprite({width: 40, height: 40});
    image.setImage(`img/chara/map/${this.id}.png`);
    return image;
  };
};

let CharaData = {
  hyrein: {
    id: "hyrein",
    name: "ハイレイン",
    role: "アフトクラトル遠征部隊隊長",
    type: 1,
    maxhp: 80,
    atk: 28,
    def: 30,
    teh: 28,
    spd: 22,
    luk: 3,
    move: 2,
    neighbor: true,
    main_trigger: Trigger.alektor,
    skills: [
      SkillData.alektor, 
      SkillData.alektor_drain, 
      SkillData.alektor_guard, 
      SkillData.load
    ],
    images: {
      bard: "img/battle/bard.png",
      fish: "img/battle/fish.png"
    }
  },
  enedora: {
    id: "enedora",
    name: "エネドラ",
    role: "ハイレイン隊",
    type: 1,
    maxhp: 75,
    atk: 25,
    def: 26,
    teh: 27,
    spd: 25,
    luk: 5,
    move: 2,
    neighbor: true,
    main_trigger: Trigger.borboros,
    skills: [
      SkillData.borboros,
      SkillData.orderViolation,
      SkillData.independent,
    ],
    images: {
      brade: 'img/battle/borboros_brade_self.png',
      brade_enemy: 'img/battle/borboros_brade_enemy.png',
    }
  },
  hyuse: {
    id: "hyuse",
    name: "ヒュース",
    role: "ハイレイン隊",
    type: 1,
    maxhp: 42,
    atk: 23,
    def: 20,
    teh: 25,
    spd: 26,
    luk: 12,
    move: 2,
    neighbor: true,
    main_trigger: Trigger.lambillis,
    skills: [],
    images: {
    }
  }, 
}

