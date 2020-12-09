
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


// PixabayのAPI呼び出し
function createUlr(value){
    const API_KEY = '';
    let baseUrl = `https://pixabay.com/api/?key=${API_KEY}`;
    let keyWord = `&q=${encodeURIComponent(value)}`;
    let option = '&orientation=horizontal&per_page=200';
    let mainUrl = `${baseUrl}${keyWord}${option}`;
    return mainUrl;
}

// 取得した結果を画像一覧に描画
function createImage(json){
    let result = document.getElementById('result');

    result.innerHTML = '';


    if(json.totalHits > 0){
        // ページャーありの画像の生成方法
        $(function() {
            $('#resultPager').pagination({ // diary-all-pagerにページャーを埋め込む
                dataSource: json.hits,
                pageSize: 20, // 1ページあたりの表示数
                prevText: '&lt; 前へ',
                nextText: '次へ &gt;',
                // ページがめくられた時に呼ばれる
                callback: function(data, pagination) {
                // dataの中に次に表示すべきデータが入っているので、html要素に変換
                $('#result').html(template(data)); // diary-all-contentsにコンテンツを埋め込む
                }
            });
        });
        function template(dataArray) {
            return dataArray.map(function(data) {
            return `<img src="${data.largeImageURL}" class="result-img">`
            })
        }
    }else{
        result.textContent = '該当する画像はありません。キーワードを変更して再度検索してください。';
    }
}

// --------------
// 画像解析
// --------------

// Cloud Vision APIを利用する
const KEY = '';
const GOOGLE_URL = 'https://vision.googleapis.com/v1/images:annotate?key=';
const GOOGLE_API_URL = GOOGLE_URL + KEY;
console.log(GOOGLE_API_URL);

// ラベル検出用のテーブルを作成
for(let i = 0;i<20;i++){
    let tr = document.createElement('tr');
    let td = document.createElement('td');
    td.classList.add('resultTableContent');
    tr.appendChild(td);
    document.getElementById('resultBox').appendChild(tr);
}

// 画像の表示内容をクリアする
function clear(){
    if(document.querySelector('#textBox tr')){
        document.querySelector('#textBox tr').innerHTML = "";
    }
    if(document.querySelector('#chartArea div')){
        document.querySelector('#chartArea div').innerHTML = "";
    }
    document.querySelector('#resultBox tr td').textContent = "";
}


// -------------------
// 画像を選択した際に読み出す処理
// -------------------
    document.getElementById("upLoader").onchange = function(event){
        getImageInfo(event);
        clear();
        let resultArea = document.getElementsByClassName("resultArea");
        for(let m = 0;m<resultArea.length;m++){
            resultArea[m].classList.remove("hidden");
        }
    }

// // ---------------
// // 選択した画像を読み込み、APIに返すURLを生成する。
// // ---------------

function getImageInfo(event){
    var file = event.target.files;
    var reader = new FileReader();
    var dataUrl = "";
    reader.readAsDataURL(file[0]);
    reader.onload = function(){
        dataUrl = reader.result;
        document.getElementById("upLoadImg").innerHTML = `<img src="${dataUrl}" class="upLoadImg">`;
        makeRequest(dataUrl,getAPIInfo);
    }
}

// -------------------
// APIへリクエストに組み込むJsonの組み立て
// -------------------
function makeRequest(dataUrl,callback){
    // console.log(dataUrl);
    let end = dataUrl.indexOf(',');
    var request = "{'requests': [{'image':{'content': '" + dataUrl.slice(end + 1) + "'},'features': [{'type': 'LABEL_DETECTION','maxResults': 20,},{'type': 'FACE_DETECTION',},{'type':'TEXT_DETECTION','maxResults': 20,}]}]}";
    // console.log(request)
    callback(request)
}

// -------------------
// 通信を実施
// -------------------
function getAPIInfo(request){
    $.ajax({
        url : GOOGLE_API_URL,
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

// -------------------
// 結果を描画
// -------------------
function showResult(result){
    console.log(result);
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
        facialExpression.push(result.responses[0].faceAnnotations[0].blurredLikelihood);
        console.log(facialExpression);
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
                text: 'この画像を表すと...',
            },
            pane: {
                size: '80%'
            },
            xAxis: {
                categories: ['喜', '悲', '怒', '驚', '被', '不鮮明'],
                tickmarkPlacement: 'on',
                lineWidth: 0,
                labels: {
                    style: {
                        fontSize: '16px' // x軸の値の文字サイズ
                    }
                }
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
                name: 'line',
                data: facialExpression,
                pointPlacement: 'on'
            }]
        })
    }else{
        //表情に関する結果が得られなかった場合、表示欄にはその旨を記す文字列を表示
        const DIV = document.createElement('div');
        const B = document.createElement('b');
        B.textContent = "No person can be found in the picture";
        DIV.appendChild(B);
        document.getElementById('chartArea').appendChild(DIV);
    }
    //テキスト解読の結果を表示
    if(result.responses[0].textAnnotations){
        for (var j = 1; j < result.responses[0].textAnnotations.length; j++){
            if(j < 16){
                $("#textBox").append("<tr><td class='resultTableContent'>" + result.responses[0].textAnnotations[j].description + "</td></tr>")
            }
        }
    }else{
        $("#textBox").append("<tr><td class='resultTableContent'><b>No text can be found in the picture</b></td></tr>")
    }
}