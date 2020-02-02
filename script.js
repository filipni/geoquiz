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
        this.hintLabel = document.getElementById("hint-label");
        this.hintLabel.toggled = false;
        this.wrongLabel = document.getElementById("wrong-label");
        this.correctLabel = document.getElementById("correct-label");
        this.flashcardQuestionLabel = document.getElementById("flashcards-question-label");

        // Wrapper divs around labels
        this.hintLabelWrapper = document.getElementById("hint-label-wrapper");
        this.resultLabelWrapper = document.getElementById("result-label-wrapper");
        this.flashcardQuestionLabelWrapper = document.getElementById("flashcards-question-label-div");

        // Range input
        this.startInput = document.getElementById("start-input");
        this.startInput.addEventListener("input", this.startInputCallback.bind(this));

        this.stopInput = document.getElementById("stop-input");
        this.stopInput.max = data.countries.length;
        this.stopInput.addEventListener("input", this.stopInputCallback.bind(this));
        
        // Flag related stuff
        this.flagImg = document.getElementById("flag-img");
        this.flagFileNames = this.getFlagFileNames();
        this.isFlagQuiz = false;

        // Radio buttons
        this.flashcardRadio = document.getElementById("flashcards-radio");

        // Misc initialization
        this.resetQuiz();
    }

    getFlagFileNames() {
        let countries = data.countries.slice();
        countries.map(function(val, i, arr) {
            arr[i] = "flags/" + arr[i] + ".png";
        });
        return countries;
    }

    startInputCallback(e) {
        let newVal = parseInt(e.target.value);
        let max = parseInt(this.stopInput.value);
        if (newVal > max)
            newVal = max;
        else if (newVal < this.startInput.min)
            newVal = this.startInput.min;
        this.startInput.value = newVal.toString();
    }

    stopInputCallback(e) {
        let newVal = parseInt(e.target.value);
        let min = parseInt(this.startInput.value);
        if (newVal < min)
            newVal = min;
        else if (newVal > this.stopInput.max)
            newVal = this.stopInput.max;
        this.stopInput.value = newVal.toString();
    }

    capitalsButtonCallback(button) {
        let quizScreen = this.quizScreen;
        if (this.flashcardRadio.checked) {
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

        /* Some countries does not have a capital, so we need to remove them */
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
            if (this.flashcardRadio.checked) {
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

    getRange() {
        return {
            min: parseInt(this.startInput.value),
            max: parseInt(this.stopInput.value)
        };
    }

    turnCardButtonCallback(button) {
        if (this.hintLabel.toggled)
            this.hideHint();
        else
            this.showHint();
    }

    retryButtonCallback(button) {
        this.hideAnswers();
        let failedQuestions = this.quiz.result.failedQuestions;
        this.createNewQuiz(Object.keys(failedQuestions), Object.values(failedQuestions), this.currentQuizScreen);
    }

    quitButtonCallback(button) {
        this.resetQuiz();
    }

    hideAnswers() {
        this.hideHint();
        this.hideElement(this.hintLabelWrapper);
        this.hideElement(this.resultLabelWrapper);
    }

    hideHint() {
        this.hideElement(this.hintLabelWrapper);
        this.hintLabel.toggled = false;
    }

    showHint() {
        this.hintLabel.textContent = this.quiz.currentAnswer;
        this.showElement(this.hintLabelWrapper);
        this.hintLabel.toggled = true;
    }

    hideElement(elem) {
        elem.style.display = "none";
    }

    showElement(elem) {
        elem.style.display = "inline";
    }

    resetQuiz() {
        document.title = appName;
        this.isFlagQuiz = false;
        this.isFlashcardQuiz = false;
        this.hideAnswers();
        this.transitionTo(this.menuScreen);
    }

    createNewQuiz(questions, answers, quizScreen) {
        if (questions.length !== answers.length)
            throw "The number of questions must be the same as the number of answers."
        
        this.numQuestions = questions.length;
        this.currentQuestionNum = 0;
        this.updateTitle();

        this.quiz = new Quiz(questions, answers);
        this.updateQuestion();

        if (this.isFlagQuiz) {
            this.showElement(this.flagImg);
            this.hideElement(this.flashcardQuestionLabelWrapper);
        }
        else if (this.isFlashcardQuiz) {
            this.showElement(this.flashcardQuestionLabelWrapper);
            this.hideElement(this.flagImg);
        }

        this.answerInput.disabled = false;
        this.quitButton.disabled = false;

        this.currentQuizScreen = quizScreen;
        this.transitionTo(quizScreen);

        this.answerInput.focus();
    }

    transitionTo(screen) {
        this.menuScreen.style.display = "none";
        this.quizScreen.style.display = "none";
        this.flashcardScreen.style.display = "none";
        this.resultScreen.style.display = "none";
        screen.style.display = "flex";
    }

    updateQuizScreen() {
        this.currentQuestionNum++;
        this.updateTitle();

        this.hideHint();

        if (this.quiz.isDone())
            this.finishQuiz()
        else 
            this.updateQuestion();
    }

    updateTitle() {
        document.title = appName + " " + this.currentQuestionNum + "/" + this.numQuestions;
    }

    updateQuestion() {
        if (this.isFlagQuiz)
            this.flagImg.src = this.quiz.currentQuestion;
        else if (this.isFlashcardQuiz)
            this.flashcardQuestionLabel.textContent = this.quiz.currentQuestion;
        else {
            this.questionLabel.textContent = this.quiz.currentQuestion;
            this.answerInput.value = "";
        }
    }

    answerInputCallback(event) {
        if (event.key !== "Enter")
            return;

        let solution = this.quiz.currentQuestion + " - " + this.quiz.currentAnswer;
        let answerWasCorrect = this.quiz.giveAnswer(this.answerInput.value.trim());

        if (answerWasCorrect) {
            this.resultLabel.textContent = "Korrekt!";
            this.resultLabelWrapper.classList.remove("red-box");
            this.resultLabelWrapper.classList.add("green-box");
        }
        else {
            this.resultLabel.textContent = solution;
            this.resultLabelWrapper.classList.remove("green-box");
            this.resultLabelWrapper.classList.add("red-box");
        }
        this.showElement(this.resultLabelWrapper);

        this.updateQuizScreen();
    }

    correctButtonCallback(button) {
        this.quiz.giveAnswer(this.quiz.currentAnswer);
        this.updateQuizScreen();
    }

    incorrectButtonCallback(button) {
        this.quiz.giveAnswer("incorrect");
        this.updateQuizScreen();
    }

    finishQuiz() {
        this.updateResultScreen();
        if (this.isFlagQuiz || this.isFlashcardQuiz)
            this.transitionTo(this.resultScreen);
        else {
            /* The transtion to the result screen is delayed for the word quiz, 
            to give the user a chance to see the result from the last question */ 
            this.answerInput.disabled = true;
            this.quitButton.disabled = true;
            this.delayedTransitionTo(this.resultScreen);
        }
    } 

    updateResultScreen() {
        let result = this.quiz.result;
        this.correctLabel.textContent = "Antal rätt: " + result.numCorrectAnswers.toString() + " av " + this.numQuestions;

        let noFailedQuestions = Object.keys(result.failedQuestions).length === 0;
        if (noFailedQuestions)
            this.hideElement(this.retryButton);
        else
            this.showElement(this.retryButton);
    }

    delayedTransitionTo(screen) {
        setTimeout(this.transitionTo.bind(this, screen), 1500);
    }
}

class Quiz {
    constructor(questions, answers) {
        this.questions = questions.slice();
        this.answers = answers.slice();

        this.failedQuestions = {};
        this.numCorrectAnswers = 0;

        this.fetchNextQuestion();
    }

    get currentQuestion() {
        return this.questions[this.currentIndex];
    }

    get currentAnswer() {
        return this.answers[this.currentIndex];
    }

    giveAnswer(answer) {
        let answerIsCorrect = answer.toLowerCase() === this.currentAnswer.toLowerCase();

        if (answerIsCorrect)
            this.numCorrectAnswers++;
        else
            this.failedQuestions[this.currentQuestion] = this.currentAnswer;

        if (!this.isDone())
            this.fetchNextQuestion();

        return answerIsCorrect;
    }

    fetchNextQuestion() {
        if (this.isDone())
            throw "No questions left.";
        this.removeCurrentQuestion();
        this.currentIndex = randomInt(this.questions.length);
    }

    removeCurrentQuestion() {
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
            failedQuestions: this.failedQuestions
        }
    }
}

function main() {
    quiz = new QuizApp();
}
