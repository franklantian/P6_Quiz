const Sequelize = require("sequelize");
const {models} = require("../models");


// Autoload the quiz with id equals to :quizId
exports.load = (req, res, next, quizId) => {

    models.quiz.findById(quizId)
    .then(quiz => {
        if (quiz) {
            req.quiz = quiz;
            next();
        } else {
            throw new Error('There is no quiz with id=' + quizId);
        }
    })
    .catch(error => next(error));
};


// GET /quizzes
exports.index = (req, res, next) => {

    models.quiz.findAll()
    .then(quizzes => {
        res.render('quizzes/index.ejs', {quizzes});
    })
    .catch(error => next(error));
};


// GET /quizzes/:quizId
exports.show = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/show', {quiz});
};


// GET /quizzes/new
exports.new = (req, res, next) => {

    const quiz = {
        question: "", 
        answer: ""
    };

    res.render('quizzes/new', {quiz});
};

// POST /quizzes/create
exports.create = (req, res, next) => {

    const {question, answer} = req.body;

    const quiz = models.quiz.build({
        question,
        answer
    });

    // Saves only the fields question and answer into the DDBB
    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz created successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/new', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error creating a new Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/edit
exports.edit = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/edit', {quiz});
};


// PUT /quizzes/:quizId
exports.update = (req, res, next) => {

    const {quiz, body} = req;

    quiz.question = body.question;
    quiz.answer = body.answer;

    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz edited successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/edit', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error editing the Quiz: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId
exports.destroy = (req, res, next) => {

    req.quiz.destroy()
    .then(() => {
        req.flash('success', 'Quiz deleted successfully.');
        res.redirect('/quizzes');
    })
    .catch(error => {
        req.flash('error', 'Error deleting the Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
exports.play = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || '';

    res.render('quizzes/play', {
        quiz,
        answer
    });
};


// GET /quizzes/:quizId/check
exports.check = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz,
        result,
        answer
    });
};


//Practica6 randomplay al azar una pregunta en BBDD,sin repetir la pregunta.
//GET quizzes/randomplay
exports.randomplay = (req, res, next) => {



    //Si session es vacio,desde 0
    if(req.session.randomplay === undefined) {
        req.session.nota = 0;

        models.quiz.findAll()
            .then(quiz => {
                req.session.randomplay = quiz;
                req.session.idofquiz = Math.floor(Math.random()*req.session.randomplay.length);
                res.render('quizzes/random_play', {
                    quiz : req.session.randomplay[req.session.idofquiz],
                    score: req.session.nota
                });

            })
    }
    //Ya exite alguna quiz en session.
    else {

        req.session.idofquiz = Math.floor(Math.random()*req.session.randomplay.length);
        res.render('quizzes/random_play', {
            quiz: req.session.randomplay[req.session.idofquiz],
            score: req.session.nota
        });

    }




};

exports.randomcheck = (req, res, next) => {
    let result = false;
    let nota = -1;



    if(trimm(req.query.answer) === trimm(req.session.randomplay[req.session.idofquiz]).answer){
        req.session.nota++;
        nota = req.session.nota;
        result = true;
        req.session.randomplay.splice(req.session.idofquiz, 1);


        if(req.session.randomplay.length === 0) {

                    res.render('quizzes/random_nomore', {
                        score: req.session.nota
                    });


        }
        else{
                res.render('quizzes/random_result', {
                    score: nota,
                    result: result,
                    answer: req.session.randomplay[req.session.idofquiz].answer
                });
        }
    }
    else{
        nota = req.session.nota;
        res.session.nota = 0;

        res.render('quizzes/random_result', {
            score: nota,
            result: result,
            answer: req.query.answer
        });
    }



};

trimm = rl => {
    rl = rl.replace(/\s+/g,"");
    rl = rl.toUpperCase();
    rl = rl.toLowerCase();
    rl = rl.trim();
    return rl;
};
