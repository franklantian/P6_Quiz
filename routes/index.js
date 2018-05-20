const express = require('express');
const router = express.Router();


//Importar la controlador de quiz.
const quizController = require('../controllers/quiz');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});
//proyecto I
router.get('/quizzes',function(req, res, next) {

    res.render('quizzes/randomplay', quizController.randomplay);
});

router.get('/quizzes',function(req, res, next) {

    res.render('quizzes/randomcheck/:quizId?answer=respuesta', quizController.randomcheck);
});


// Author page.
router.get('/author', (req, res, next) => {
    res.render('author');
});


// Autoload for routes using :quizId
router.param('quizId', quizController.load);


// Crud de quizzes
router.get('/quizzes',                     quizController.index);
router.get('/quizzes/:quizId(\\d+)',       quizController.show);
router.get('/quizzes/new',                 quizController.new);
router.post('/quizzes',                    quizController.create);
router.get('/quizzes/:quizId(\\d+)/edit',  quizController.edit);
router.put('/quizzes/:quizId(\\d+)',       quizController.update);
router.delete('/quizzes/:quizId(\\d+)',    quizController.destroy);

//Jugar de quizzes.
router.get('/quizzes/:quizId(\\d+)/play',  quizController.play);
router.get('/quizzes/:quizId(\\d+)/check', quizController.check);


module.exports = router;
