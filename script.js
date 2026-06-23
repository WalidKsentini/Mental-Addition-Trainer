let sum = 0, startTime = 0;
let qnumber = 0, rnumber = 0, eachTime = 0;
let counter = 0, temp = 0, elapsed=0;
let questionsTimes = [];
let timer = 0, intervalId = null; 

const header = document.getElementById("header")
const examWindow       = document.getElementById("exam-screen");
const optionsWindow    = document.getElementById("options-window");
const statsWindow      = document.getElementById("stats-screen");
const startButton      = document.getElementById("start-btn");
const questionList     = document.getElementById("questions-numbers");
const digitsNumber     = document.getElementById("digits");
const rowsNumber       = document.getElementById("rows");
const questionsQuantity = document.getElementById("numberQuestions");
const answerInput      = document.getElementById("answer-input");
const questionNumberHeader = document.getElementById("question-nb");
const timeElapsed      = document.getElementById("time-elapsed");
const restartButton    = document.getElementById("restart");
const parametersButton = document.getElementById("parameters");
const statsParagraph   = document.getElementById("stats-p");
const statsHeader      = document.getElementById("stats-h");
const quitButton       = document.getElementById("quit");
const timerText        = document.getElementById("timer");
const screenShotButton = document.getElementById("screenshot-btn")
const questionTypeText = document.getElementById("question-type")


function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(diffTime) {
    const minutes      = Math.floor(diffTime / 60000);
    const seconds      = Math.floor((diffTime % 60000) / 1000);
    const milliseconds = Math.floor((diffTime % 1000) / 10);
    return minutes + ":" + String(seconds).padStart(2, "0") + "." + String(milliseconds).padStart(2, "0");
}

function resetState() {
    sum         = 0;
    startTime   = 0;
    eachTime    = 0;
    counter     = 0;
    temp        = 0;
    timer       = 0;
    questionsTimes = [];

    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

function updateHeader() {
    const examVisible = getComputedStyle(examWindow).display !== "none";
    const isMobile = window.innerWidth <= 600;
    header.style.display = (examVisible && isMobile) ? "none" : "flex";
}

function setquestions(rnumber) {
    const extraDigits = 4; 
    answerInput.style.width = (Number(digitsNumber.value) + extraDigits) + "ch";
    answerInput.style.paddingRight = 1+"ch";
    
    answerInput.focus();
    answerInput.value = "";

    const min = 10 ** (digitsNumber.value - 1);
    const max = 10 ** (digitsNumber.value) - 1;
    let newSum = 0;

    questionList.innerHTML = "";
    for (let i = 1; i <= rnumber; i++) {
        const question = document.createElement("li");
        const number   = randomNumber(min, max);
        newSum += number;
        question.dataset.sign = i === 1 ? "" : "+";
        question.textContent  = number;
        questionList.appendChild(question);
    }
    return newSum;
}

function displayResults(times) {
    const results = times
        .map((t, i) => String(i + 1).padStart(2, "0") + ") Time: " + t)
        .join("\n");
    statsHeader.textContent = `Stats\n(${counter-1} Questions)\n`;
    statsParagraph.textContent = results; 
}

function startExam() {
    resetState();  

    optionsWindow.style.display = "none";
    statsWindow.style.display = "none";
    examWindow.style.display    = "flex";

    qnumber   = Number(questionsQuantity.value);
    rnumber   = Number(rowsNumber.value);
    startTime = Date.now();
    temp      = startTime;
    counter   = 1;

    intervalId = setInterval(() => {
        const second = Math.floor(timer / 10);
        const tenths  = timer % 10;
        timerText.textContent = String(second).padStart(2, " ") + "." + tenths;
        timer++;
    }, 100);

    questionNumberHeader.textContent = counter + "/" + qnumber;
    sum = setquestions(rnumber);   
}

function submitAnswer() {
    if (Number(answerInput.value) !== sum) return;

    eachTime = Date.now() - temp;
    timerText.textContent = "0:00.0";
    questionsTimes.push(formatTime(eachTime));
    counter++;

    if (counter <= qnumber) {
        timer = 0;
        questionNumberHeader.textContent = counter + "/" + qnumber;
        sum  = setquestions(rnumber);
        temp = Date.now();
    } else {
        clearInterval(intervalId);     
        intervalId = null;
        examWindow.style.display  = "none";
        statsWindow.style.display = "flex";
        elapsed = formatTime(Date.now() - startTime)
        timeElapsed.textContent   = elapsed;
        questionTypeText.textContent = String(digitsNumber.value) +" Digits\n" + String(rnumber) + " Rows";
        displayResults(questionsTimes);
    }
}

window.addEventListener("resize", updateHeader);

document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (optionsWindow.style.display === "none" && statsWindow.style.display === "none") return; 
    if (document.activeElement === startButton || document.activeElement === restartButton) return; 
    startExam();
});

document.querySelectorAll('.choices input').forEach(input => {
    input.addEventListener("focus", () => input.select());
});

startButton.addEventListener("click", startExam);

examWindow.addEventListener("keydown", (event) => {
    if (event.key === "Escape") quitButton.click();
});

answerInput.addEventListener("keydown", (event) => {
    if (event.key === "Backspace") {
        const start = answerInput.selectionStart;
        const end   = answerInput.selectionEnd;
        if (start === end) {
            event.preventDefault();
            const value          = answerInput.value;
            answerInput.value    = value.substring(0, start) + value.substring(start + 1);
            answerInput.setSelectionRange(start, start);
        }
    }
});

answerInput.addEventListener("blur", () => {
    answerInput.focus();
});

answerInput.addEventListener("input", (event) => {
    if (event.inputType === "deleteContentBackward") return; 

    const lastChar = event.data; 
    if (lastChar && !/^\d$/.test(lastChar)) {
        const len = event.target.value.length;
        event.target.setSelectionRange(len, len);
        return;
    }
    
    const currentPos = event.target.selectionStart;  
    setTimeout(() => {
        event.target.setSelectionRange(currentPos - 1, currentPos - 1); 
    }, 0);

    if (Number(answerInput.value) === sum) {
        submitAnswer();   
    }
});

restartButton.addEventListener("click", () => {
    startExam();
});

parametersButton.addEventListener("click", () => {
    clearInterval(intervalId);     
    intervalId = null;
    statsWindow.style.display  = "none";
    optionsWindow.style.display = "flex";
});

quitButton.addEventListener("click", () => {
    if (counter !== 1) {
        clearInterval(intervalId);      
        intervalId = null;
        examWindow.style.display  = "none";
        statsWindow.style.display = "flex";
        elapsed = formatTime(temp - startTime);
        timeElapsed.textContent   = elapsed;
        questionTypeText.textContent = String(digitsNumber.value) +" Digits\n" + String(rnumber) + " Rows";
        displayResults(questionsTimes); 
    }
    else {
        clearInterval(intervalId);      
        intervalId = null;
        examWindow.style.display  = "none";
        optionsWindow.style.display = "flex";
    }
});

document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener("input", () => {
        const max = Number(input.max);
        const min = Number(input.min);
        if (max && Number(input.value) > max) input.value = max;
        if (min && Number(input.value) < min) input.value = min;
    });
});

screenShotButton.addEventListener("click", () => {
    html2canvas(statsWindow).then(canvas => {
        const link = document.createElement("a");
        const now = new Date();
        const date = now.toLocaleDateString("en-GB").replaceAll("/", "-");
        const timeSet = elapsed.replaceAll(":", ".");
        link.download = `${timeSet}_${date}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
});