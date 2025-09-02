const Tello = require('tello-drone');

// ドローン制御共通関数(Promiseを返す)
function droneControll(sys, cmd) {
  return new Promise((resolve, reject) => {
    console.log('[ドローンコマンド]', cmd)
    const handler = (msg) => {
      console.log("drone:", msg)
      if (typeof msg === 'string') {
        if (msg.indexOf('error') >= 0) {
          // エラーを表示してドローンを緊急着陸させる
          console.error('[ドローンのエラー]', msg)
          sys.tags.__DroneActive.forceSend('emergency')
        }
      }
      if (msg === 'ok') {
        resolve(true)
      } else {
        console.log('→ドローン受信:', msg)
      }
    }
    sys.tags.__DroneActive.forceSend(cmd)
    sys.tags.droneAddHanlder(handler, true)
  })
}

const PluginDrone = {
  'meta': {
      type: 'const',
      value: {
          pluginName: 'nadesiko3-drone', // プラグインの名前
          description: 'Telloのドローンを操作するプラグイン', // プラグインの説明
          pluginVersion: '3.6.0', // プラグインのバージョン
          nakoRuntime: ['wnako', 'cnako'], // 対象ランタイム
          nakoVersion: '3.6.0' // 要求なでしこバージョン
      }
  },
  '初期化': {
    type: 'func',
    josi: [],
    fn: function (sys) {
      sys.__setSysVar('ドローン接続設定', {
        host: '192.168.10.1',
        port: '8889',
        statePort: '8890',
        skipOk: false
      })
      sys.tags.__DroneItems = []
      sys.tags.__DroneActive = null
      sys.tags.__DroneCheckInit = () => {
        if (sys.tags.__DroneActive) {return}
        throw new Error('最初に『ドローン接続』を実行してください。')
      }
      sys.tags.__DroneError = (err) => {
        throw new Error(err)
      }
      // messageハンドラの管理
      sys.tags.droneHandleItems = []
      sys.tags.droneHandleItemsOnce = []
      sys.tags.droneAddHanlder = (handler, isOnce) => {
        const j = sys.tags.droneHandleItemsOnce.indexOf(handler)
        if (j < 0) {
          sys.tags.droneHandleItemsOnce.push(handler)
          return
        }
        const i = sys.tags.droneHandleItems.indexOf(handler)
        if (i < 0) {
          sys.tags.droneHandleItems.push(handler)
        }
      }
      sys.tags.droneRemoveHandler = (handler) => {
        const j = sys.tags.droneHandleItemsOnce.indexOf(handler)
        if (j >= 0) {
          sys.tags.droneHandleItemsOnce.splice(i, 1)
          return
        }
        const i = sys.tags.droneHandleItems.indexOf(handler)
        if (i >= 0) {
          sys.tags.droneHandleItems.splice(i, 1)
        }
      }
    }
  },
  // @ドローン
  'ドローン接続設定': {type: "const", value: null}, // @どろーんせつぞくせってい
  'ドローン接続': { // @ドローンに接続する // @どろーんせつぞく
    type: 'func',
    josi: [],
    asyncFn: true,
    fn: function (sys) {
      const initObj = sys.__getSysVar('ドローン接続設定')
      const drone = new Tello(initObj)
      sys.tags.__DroneActive = drone
      sys.tags.__DroneItems.push(drone)
      // set send
      drone.on("send", (err, length) => {
        if (err) { // エラーが起きた時
          console.log('[drone.send.error]', err);
        }
      })
      // messageハンドラを登録
      sys.tags.__DroneActive.on('message', (msg) => {
        // fire once handlers
        sys.tags.droneHandleItemsOnce.forEach((handler) => {
          handler(msg)
        })
        sys.tags.droneHandleItemsOnce = []
        // fire normal handlers
        sys.tags.droneHandleItems.forEach((handler) => {
          handler(msg)
        })
      })
      // 接続を開始
      return new Promise((resolve, reject) => {
        // 接続待ち
        const handler = (msg) => {
          if (msg === 'ok') {
            resolve(drone)
            return
          }
          if (typeof msg === 'string') {
            if (msg.indexOf('error') >= 0) {
              // エラーを表示してドローンを緊急着陸させる
              console.error('[ドローンのエラー]', msg)
              reject(new Error(msg))
            }
          }
          console.log('[ドローンのメッセージ]', msg)
        }
        // 接続完了時にhandlerを登録
        sys.tags.droneAddHanlder(handler, true)
      })
    }
  },
  'ドローンバッテリ残量取得': { // @ドローンからバッテリ残量を得る // @どろーんばってりざんりょうしゅとく
    type: 'func',
    josi: [],
    asyncFn: true,
    fn: function (sys) {
      return new Promise((resolve, reject) => {
        sys.tags.__DroneActive.forceSend('battery?')
        sys.tags.droneAddHanlder((msg) => {
          const n = parseInt(msg, 10)
          if (isNaN(n)) {
            reject(new Error('バッテリ残量の取得に失敗しました。'))
            return
          }
          resolve(n)
        }, true)
      })
    }
  },
  'ドローン緊急停止': { // @ドローン緊急停止する // @どろーんきんきゅうていし
    type: 'func',
    josi: [],
    fn: function (sys) {
      sys.tags.__DroneCheckInit()
      sys.tags.__DroneActive.forceSend('emergency')
    }
  },
  'ドローン送信': { // @コマンドをドローンに送信する // @どろーんそうしん
    type: 'func',
    josi: [['を','の']],
    asyncFn: true,
    fn: function (cmd, sys) {
      sys.tags.__DroneCheckInit()
      return droneControll(sys, cmd)
    }
  },
  'ドローン接続時': { // @ドローンに接続した時にFを実行する // @どろーんせつぞくしたとき
    type: 'func',
    josi: [['を']],
    fn: function (f, sys) {
      sys.tags.__DroneCheckInit()
      if (typeof f === 'string') {f = sys.__findFunc(f, 'ドローン接続')}
      sys.tags.__DroneActive.on('connection', () => {
        f(sys)
      })
    }
  },
  'ドローン受信時': { // @ドローンからデータを受信した時にFを実行する // @どろーんじゅしんしたとき
    type: 'func',
    josi: [['を']],
    fn: function (f, sys) {
      sys.tags.__DroneCheckInit()
      if (typeof f === 'string') {f = sys.__findFunc(f, 'ドローン接続')}
      sys.tags.__DroneActive.on('message', (msg) => {
        sys.__setSysVar('対象', msg)
        f(msg, sys)
      })
    }
  },
  'ドローン離陸': { // @離陸コマンドをドローンに送信する // @どろーんりりく
    type: 'func',
    josi: [],
    asyncFn: true,
    fn: function (sys) {
      sys.tags.__DroneCheckInit()
      return droneControll(sys, 'takeoff')
    }
  },
  'ドローン着陸': { // @着陸コマンドをドローンに送信する // @どろーんちゃくりく
    type: 'func',
    josi: [],
    asyncFn: true,
    fn: function (sys) {
      sys.tags.__DroneCheckInit()
      return droneControll(sys, 'land')
    }
  },
  'ドローン移動': { // @ドローンを方向(上下左右前後)にN(20-500cm)だけ動かす // @どろーんいどう
    type: 'func',
    josi: [['に','へ'],['だけ']],
    asyncFn: true,
    fn: function (dir, n, sys) {
      sys.tags.__DroneCheckInit()
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
      const command = `${cmd} ${n}`
      return droneControll(sys, command)
    }
  },
  'ドローン回転': { // @ドローンをN(1から360/-1から-360)度だけ右回転させる // @どろーんかいてん
    type: 'func',
    josi: [['だけ']],
    asyncFn: true,
    fn: function (n, sys) {
      sys.tags.__DroneCheckInit()
      let cmd = 'cw'
      if (n < 0) {
        n *= -1
        cmd = 'ccw'
      }
      if (n > 360 || n == 0) {
        n = 360
      }
      return droneControll(sys, `${cmd} ${n}`)
    }
  },
  'ドローン速度設定': { // @ドローンの速度をN(10-100)に設定 // @どろーんそくどせってい
    type: 'func',
    josi: [['に', 'へ']],
    fn: function (n, sys) {
      sys.tags.__DroneCheckInit()
      if (n < 10){n = 10}
      if (n > 100){n = 100}
      sys.tags.__DroneActive.forceSend(`speed ${n}`)
    }
  },
  'ドローンWIFI設定': { // @ドローンのWi-FiをSSIDのPASSに設定 // @どろーんWIFIせってい
    type: 'func',
    josi: [['の'],['に', 'へ']],
    fn: function (ssid, pass, sys) {
      sys.tags.__DroneCheckInit()
      sys.tags.__DroneActive.forceSend(`ap ${ssid} ${pass}`)
    }
  }
}

module.exports = PluginDrone


