let MapStatus = {
  test: {
    file: "map",
    type: [{
      hit: false,
    },
    {
      hit: true
    }],
  }
};

let Maps = {
  test: {
    chip: MapStatus.test,
    data: [
      [1,1,0,0,0,0],
      [1,0,0,0,1,0],
      [0,0,0,0,0,0],
      [1,1,0,0,0,0],
      [0,0,0,1,0,0],
      [0,0,0,0,1,0],
      [0,0,0,0,0,1],
      [0,1,0,0,1,1]
    ],
    enemies: [{
      chara: Chara.hyrein,
      x: 3,
      y: 1
    },],
    players: [
      {x: 3, y: 6},
    ],
  },
};