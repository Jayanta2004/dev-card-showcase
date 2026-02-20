function normCDF(x) {
  return (1.0 + erf(x / Math.sqrt(2))) / 2.0;
}

function erf(x) {
  let sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);

  let a1 =  0.254829592;
  let a2 = -0.284496736;
  let a3 =  1.421413741;
  let a4 = -1.453152027;
  let a5 =  1.061405429;
  let p  =  0.3275911;

  let t = 1.0/(1.0 + p*x);
  let y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);

  return sign*y;
}

function calculate() {
  let S = parseFloat(document.getElementById("spot").value);
  let K = parseFloat(document.getElementById("strike").value);
  let r = parseFloat(document.getElementById("rate").value);
  let sigma = parseFloat(document.getElementById("volatility").value);
  let T = parseFloat(document.getElementById("time").value);

  let d1 = (Math.log(S/K) + (r + sigma*sigma/2)*T) / (sigma*Math.sqrt(T));
  let d2 = d1 - sigma*Math.sqrt(T);

  let call = S*normCDF(d1) - K*Math.exp(-r*T)*normCDF(d2);
  let put = K*Math.exp(-r*T)*normCDF(-d2) - S*normCDF(-d1);

  let delta = normCDF(d1);
  let gamma = (Math.exp(-d1*d1/2)/(S*sigma*Math.sqrt(2*Math.PI*T)));
  let vega = S*Math.sqrt(T)*(Math.exp(-d1*d1/2)/Math.sqrt(2*Math.PI));

  document.getElementById("callPrice").innerText = call.toFixed(4);
  document.getElementById("putPrice").innerText = put.toFixed(4);
  document.getElementById("delta").innerText = delta.toFixed(4);
  document.getElementById("gamma").innerText = gamma.toFixed(6);
  document.getElementById("vega").innerText = vega.toFixed(4);

  drawPayoffChart(S, K, call, put);
}

let chart;

function drawPayoffChart(S, K, callPrice, putPrice) {
  let prices = [];
  let callPayoff = [];
  let putPayoff = [];

  for (let i = 0.5*S; i <= 1.5*S; i += S/20) {
    prices.push(i.toFixed(2));
    callPayoff.push(Math.max(i-K,0) - callPrice);
    putPayoff.push(Math.max(K-i,0) - putPrice);
  }

  if(chart) chart.destroy();

  chart = new Chart(document.getElementById("payoffChart"), {
    type: 'line',
    data: {
      labels: prices,
      datasets: [
        {
          label: 'Call Profit',
          data: callPayoff,
          borderColor: 'green',
          fill: false
        },
        {
          label: 'Put Profit',
          data: putPayoff,
          borderColor: 'red',
          fill: false
        }
      ]
    }
  });
}
