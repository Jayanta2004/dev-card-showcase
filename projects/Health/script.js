let steps=0, calories=0, water=0;

function addSteps(){
  let value=parseInt(document.getElementById("stepsInput").value);
  if(!value)return;
  steps+=value;
  updateProgress(steps,10000,"stepsProgress","stepsStats","steps");
  document.getElementById("stepsInput").value="";
}

function addCalories(){
  let value=parseInt(document.getElementById("calorieInput").value);
  if(!value)return;
  calories+=value;
  updateProgress(calories,2000,"calorieProgress","calorieStats","kcal");
  document.getElementById("calorieInput").value="";
}

function addWater(){
  let value=parseInt(document.getElementById("waterInput").value);
  if(!value)return;
  water+=value;
  updateProgress(water,8,"waterProgress","waterStats","glasses");
  document.getElementById("waterInput").value="";
}

function calculateBMI(){
  let weight=parseFloat(document.getElementById("weight").value);
  let height=parseFloat(document.getElementById("height").value)/100;
  if(!weight||!height)return;

  let bmi=(weight/(height*height)).toFixed(1);
  let status=bmi<18.5?"Underweight":
             bmi<25?"Normal":
             bmi<30?"Overweight":"Obese";

  document.getElementById("bmiResult").innerText="BMI: "+bmi+" ("+status+")";
}