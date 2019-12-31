/* 
* Refactor all code
* Support for english
*/

appName = "GeoQuiz!";

function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

class QuizApp {
    constructor() {
        // Screens
        this.menuScreen = document.getElementById("menu-screen");
        this.quizScreen = document.getElementById("quiz-screen");
        this.flashcardScreen = document.getElementById("flashcard-quiz-screen");
        this.resultScreen = document.getElementById("result-screen");

        // Buttons
        this.quitButton = document.getElementById("quit-button");
        this.retryButton = document.getElementById("retry-button");

        // Text input
        this.answerInput = document.getElementById("answer-input");
        this.answerInput.addEventListener("keydown", this.answerInputCallback.bind(this));

        // Labels
        this.questionLabel = document.getElementById("question-label");
        this.resultLabel = document.getElementById("result-label");
        this.answerLabel = document.getElementById("answer-label");
        this.answerLabel.toggled = false;
        this.wrongLabel = document.getElementById("wrong-label");
        this.correctLabel = document.getElementById("correct-label");

        // Range input
        this.maxInput = document.getElementById("max-input");
        this.maxInput.max = data.countries.length;
        this.maxInput.addEventListener("input", this.maxInputHandler.bind(this));

        this.minInput = document.getElementById("min-input");
        this.minInput.addEventListener("input", this.minInputHandler.bind(this));
        
        // Flag related stuff
        this.flagImg = document.getElementById("flag-img");
        this.flagFileNames = this.getFlagFileNames();
        this.isFlagQuiz = false;

        // Misc.
        this.answerLabelWrapper = document.getElementById("answer-label-wrapper");
        this.resultLabelWrapper = document.getElementById("result-label-wrapper");
        this.flashcardsRadio = document.getElementById("flashcards-radio");
        this.flashcardsQuestionLabelDiv = document.getElementById("flashcards-question-label-div");
        this.flashcardsQuestionLabel = document.getElementById("flashcards-question-label");
    }

    getFlagFileNames() {
        let countries = data.countries.slice();
        countries.map(function(val, i, arr) {
            arr[i] = "flags/" + arr[i] + ".png";
        });
        return countries;
    }

    maxInputHandler(e) {
        let newVal = parseInt(e.target.value);
        let min = parseInt(this.minInput.value);
        if (newVal < min)
            newVal = min;
        else if (newVal > this.maxInput.max)
            newVal = this.maxInput.max;
        this.maxInput.value = newVal.toString();
    }

    minInputHandler(e) {
        let newVal = parseInt(e.target.value);
        let max = parseInt(this.maxInput.value);
        if (newVal > max)
            newVal = max;
        else if (newVal < this.minInput.min)
            newVal = this.minInput.min;
        this.minInput.value = newVal.toString();
    }

    capitalsButtonCallback(button) {
        let quizScreen = this.quizScreen;
        if (this.flashcardsRadio.checked) {
            this.isFlashcardQuiz = true;
            quizScreen = this.flashcardScreen; 
        }

        this.createNewQuiz(
            this.getSelectedRange(data.countries),
            this.getSelectedRange(data.capitals),
            quizScreen);
    }

    countriesButtonCallback(button) {
        let countries = this.getSelectedRange(data.countries);
        let capitals = this.getSelectedRange(data.capitals);
        
        let capitalsFiltered = [];
        let countriesFiltered = [];

        for (let i = 0; i < capitals.length; i++) {
            if (capitals[i] !== "Ingen officiell huvudstad") {
                countriesFiltered.push(countries[i]);
                capitalsFiltered.push(capitals[i]);
            }
        }
        
        if (capitalsFiltered.length === 0)
            alert("Inga huvudstäder funna, välj ett annat intervall.") 
        else {
            let quizScreen = this.quizScreen;
            if (this.flashcardsRadio.checked) {
                this.isFlashcardQuiz = true;
                quizScreen = this.flashcardScreen; 
            }
            this.createNewQuiz(capitalsFiltered, countriesFiltered, quizScreen);
        }
    }

    flagsButtonCallback(button) {
        this.isFlagQuiz = true;
        this.isFlashcardQuiz = true
        this.createNewQuiz(
            this.getSelectedRange(this.flagFileNames),
            this.getSelectedRange(data.countries),
            this.flashcardScreen);
    }

    getSelectedRange(array) {
        let range = this.getRange();
        return array.slice(range.min-1, range.max);
    }

    retryButtonCallback(button) {
        let failedTasks = this.quiz.result.failedTasks;
        this.resultLabelWrapper.style.padding = "0";
        this.createNewQuiz(Object.keys(failedTasks), Object.values(failedTasks), this.currentQuizScreen);
    }

    turnCardButtonCallback(button) {
        if (this.answerLabel.toggled)
            this.hideHint();
        else
            this.showHint();
    }

    hideHint() {
        this.answerLabel.textContent = "";
        this.answerLabel.style.padding = "0";
        this.answerLabel.toggled = false;
    }

    showHint() {
        this.answerLabel.textContent = this.quiz.currentAnswer;
        this.answerLabel.style.padding = "10px";
        this.answerLabel.toggled = true;
    }

    quitButtonCallback(button) {
        this.isFlagQuiz = false;
        this.isFlashcardQuiz = false;
        document.title = appName;
        this.hideHint();
        this.resultLabelWrapper.style.padding = "0";
        this.transitionTo(this.menuScreen);
    }

    createNewQuiz(questions, answers, quizScreen) {
        if (questions.length !== answers.length)
            throw "The number of questions must be the same as the number of answers."
        
        this.quiz = new Quiz(questions, answers);
        this.numQuestions = questions.length;
        this.updateQuestion();

        this.resultLabel.textContent = "";
        this.answerInput.disabled = false;
        this.quitButton.disabled = false;
        this.currentQuestionNum = 0;
        document.title = appName + " 0/" + this.numQuestions.toString();

        this.currentQuizScreen = quizScreen;
        this.transitionTo(quizScreen);
        this.answerInput.focus();
    }

    getRange() {
        return {
            min: parseInt(this.minInput.value),
            max: parseInt(this.maxInput.value)
        };
    }

    updateQuizScreen() {
        this.currentQuestionNum++;
        document.title = appName + " " + this.currentQuestionNum + "/" + this.numQuestions;

        if (this.quiz.isDone()) {
            this.updateResultScreen();
            if (this.isFlagQuiz || this.isFlashcardQuiz)
                this.transitionTo(this.resultScreen);
            else {
                this.answerInput.disabled = true;
                this.quitButton.disabled = true;
                setTimeout(this.transitionTo.bind(this, this.resultScreen), 1500);
            }
        }
        else {
            this.updateQuestion();
        }
    }

    updateResultScreen() {
        let result = this.quiz.result;
        this.correctLabel.textContent = "Antal rätt: " + result.numCorrectAnswers.toString() + " av " + this.numQuestions;

        let noFailedTasks = Object.keys(result.failedTasks).length === 0;
        if (noFailedTasks)
            this.retryButton.style.display = "none";
        else
            this.retryButton.style.display = "inline";
    }

    updateQuestion() {
        if (this.isFlagQuiz) {
            this.flagImg.src = this.quiz.currentQuestion;
            this.flagImg.style.display = "block";
            this.flashcardsQuestionLabelDiv.style.display = "none";
        }
        else if (this.isFlashcardQuiz) {
            this.flashcardsQuestionLabel.textContent = this.quiz.currentQuestion;
            this.flashcardsQuestionLabelDiv.style.display = "block";
            this.flagImg.style.display = "none";
        }
        else {
            this.questionLabel.textContent = this.quiz.currentQuestion;
            this.answerInput.value = "";
        }
    }

    answerInputCallback(event) {
        if (event.key !== "Enter")
            return;

        let solution = this.quiz.currentQuestion + " - " + this.quiz.currentAnswer;
        let answerWasCorrect = this.quiz.checkAnswer(this.answerInput.value.trim()); //TODO: Change name of checkAnswer to reflect that the function also fetches the next question.

        if (answerWasCorrect) {
            this.resultLabel.textContent = "Korrekt!";
            this.resultLabelWrapper.classList.remove("red-box");
            this.resultLabelWrapper.classList.add("green-box");
            this.resultLabelWrapper.style.padding = "10px";
        }
        else {
            this.resultLabelWrapper.classList.add("red-box");
            this.resultLabelWrapper.classList.remove("green-box");
            this.resultLabelWrapper.classList.add("red-box");
            this.resultLabelWrapper.style.padding = "10px";
            this.resultLabel.textContent = solution;
        }

        this.updateQuizScreen();
    }

    correctButtonCallback(button) {
        this.quiz.checkAnswer(this.quiz.currentAnswer);
        this.hideHint();
        this.updateQuizScreen();
    }

    incorrectButtonCallback(button) {
        this.quiz.checkAnswer("incorrect");
        this.hideHint();
        this.updateQuizScreen();
    }

    transitionTo(screen) {
        this.menuScreen.style.display = "none";
        this.quizScreen.style.display = "none";
        this.flashcardScreen.style.display = "none";
        this.resultScreen.style.display = "none";
        screen.style.display = "flex";
    }
}

class Quiz {
    constructor(questions, answers) {
        this.questions = questions.slice();
        this.answers = answers.slice();
        this.numQuestions = questions.length;

        this.failedTasks = {};
        this.numCorrectAnswers = 0;

        this.goToNextTask();
    }

    get currentQuestion() {
        return this.questions[this.currentIndex];
    }

    get currentAnswer() {
        return this.answers[this.currentIndex];
    }

    checkAnswer(answer) {
        let currentAnswer = this.answers[this.currentIndex];
        let answerIsCorrect = answer.toLowerCase() === currentAnswer.toLowerCase();

        if (answerIsCorrect)
            this.correctAnswerGiven()
        else
            this.incorrectAnswerGiven();

        if (!this.isDone())
            this.goToNextTask();

        return answerIsCorrect;
    }

    correctAnswerGiven() {
        this.numCorrectAnswers++;
    }

    incorrectAnswerGiven() {
        this.failedTasks[this.currentQuestion] = this.currentAnswer;
    }

    goToNextTask() {
        if (this.isDone())
            throw "No questions left.";
        this.removeCurrentTask();
        this.currentIndex = randomInt(this.questions.length);
    }

    removeCurrentTask() {
        if (typeof this.currentIndex !== "undefined") {
            this.questions.splice(this.currentIndex, 1);
            this.answers.splice(this.currentIndex, 1);
        }
    }

    isDone() {
        return this.questions.length === 0;
    }

    get result() {
        if (!this.isDone())
            throw "Quiz is not done yet."
        
        return {
            numCorrectAnswers: this.numCorrectAnswers,
            failedTasks: this.failedTasks
        }
    }
}

function main() {
    quiz = new QuizApp();
}
