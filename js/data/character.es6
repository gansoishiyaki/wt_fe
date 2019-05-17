let Chara = {
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
      SkillData.rengeki, 
      SkillData.load
    ],
    images: {
      bard: "img/battle/bard.png",
      fish: "img/battle/fish.png"
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
    images: {}
  }, 
}

