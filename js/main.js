//****************************************
// 地図取得
//****************************************

    //****************************************
    //成功関数
    //****************************************
    let map;

    function mapsInit(position) {
      //lat=緯度、lon=経度 を取得
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log(lat);
        console.log(lon);

        //Map表示
        map = new Bmap("#myMap");
        map.startMap(lat, lon, "load", 20); //The place is Bellevue.
        //Pinを追加
        let pin = map.pin(lat, lon, "#ff0000");
        //Infoboxを追加
        map.infobox(lat, lon, "タイトル", "詳細情報を記載");
    };

    //****************************************
    //失敗関数
    //****************************************
    function mapsError(error) {
        let e = "";
        if (error.code == 1) { //1＝位置情報取得が許可されてない（ブラウザの設定）
        e = "位置情報が許可されてません";
        }
        if (error.code == 2) { //2＝現在地を特定できない
        e = "現在位置を特定できません";
        }
        if (error.code == 3) { //3＝位置情報を取得する前にタイムアウトになった場合
        e = "位置情報を取得する前にタイムアウトになりました";
        }
        alert("エラー：" + e);
    };

    //****************************************
    //オプション設定
    //****************************************
    const set = {
        enableHighAccuracy: true, //より高精度な位置を求める
        maximumAge: 20000, //最後の現在地情報取得が20秒以内であればその情報を再利用する設定
        timeout: 10000 //10秒以内に現在地情報を取得できなければ、処理を終了
    };


    //最初に実行する関数
    const getMap = () => {
        navigator.geolocation.getCurrentPosition(mapsInit, mapsError, set);
    }

    // document.getElementById('LocateMeButton').addEventListener('click',()=>{
    //     navigator.geolocation.getCurrentPosition(mapsInit, mapsError, set);
    //     const latDev = position.coords.latitude;
    //     const lonDev = position.coords.longitude;
    //     console.log(latDev);
    //     console.log(lonDev);
    // })



// 写真設定
const snapShot = () => {
    const video  = document.querySelector("#camera");
    const canvas = document.querySelector("#picture");
    const se     = document.querySelector('#se');

    /** カメラ設定 */
    const constraints = {
    audio: false,
    video: {
        width: 300,
        height: 200,
        facingMode: "user"   // フロントカメラを利用する
        // facingMode: { exact: "environment" }  // リアカメラを利用する場合
    }
    };

    /**
     * カメラを<video>と同期
     */
    navigator.mediaDevices.getUserMedia(constraints)
    .then( (stream) => {
    video.srcObject = stream;
    video.onloadedmetadata = (e) => {
        video.play();
    };
    })
    .catch( (err) => {
    console.log(err.name + ": " + err.message);
    });

    /**
     * シャッターボタン
     */
    document.querySelector("#shutter").addEventListener("click", () => {
    const ctx = canvas.getContext("2d");

        // 演出的な目的で一度映像を止めてSEを再生する
        video.pause();  // 映像を停止
        // se.play();      // シャッター音
        setTimeout( () => {
          video.play();    // 0.5秒後にカメラ再開
        }, 500);

        // canvasに画像を貼り付ける
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    });
    };


// 撮影した写真をデータ化する
function getBase64(){
    //img要素オブジェクトを取得する
    var obj = document.getElementById("picture");

    //canvas要素を生成してimg要素を反映する
    var cvs = document.createElement('canvas');
    cvs.width  = obj.width;
    cvs.height = obj.height;
    var ctx = cvs.getContext('2d');
    ctx.drawImage(obj, 0, 0);

    //canvas要素をBase64化する
    var data = cvs.toDataURL("image/png");

    //d1要素に書き出す
    document.getElementById("saveArea").innerText = data;
    }

//スクリーンショットを保存：
document.getElementById('screenShot').addEventListener('click',()=>{

    //HTML内に画像を表示
    html2canvas(document.getElementById('myMap'),{
        onrendered: function(canvas){
        //imgタグのsrcの中に、html2canvasがレンダリングした画像を指定する。
        var imgData = canvas.toDataURL();
        // document.getElementById("result").src = imgData;
        document.getElementById("result").innerText = imgData;
        }
    });

    //   //ボタンを押下した際にダウンロードする画像を作る
    //   html2canvas(document.body,{
    //     onrendered: function(canvas){
    //       //aタグのhrefにキャプチャ画像のURLを設定
    //       var imgData = canvas.toDataURL();
    //       document.getElementById("ss").href = imgData;
    //     }
    //   });

    });