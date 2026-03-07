(function(){
const questions=[
{era:'ancient',question:'In which modern country is the ancient city of Babylon located?',options:['Iran','Iraq','Syria','Egypt'],correct:1,explanation:'Babylon was in Mesopotamia, now central Iraq.'},
{era:'ancient',question:'Which empire built Machu Picchu?',options:['Aztec','Inca','Maya','Olmec'],correct:1,explanation:'Machu Picchu is a 15th-century Inca citadel in Peru.'},
{era:'ancient',question:'Who was the first Roman emperor?',options:['Julius Caesar','Augustus','Nero','Trajan'],correct:1,explanation:'Augustus became the first emperor in 27 BC.'},
{era:'ancient',question:'The ancient Chinese philosophy of Daoism is attributed to:',options:['Confucius','Laozi','Sun Tzu','Mencius'],correct:1,explanation:'Laozi authored Tao Te Ching.'},
{era:'medieval',question:'Which dynasty ruled England from 1154 to 1485?',options:['Tudor','Plantagenet','Stuart','Norman'],correct:1,explanation:'Plantagenets ruled from Henry II to Richard III.'},
{era:'medieval',question:'What was the primary language of learning in medieval Europe?',options:['Latin','Greek','Arabic','French'],correct:0,explanation:'Latin was lingua franca of scholars.'},
{era:'medieval',question:'The Battle of Hastings took place in which year?',options:['1066','1215','1065','1154'],correct:0,explanation:'William defeated Harold II in 1066.'},
{era:'medieval',question:'Which city was the capital of the Byzantine Empire?',options:['Rome','Athens','Constantinople','Antioch'],correct:2,explanation:'Constantinople fell in 1453.'},
{era:'earlyModern',question:'Who painted the Sistine Chapel ceiling?',options:['Leonardo da Vinci','Michelangelo','Raphael','Donatello'],correct:1,explanation:'Michelangelo painted it 1508–1512.'},
{era:'earlyModern',question:'The Spanish Armada was defeated in which year?',options:['1588','1603','1568','1642'],correct:0,explanation:'The English fleet defeated Armada 1588.'},
{era:'earlyModern',question:'Which explorer first circumnavigated the globe?',options:['Magellan','Columbus','Drake','da Gama'],correct:0,explanation:'Magellan led expedition 1519–1522.'},
{era:'earlyModern',question:'The Thirty Years\' War ended with which treaty?',options:['Versailles','Westphalia','Utrecht','Tordesillas'],correct:1,explanation:'Peace of Westphalia 1648 ended war.'},
{era:'modern',question:'Which year did the French Revolution begin?',options:['1776','1789','1799','1804'],correct:1,explanation:'Bastille stormed on 14 July 1789.'},
{era:'modern',question:'Who was US president during Cuban Missile Crisis?',options:['Truman','Eisenhower','Kennedy','Johnson'],correct:2,explanation:'John F. Kennedy, 1962.'},
{era:'modern',question:'First transcontinental railroad in US completed in:',options:['1869','1885','1848','1901'],correct:0,explanation:'Golden Spike at Promontory Summit 1869.'},
{era:'modern',question:'Which empire collapsed after World War I?',options:['British','Ottoman','Spanish','Portuguese'],correct:1,explanation:'Ottoman Empire dissolved 1922.'}
];

const eraBtns=document.querySelectorAll('.era-btn');
const questionEl=document.getElementById('questionText');
const optionsContainer=document.getElementById('optionsContainer');
const feedbackEl=document.getElementById('feedbackMessage');
const scoreDisplay=document.getElementById('scoreDisplay');
const questionIndexSpan=document.getElementById('questionIndex');
const eraTagSpan=document.getElementById('eraTag');
const nextBtn=document.getElementById('nextQuestionBtn');
const resetBtn=document.getElementById('resetQuizBtn');
const remainingSpan=document.getElementById('remainingCounter');
const correctCountSpan=document.getElementById('correctCountSpan');
const progressBar=document.getElementById('progressBar');

let currentEra='all',filteredQuestions=[],currentIndex=0,userAnswers=[],quizCompleted=false;

function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}

function applyFilterAndReset(era){
    filteredQuestions=era==='all'? [...questions]:questions.filter(q=>q.era===era);
    filteredQuestions=shuffle(filteredQuestions).slice(0,5);
    currentIndex=0;
    userAnswers=new Array(filteredQuestions.length).fill(-1);
    quizCompleted=false;
    renderQuestion();
    updateUI();
}

function recalcScore(){return userAnswers.reduce((acc,a,i)=>a===filteredQuestions[i].correct?acc+1:acc,0);}
function updateUI(){
    const correct=recalcScore();
    scoreDisplay.textContent=`${correct}/${filteredQuestions.length}`;
    correctCountSpan.textContent=`✅ ${correct} correct`;
    const remaining=filteredQuestions.length - userAnswers.filter(a=>a!==-1).length;
    remainingSpan.textContent=`${remaining} question${remaining!==1?'s':''} left`;
    progressBar.style.width=`${((currentIndex)/filteredQuestions.length)*100}%`;
}

function renderQuestion(){
    if(!filteredQuestions.length){
        questionEl.textContent='No questions for this era.';
        optionsContainer.innerHTML='';
        feedbackEl.textContent='Try another era.';
        nextBtn.disabled=true;
        return;
    }
    const q=filteredQuestions[currentIndex];
    questionEl.textContent=q.question;
    eraTagSpan.textContent=q.era;
    optionsContainer.innerHTML=q.options.map((opt,idx)=>{
        return `<button class="option-btn" data-opt-index="${idx}"><span>${String.fromCharCode(65+idx)}.</span> ${opt}</button>`;
    }).join('');
    document.querySelectorAll('.option-btn').forEach(btn=>btn.addEventListener('click',optionClickHandler));
    feedbackEl.textContent='Select an option above';
    updateUI();
    nextBtn.disabled=false;
}

function optionClickHandler(e){
    const sel=parseInt(e.currentTarget.dataset.optIndex,10);
    userAnswers[currentIndex]=sel;
    const q=filteredQuestions[currentIndex];
    document.querySelectorAll('.option-btn').forEach(btn=>{
        const idx=parseInt(btn.dataset.optIndex,10);
        btn.disabled=true;
        btn.classList.remove('correct','wrong');
        if(idx===q.correct) btn.classList.add('correct');
        if(idx===sel&&sel!==q.correct) btn.classList.add('wrong');
    });
    feedbackEl.innerHTML=sel===q.correct?`✅ correct! ${q.explanation}`:`❌ correct is "${q.options[q.correct]}". ${q.explanation}`;
    updateUI();
}

function goToNext(){
    if(currentIndex<filteredQuestions.length-1){currentIndex++;renderQuestion();}
    else{quizCompleted=true;feedbackEl.innerHTML=`🏁 Quiz finished! You got ${recalcScore()} out of ${filteredQuestions.length} correct.`;nextBtn.disabled=true;}
    updateUI();
}

function resetQuiz(){applyFilterAndReset(currentEra);}
function setEra(era){
    currentEra=era;
    eraBtns.forEach(btn=>btn.dataset.era===era?btn.classList.add('active'):btn.classList.remove('active'));
    applyFilterAndReset(era);
}

eraBtns.forEach(btn=>btn.addEventListener('click',()=>setEra(btn.dataset.era)));
nextBtn.addEventListener('click',goToNext);
resetBtn.addEventListener('click',resetQuiz);

setEra('all');
})();