
// ------------------
// 画像を呼び出し一覧化
// ------------------

document.search.btn.addEventListener('click',(e)=>{
    e.preventDefault();

    fetch(createUlr(document.search.key.value))
    .then((data)=>{
        return data.json();
    })
    .then((json)=>{
        createImage(json);
    })
});


function createUlr(value){
    const API_KEY = '';
    let baseUrl = `https://pixabay.com/api/?key=${API_KEY}`;
    let keyWord = `&q=${encodeURIComponent(value)}`;
    let option = '&orientation=horizontal&per_page=40';
    let mainUrl = `${baseUrl}${keyWord}${option}`;
    return mainUrl;
}

function createImage(json){
    let result = document.getElementById('result');

    result.innerHTML = '';

    if(json.totalHits > 0){
        json.hits.forEach(value => {
            let img = document.createElement('img');
            img.classList.add('result-img');
            img.setAttribute('onclick','setImage(this.src);');
            let a = document.createElement('a');
            a.href = value.pageURL;
            a.setAttribute('target','_blank');
            img.src = value.largeImageURL;
            a.appendChild(img);
            result.appendChild(a);
        });
    }else{
        result.textContent = '該当する画像はありません。キーワードを変更して再度検索してください。';
    }
}

// --------------
// 画像解析
// --------------

// APIを利用する
const KEY = '';
const GOOGLE_URL = 'https://vision.googleapis.com/v1/images:annotate?key=';
const GOOGLE_API_URL = GOOGLE_URL + KEY;

// ラベル検出用のテーブルを作成
for(let i = 0;i<10;i++){
    document.getElementById('resultBox').appendChild(document.createTextNode(`<tr><td class="resultTableContent"></td></tr>`));
}

// 画像の表示内容をクリアする
function clear(){
    if(document.querySelector('#textBox tr').length){
        document.querySelector('#textBox tr').remove();
    }
    if(document.querySelector('#chartArea div').length){
        document.querySelector('#chartArea div').remove();
    }
    document.querySelector('#resultBox tr td').textContent = "";
}

// 画像を選択した際に読み出す処理
function setImage(evt){
    getImageInfo(evt);
    clear();
    document.querySelector('.resultArea').removeClass('hidden');
}

// base64に変換
// function toBase64Url(url, callback){
//     var xhr = new XMLHttpRequest();
//     xhr.onload = function() {
//       var reader = new FileReader();
//       reader.onloadend = function() {
//         callback(reader.result);
//       }
//       reader.readAsDataURL(xhr.response);
//     };
//     xhr.open('GET', url);
//     xhr.responseType = 'blob';
//     xhr.send();
//   }
function ImageToBase64(img, mime_type) {
    // New Canvas
    var canvas = document.createElement('canvas');
    canvas.width  = img.width;
    canvas.height = img.height;
    // Draw Image
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    // To Base64
    return canvas.toDataURL(mime_type);
    // let data  = canvas.toDataURL(mime_type);
    // document.getElementById('test').innerText = data;
}

// 選択した画像を読み込み、APIに返すURLを生成する。
function getImageInfo(evt){
    console.log(evt);
    let dataUrl = evt;
    document.getElementById('showPic').innerHTML = `<img src="${dataUrl}" id="analysisImg">`;
    console.log(dataUrl)
    const ANALYSIS_IMG = document.getElementById('analysisImg');
    // let base64Url = ImageToBase64(ANALYSIS_IMG,"image/jpg");
    ImageToBase64(ANALYSIS_IMG,"image/jpg");
    console.log(base64Url);
    makeRequest(base64Url,getAPIInfo);
}



// APIへリクエストに組み込むJsonの組み立て
function makeRequest(dataUrl,callback){
    console.log(dataUrl);
    let end = dataUrl.indexOf(',');
    var request = "{'requests': [{'image': {'content': '" + dataUrl.slice(end + 1) + "'},'features': [{'type': 'LABEL_DETECTION','maxResults': 10,},{'type': 'FACE_DETECTION',},{'type':'TEXT_DETECTION','maxResults': 20,}]}]}";
    callback(request)
}


// 通信を実施
function getAPIInfo(request){
    $.ajax({
        url : api_url,
        type : 'POST',
        async : true,
        cashe : false,
        data: request,
        dataType : 'json',
        contentType: 'application/json',
    }).done(function(result){
        showResult(result);
    }).fail(function(result){
        alert('failed to load the info');
    });
}

// 結果を描画
function showResult(result){
    //ラベル検出結果の表示
    for (var i = 0; i < result.responses[0].labelAnnotations.length;i++){
        $("#resultBox tr:eq(" + i + ") td").text(result.responses[0].labelAnnotations[i].description)
    }
    //表情分析の結果の表示
    if(result.responses[0].faceAnnotations){
        //この変数に、表情のlikelihoodの値を配列として保持する
        var facialExpression = [];
        facialExpression.push(result.responses[0].faceAnnotations[0].joyLikelihood);
        facialExpression.push(result.responses[0].faceAnnotations[0].sorrowLikelihood);
        facialExpression.push(result.responses[0].faceAnnotations[0].angerLikelihood);
        facialExpression.push(result.responses[0].faceAnnotations[0].surpriseLikelihood);
        facialExpression.push(result.responses[0].faceAnnotations[0].headwearLikelihood);
        for (var k = 0; k < facialExpression.length; k++){
            if (facialExpression[k] == 'UNKNOWN'){
                facialExpression[k] = 0;
            }else if (facialExpression[k] == 'VERY_UNLIKELY'){
                facialExpression[k] = 2;
            }else if (facialExpression[k] == 'UNLIKELY'){
                facialExpression[k] = 4;
            }else if (facialExpression[k] == 'POSSIBLE'){
                facialExpression[k] = 6;
            }else if (facialExpression[k] == 'LIKELY'){
                facialExpression[k] = 8;
            }else if (facialExpression[k] == 'VERY_LIKELY'){
                facialExpression[k] = 10;
            }
        }
        //チャート描画の処理
        $("#chartArea").highcharts({
            chart: {
                polar: true,
                type: 'line'
            },
            title: {
                text: 'Expression of a person',
            },
            pane: {
                size: '80%'
            },
            xAxis: {
                categories: ['joy', 'sorrow', 'anger', 'surprise','headwear'],
                tickmarkPlacement: 'on',
                lineWidth: 0
            },
            yAxis: {
                gridLineInterpolation: 'polygon',
                lineWidth: 0,
                max:10,
                min: 0
            },
            tooltip: {
                shared: true,
                pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
            },
            series: [{
                name: 'likelihood',
                data: facialExpression,
                pointPlacement: 'on'
            }]
        })
    }else{
        //表情に関する結果が得られなかった場合、表示欄にはその旨を記す文字列を表示
        $("#chartArea").append("<div><b>No person can be found in the picture</b></div>");
    }
    //テキスト解読の結果を表示
    if(result.responses[0].textAnnotations){
        for (var j = 1; j < result.responses[0].textAnnotations.length; j++){
            if(j < 16){
                $("#textBox").append("<tr><td class='resultTableContent'>" + result.responses[0].textAnnotations[j].description + "</td></tr>")
            }
        }
    }else{
        //テキストに関する結果が得られなかった場合、表示欄にはその旨を記す文字列を表示
        $("#textBox").append("<tr><td class='resultTableContent'><b>No text can be found in the picture</b></td></tr>")
    }
}

// let url = 'https://pixabay.com/api/?key=19346952-383d9d626ea5d38ebed9ba67e';
// fetch( url )
// .then( function( data ) {
//     return data.json();  //JSONデータとして取得
// })
// .then( function( json ) {
//     console.log( json );
// })