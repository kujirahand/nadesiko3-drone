const PluginDrone = {
  '初期化': {
    type: 'func',
    josi: [],
    fn: function (sys) {
      sys.__Drone = require('tello-drone')
      sys.__DroneItems = []
      sys.__v0['ドローン接続設定'] = {
        host: '192.168.10.1',
        port: '8889',
        statePort: '8890',
        skipOk: false
      }
      sys.__DroneActive = null
      sys.__DroneCheckInit = () => {
        if (sys.__DroneActive) {return}
        throw new Error('最初に『ドローン初期化』を実行してください。')
      }
      sys.__DroneError = (err) => {
        throw new Error(err)
      }
    }
  },
  // @ドローン
  'ドローン接続設定': {type: "const", value: null}, // @どろーんせつぞくせってい
  'ドローン接続': { // @ドローンに接続する // @どろーんせつぞく
    type: 'func',
    josi: [],
    fn: function (sys) {
      const initObj = sys.__v0['ドローン接続設定']
      const drone = new sys.__Drone(initObj)
      sys.__DroneActive = drone
      sys.__DroneItems.push(drone)
      // set send
      drone.on("send", (err, length) => {
        if (err) { // エラーが起きた時
          console.log('[error]', err);
        }
      });
      return drone
    }
  },
  'ドローン緊急停止': { // @ドローン緊急停止する // @どろーんきんきゅうていし
    type: 'func',
    josi: [],
    fn: function (sys) {
      sys.__DroneCheckInit()
      sys.__DroneActive.forceSend('emergency')
    }
  },
  'ドローン送信': { // @コマンドをドローンに送信する // @どろーんそうしん
    type: 'func',
    josi: [['を','の']],
    fn: function (cmd, sys) {
      sys.__DroneCheckInit()
      console.log('✈ドローン送信:', cmd)
      sys.__DroneActive.forceSend(cmd)
    }
  },
  'ドローン接続時': { // @ドローンに接続した時にFを実行する // @どろーんせつぞくしたとき
    type: 'func',
    josi: [['を']],
    fn: function (f, sys) {
      sys.__DroneCheckInit()
      if (typeof f === 'string') {f = sys.__findFunc(f, 'ドローン接続')}
      sys.__DroneActive.on('connection', () => {
        f(sys)
      })
    }
  },
  'ドローン受信時': { // @ドローンからデータを受信した時にFを実行する // @どろーんじゅしんしたとき
    type: 'func',
    josi: [['を']],
    fn: function (f, sys) {
      sys.__DroneCheckInit()
      if (typeof f === 'string') {f = sys.__findFunc(f, 'ドローン接続')}
      sys.__DroneActive.on('message', (msg) => {
        sys.__v0['対象'] = msg
        f(msg, sys)
      })
    }
  },
  'ドローン離陸': { // @離陸コマンドをドローンに送信する // @どろーんりりく
    type: 'func',
    josi: [],
    fn: function (sys) {
      sys.__DroneCheckInit()
      sys.__DroneActive.forceSend('takeoff')
    }
  },
  'ドローン着陸': { // @着陸コマンドをドローンに送信する // @どろーんちゃくりく
    type: 'func',
    josi: [],
    fn: function (sys) {
      sys.__DroneCheckInit()
      sys.__DroneActive.forceSend('land')
    }
  },
  'ドローン移動': { // @ドローンを方向(上下左右前後)にN(20-500cm)だけ動かす // @どろーんいどう
    type: 'func',
    josi: [['に','へ'],['だけ']],
    fn: function (dir, n, sys) {
      sys.__DroneCheckInit()
      let cmd = 'up'
      dir = dir.substr(0, 1)
      switch (dir) {
        case '上': cmd = 'up'; break
        case '下': cmd = 'down'; break
        case '右': cmd = 'right'; break
        case '左': cmd = 'left'; break
        case '前': cmd = 'forward'; break
        case '後': cmd = 'back'; break
      }
      if (n < 20) {n = 20}
      if (n > 500) { n = 500}
      console.log('command:' + `${cmd} ${n}`)
      sys.__DroneActive.forceSend(`${cmd} ${n}`)
    }
  },
  'ドローン回転': { // @ドローンをN(1から360/-1から-360)度だけ右回転させる // @どろーんかいてん
    type: 'func',
    josi: [['だけ']],
    fn: function (n, sys) {
      sys.__DroneCheckInit()
      let cmd = 'cw'
      if (n < 0) {
        n *= -1
        cmd = 'ccw'
      }
      if (n > 360 || n == 0) {
        n = 360
      }
      sys.__DroneActive.forceSend(`${cmd} ${n}`)
    }
  },
  'ドローン速度設定': { // @ドローンの速度をN(10-100)に設定 // @どろーんそくどせってい
    type: 'func',
    josi: [['に', 'へ']],
    fn: function (n, sys) {
      sys.__DroneCheckInit()
      if (n < 10){n = 10}
      if (n > 100){n = 100}
      sys.__DroneActive.forceSend(`speed ${n}`)
    }
  },
  'ドローンWIFI設定': { // @ドローンのWi-FiをSSIDのPASSに設定 // @どろーんWIFIせってい
    type: 'func',
    josi: [['の'],['に', 'へ']],
    fn: function (ssid, pass, sys) {
      sys.__DroneCheckInit()
      sys.__DroneActive.forceSend(`ap ${ssid} ${pass}`)
    }
  }
}

module.exports = PluginDrone


