# nadesiko3-drone

なでしこ3でドローン(tello)を操作するためのライブラリ。

# 手順

- (1) 最初になでしこ3をインストールしてください。
- (2) なでしこ3のcnako3と、Node.jsのnpmにパスを通します。
- (3) 以下のコマンドを実行してください。

```sh
npm install nadesiko3-drone
```

- (4) PCのWi-Fiをドローン「tello-＊＊＊」(＊＊＊は任意の値)に接続
- (5) 以下のコマンドを実行して遊びます。

テストで接続してバッテリの値を取得してみます。
 
```sh
cnako3 check_battery.nako3
```

正しく実行されていたら、上下するだけのサンプルを試してみましょう。

```sh
cnako3 updown.nako3
```

ブラウザを開いて、リンクをクリックするとドローンを操作できます。


## (参考)

- [npm tello-drone](https://www.npmjs.com/package/tello-drone)

### Telloコマンドの詳しい説明

- [tello api doc](https://dl-cdn.ryzerobotics.com/downloads/tello/20180910/Tello%20SDK%20Documentation%20EN_1.3.pdf)
 
 
