// ジョイコン座標の表示グラフ
var canvas = document.getElementById("xy-chart");
var ctx = canvas.getContext("2d");

var chart = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
        label: '',
        borderColor: 'blue',
        data: []
    }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        } 
      },
      scales: {
          x: {
              min: 0,
              max: 280,
              type: 'linear',
              position: 'bottom'
          },
          y: {
              min: 0,
              max: 280,
              type: 'linear',
              position: 'left'
          }
      },
      animations: false
    }
});

var x = 0;
var y = 0;
var waveRadius = 0;

function plotXY(x, y) {
    if (chart.data.datasets[0].data.length > 10) {
        chart.data.datasets[0].data.shift();
    }
    chart.data.datasets[0].data.push({x: 255 - x, y: 255 - y});
    chart.update();
}

function drawWave() {
    if (waveRadius >= 250) {
      waveRadius = 0;
    } else {
      waveRadius++;
    }
    ctx.beginPath();
    ctx.arc(255-x, 255 - y, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = 'red';
    ctx.stroke();
}

// ジョイコンの移動速度のゲージを生成
    var joyconGauge = new JustGage({
    id: "joycon-gauge",
    value: 0,
    min: 0,
    max: 250,
    title: "Joycon Speed",
    label: "m/s"
});

// ゲージの値を更新する関数
function updateJoyconSpeed(speed) {
    joyconGauge.refresh(speed);
}

function calculateJoystickSpeed(prevX, prevY, currX, currY) {
    // xy座標の差分を求める
    const dx = currX - prevX;
    const dy = currY - prevY;

    // 移動距離を求める
    const distance = Math.sqrt(dx*dx + dy*dy);

    // 時間の差分を求める
    // const timeDiff = currTime - prevTime;

    // 移動速度を求める（毎秒ピクセル単位）
    const speed = distance

    return speed;
}

// パーティクル
let particleList = [];
var w = 400;
var h = 400;
var window_w = window.innerWidth;
var window_h = window.innerHeight;
var center_x = parseInt(window_w / 2) - 128;
var center_y = parseInt(window_h / 2) - 128;
var tmp_x = 0;
var tmp_y = 0;

function createParticle(x0, y0) {
  const size = random(10, 60);
  const [x, y, color] = [
    x0 + random(-size / 4, size / 4),
    y0 + random(-size / 4, size / 4),
    [random(90, 290), 50, 50, 100],
  ];
  const lifetime = random(1, 3) * 60;
  const [dx, dy, ds, da] = [
    random(-100, 100) / lifetime,
    random(-100, 100) / lifetime,
    size / lifetime,
    100 / lifetime,
  ];

  const particle = { x, y, size, dx, dy, ds, color, da, lifetime };
  particleList.push(particle);
}

function setup(){
  var p5_canvas = createCanvas(window_w, window_h);
  p5_canvas.parent("main-content");
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);
  background(255);
}

function draw(x,y){
  background(51);
  background(255);

  // ジョイコン座標
  var X = float(255 - x) + center_x;
  var Y = float(y) + center_y;

  if (tmp_x != X || tmp_y != Y ){
    createParticle(X,Y);
  }

  tmp_x = X;
  tmp_y = Y;

  for (const particle of particleList) {
    fill(particle.color);
    circle(particle.x, particle.y, particle.size);
    particle.x -= particle.dx;
    particle.y -= particle.dy;
    particle.size -= particle.ds;
    particle.color[3] -= particle.da;
    particle.lifetime -= 1;
  }

  particleList = particleList.filter((particle) => {
    return particle.lifetime > 0;
  });
}

// グラフの初期化
var waveformChart = new Chart(document.getElementById('waveform-chart'), {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: '',
      data: [],
      borderColor: 'rgba(0, 0, 255, 1)',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      } 
    },
    animation: false,
    scales: {
      x: {
        scaleLabel: {
            display: true,
            labelString: '時間'
        },
        type: 'time',
        time: {
            parser: 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ',
            unit: 'hour',
            stepSize: 1,
            displayFormats: {
                'hour': 'H時'
            },
            min:0,
            max:0,
        }
      },
      y:{
        min: 0,
        max: 250
      }
    }
  }
});

// ジョイコン速度データを保持する配列
var speedData = [];
var updateWaveformChart_interval = 100;

// ボタンのクリックイベントを定義する
var btn30s = document.getElementById('btn-30s');
btn30s.addEventListener('click', function() {
  updateWaveformChart_interval = 30;
});
var btn1m = document.getElementById('btn-1m');
btn1m.addEventListener('click', function() {
  updateWaveformChart_interval = 60;
});
var btn3m = document.getElementById('btn-3m');
btn3m.addEventListener('click', function() {
  updateWaveformChart_interval = 180;
});
var btn5m = document.getElementById('btn-5m');
btn5m.addEventListener('click', function() {
  updateWaveformChart_interval = 300;
});

// データを追加してグラフを更新する関数
function updateWaveformChart(interval) {
  var now = new Date();
  var startTime = new Date(now.getTime() - interval * 1000);

  var newData = [];
  var tmp_result = speedData.filter((element, index) => {
    return index % 10 === 0; // 10個飛ばしで要素をフィルタリング
  });

  newData = tmp_result.slice(-1 * interval);

  waveformChart.data.datasets[0].data = newData;
  waveformChart.options.scales.x.time.min = startTime;
  waveformChart.options.scales.x.time.max = now;
  waveformChart.update();
}

let timeRange = 60; // 初期値: 1分

// 選択ボタンをクリックしたときに実行される関数
function setWaveformTimeRange(time) {
  timeRange = time;
  const now = new Date();
  const fromDate = new Date(now.getTime() - timeRange * 1000);

  // x軸の表示範囲を更新する
  waveformChart.options.scales.x.time.min = fromDate;
  waveformChart.options.scales.x.time.max = now;
  waveformChart.update();
}

// ボタンのクリックイベントを登録する
document.getElementById("btn-30s").addEventListener("click", () => {
  setWaveformTimeRange(30);
  document.getElementById("btn-30s").classList.add("selected");
  document.getElementById("btn-1m").classList.remove("selected");
  document.getElementById("btn-3m").classList.remove("selected");
  document.getElementById("btn-5m").classList.remove("selected");
});

document.getElementById("btn-1m").addEventListener("click", () => {
  setWaveformTimeRange(60);
  document.getElementById("btn-30s").classList.remove("selected");
  document.getElementById("btn-1m").classList.add("selected");
  document.getElementById("btn-3m").classList.remove("selected");
  document.getElementById("btn-5m").classList.remove("selected");
});

document.getElementById("btn-3m").addEventListener("click", () => {
  setWaveformTimeRange(180);
  document.getElementById("btn-30s").classList.remove("selected");
  document.getElementById("btn-1m").classList.remove("selected");
  document.getElementById("btn-3m").classList.add("selected");
  document.getElementById("btn-5m").classList.remove("selected");
});

document.getElementById("btn-5m").addEventListener("click", () => {
  setWaveformTimeRange(300);
  document.getElementById("btn-30s").classList.remove("selected");
  document.getElementById("btn-1m").classList.remove("selected");
  document.getElementById("btn-3m").classList.remove("selected");
  document.getElementById("btn-5m").classList.add("selected");
});

let serialPort;
// 接続切断ボタン
const connectBtn = document.querySelector("#connectButton");
const disconnectBtn = document.querySelector("#disconnectButton");
disconnectBtn.disabled = true;

let disconnectBtn_status = false;

var prevX = 128;
var prevY = 128;
document.getElementById('connectButton').onclick = async () => {
  try {
    // ボタンの有効化・無効化
    connectBtn.disabled = true;
    disconnectBtn.disabled = false;

    serialPort = await navigator.serial.requestPort();
    await serialPort.open({ baudRate: 9600 });

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable
        .pipeThrough(new TransformStream())
        .getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        console.log('Stream closed');
        break;
      }
      // 接続切断ボタン検知
      if(disconnectBtn_status == true){
        reader.releaseLock();
        break;
      }
      // 受信したデータをJSONオブジェクトにパースする
      try {
        const json = JSON.parse(value);
        const x = json.x;
        const y = json.y;
        const is_button_pushed = json.button;
        const speed = calculateJoystickSpeed(prevX, prevY, x, y)

        prevX = x;
        prevY = y;
        updateJoyconSpeed(speed);
        updateWaveformChart(updateWaveformChart_interval);

        speedData.push({
          x: new Date(),
          y: speed
        });
        
        // 最大保持数を超えた場合は先頭を削除する
        if (speedData.length > 60000) {
          speedData.shift();
        }

        // ジョイコンのxy座標をプロットする
        plotXY(x, y);

        // パーティクル
        draw(x,y);

        if (is_button_pushed == 1) {
            drawWave();
        }
      } catch (error) {

      }      
    }

    // シリアル通信中断の処理
    await readableStreamClosed;
  
  } catch (error) {
    console.error(error);
  }
};

disconnectBtn.addEventListener("click", function() {
  // 切断ボタン状態切り替え
  disconnectBtn_status = true;
  // 接続ボタン、切断ボタンの有効化・無効化
  connectBtn.disabled = false;
  disconnectBtn.disabled = true;

  serialPort.close();
  serialPort = null; // シリアルポートを null にする
});