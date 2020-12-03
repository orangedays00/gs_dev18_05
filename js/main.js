var firebaseConfig = {
    apiKey: "AIzaSyBCTFrZlmJNMjLnjyAdqdM0RtSPlkFggpk",
    authDomain: "dev18-map.firebaseapp.com",
    databaseURL: "https://dev18-map.firebaseio.com",
    projectId: "dev18-map",
    storageBucket: "dev18-map.appspot.com",
    messagingSenderId: "261842475959",
    appId: "1:261842475959:web:9d6005e5990988be3ba632"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

//firebaseのデーターベース（保存させる場所）を使いますよと言うjsのコードを貼り付ける
// xxxxxスクリプトを貼り付ける
const newPostRef = firebase.database().ref();



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
        // map = new Bmap("#myMap");
        // map.startMap(lat, lon, "load", 20); //The place is Bellevue.
        // //Pinを追加
        // let pin = map.pin(lat, lon, "#ff0000");
        // //Infoboxを追加
        // map.infobox(lat, lon, "タイトル", "詳細情報を記載");
        var map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
            /* No need to set credentials if already passed in URL */
            center: new Microsoft.Maps.Location(lat, lon)
        });
        map.setOptions({
            maxZoom: 18,
            minZoom: 18
        });
        var infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
            title: '今いる場所',
            description: '到着したら、ボタンをクリック',
            actions: [
                { label: '地図を保存',
                eventHandler: function(){
                    navigator.geolocation.getCurrentPosition(mapsInit, mapsError, set);
                    const latDev = position.coords.latitude;
                    const lonDev = position.coords.longitude;
                    
                    newPostRef.push({
                        lat:latDev,
                        lon:lonDev,
                        snapShot:""
                    });


                  } },
                // { label: 'Handler2', eventHandler: function () { alert('Handler2'); } },
                // { label: 'Handler3', eventHandler: function () { alert('Handler3'); } }
            ]
        });
        infobox.setMap(map);
        
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

// ------------------
// 写真設定
// ------------------
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


// --------------
// 写真のスナップショットを保存
// --------------
    function dataKey(snap){
        newPostRef.on("child_added", function (data) {
            // 全てのデータを取得する。
            let key =  data.key;
            newPostRef.child(`${key}`).update({snapShot: `${snap}`});
        });
    }

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
    dataKey(data);
    // console.log(DataKey);

    

    //d1要素に書き出す
    document.getElementById("saveArea").innerText = data;
    }

// -----------------------
// メール送信
// -----------------------
function sendMail(){
    newPostRef.on("child_added",function(data){
        let lat = data.lat;
        let lon = data.lon;
        let snapShot = data.snapShot;
        let key = data.key;
        fetch("https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send", {
            "method": "POST",
            "headers": {
                "x-rapidapi-host": "rapidprod-sendgrid-v1.p.rapidapi.com",
                "x-rapidapi-key": "2c945c3dc7msh925e8e18da683ecp18839bjsnbea8973f7c5b",
                "content-type": "application/json",
                "accept": "application/json"
            },
            "body": {
                "personalizations": [
                    {
                        "to": [
                            {
                                "email": "orangedays8402@gmail.com"
                            }
                        ],
                        "subject": `Hello, World!<br>${lat}<br>${lon}<br>${snapShot}`
                    }
                ],
                "from": {
                    "email": "orangeheart2010@gmail.com"
                },
                "content": [
                    {
                        "type": "text/plain",
                        "value": "Hello, World!"
                    }
                ]
            }
        })
        .then(response => {
            console.log(response);
            newPostRef.child(key).remove();
        })
        .catch(err => {
            console.log(err);
        });
    })
}




// -----------------------
// Gmail APIの実装（うまく動かず）
// -----------------------

// Step 1で取得したOAuthクライアントIDをここに書く。
// const CLIENT_ID = '562545842346-eo5c01nf567em1otdiqn7ctgqnrearl6.apps.googleusercontent.com';

// async function onLoad() {
//   try {
//     // Google APIs Client Libraryの初期化。
//     await gapi.load('client:auth2');
//     await gapi.client.init({
//         clientId: CLIENT_ID,
//         scope: 'https://www.googleapis.com/auth/gmail.send'
//     });
//     await gapi.client.load('gmail', 'v1');
//     console.log('Initialized');
//   } catch (e) {
//     console.error(e);
//   }
// }

// async function signIn() {
//   try {
//     await gapi.auth2.getAuthInstance().signIn();
//     console.log('Signed in');
//   } catch (e) {
//     console.error(e);
//   }
// }

// async function signOut() {
//   try {
//     await gapi.auth2.getAuthInstance().signOut();
//     console.log('Signed out');
//   } catch (e) {
//     console.error(e);
//   }
// }

// async function sendEmail() {
//   try {
//     // 送りたいメールアドレスに書き換えてください。
//     const to = 'orangedays8402@gmail.com';
//     const subject = 'テスト';
//     const body = 'これはテストです。';

//     // サインイン済みかチェック。
//     if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
//       console.error('Sign in first');
//       return;
//     }

//     // メールデータの作成。
//     const mimeData = [
//       `To: ${to}`,
//       'Subject: =?utf-8?B?' + btoa(unescape(encodeURIComponent(subject))) + '?=',
//       'MIME-Version: 1.0',
//       'Content-Type: text/plain; charset=UTF-8',
//       'Content-Transfer-Encoding: 7bit',
//       '',
//       body,
//     ].join('\n').trim();
//     const raw = btoa(unescape(encodeURIComponent(mimeData))).replace(/\+/g, '-').replace(/\//g, '_');

//     // メールの送信。
//     await gapi.client.gmail.users.messages.send({
//       'userId': 'me',
//       'resource': {raw: raw},
//     });
//     console.log('Sent email');

//   } catch (e) {
//     console.error(e);
//   }
// }

//スクリーンショットを保存：
// document.getElementById('screenShot').addEventListener('click',()=>{

//     //HTML内に画像を表示
//     html2canvas(document.getElementById('myMap'),{
//         onrendered: function(canvas){
//         //imgタグのsrcの中に、html2canvasがレンダリングした画像を指定する。
//         var imgData = canvas.toDataURL();
//         // document.getElementById("result").src = imgData;
//         document.getElementById("result").innerText = imgData;
//         }
//     });

    //   //ボタンを押下した際にダウンロードする画像を作る
    //   html2canvas(document.body,{
    //     onrendered: function(canvas){
    //       //aタグのhrefにキャプチャ画像のURLを設定
    //       var imgData = canvas.toDataURL();
    //       document.getElementById("ss").href = imgData;
    //     }
    //   });

    // });

