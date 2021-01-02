# nadesiko3-drone

なでしこ3でドローン(tello)を操作するためのライブラリ。

# 手順

 - (1) 最初になでしこ3をインストールしてください。
 - (2) なでしこ3のcnako3にパスを通します。
 - (3) 以下のコマンドを実行してください。
 
 ```
$ git clone https://github.com/kujirahand/nadesiko3-drone.git
$ cd nadesiko3-drone
$ npm install
 ```

 - (4) PCのWi-Fiをドローン「tello-＊＊＊」(＊＊＊は任意の値)に接続
 - (5) 以下のコマンドを実行して遊びます。
 
 
テストで接続してバッテリの値を取得してみます。
 
 ```
 $ cnako3 check_battery.nako3
 ```

正しく実行されていたら、上下するだけのサンプルを試してみましょう。

```
$ cnako3 updown.nako3
```

続けて、Webブラウザでドローンを制御してみましょう。

```
$ cnako3 web_remote.nako3
```

ブラウザを開いて、リンクをクリックするとドローンを操作できます。

## API




## (参考)

- [npm tello-drone](https://www.npmjs.com/package/tello-drone)

# Telloコマンドの詳しい説明

 - [tello api doc](https://dl-cdn.ryzerobotics.com/downloads/tello/20180910/Tello%20SDK%20Documentation%20EN_1.3.pdf)
 
 
