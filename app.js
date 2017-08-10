const express = require('express');
const expressHandlebars = require('express-handlebars');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");


const app = express();

app.engine('handlebars', expressHandlebars());
app.set('views', './views');
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(expressValidator());
//configures sessions
app.use(
  session({
    secret: 'stoney boy',
    resave: false,
    saveUninitialized: true
  })
);
//this section tells our program what we want to happen when a new session is
//established
app.use((req, res, next) => {
  //if the session doesn't have this stored(which it will not on any new session)
  //**NOTE** req.session is an object that's created when you start a new session
  //anything .notated after it is adding a new property/key and whatever you set
  //it equal to is the value that is assigned to that key.
  if (!req.session.mysteryWord) {
    //creates the key mysteryWord and sets it equal to a random word from the array
    //assigned to the words variable above(in the requires section)
    req.session.mysteryWord = words[Math.floor(Math.random() * words.length)];
    //creates an array containing the mysteryWord letters broken down into an array
    req.session.wordArray = (req.session.mysteryWord.toLowerCase()).split("");
    //creates the key wordLength and sets it equal to the length of the mysteryWord
    req.session.wordLength = req.session.mysteryWord.length;
    //creates the key blanks and assigns a blank array to it.  This array will
    //contain the blanks that will hold the correctly guessed letters of the
    //mysteryWord

    req.session.turns = 8;
    //**NOTE** we will later call this in the res.render object because it's
    //something we want to be displayed on the page. It is a value that will be
    //assigned to a key in the object.  We will call it's key in the handlebars
    //file to make it show on our page.
    req.session.blanks = [];
    //for loop to create the correct number of blanks
    for (let i = 0; i < req.session.wordLength; i++) {
      req.session.blanks.push("_ ");
    }

    //will hold any letters guessed that are not contained in the mysteryWord
    req.session.notInWord = [];
  };
  //these things will show in the console only after a new session is established
  // console.log('mystery word: ', req.session.mysteryWord);
  console.log('number of turns:', req.session.turns);
  console.log('word array', req.session.wordArray);
  // console.log('word length: ', req.session.wordLength);
  // console.log(req.session.blanks);
  next();


})

//names the root path('/')
app.get('/', (req, res) => {
  //and says that when we access the root to render(display the handlebars file)
  //render requires two params...the file we want to render(handlebars file) and
  //an optional object(in this case we declare a property(variable) in the object that we
  //want to call in the handlebars file)
  res.render('index', {
    //this is called on in handlebars. in this instance it is the variable we will
    //call on to display the blanks/correctly guessed letters
    word: req.session.blanks,
    guesses: req.session.notInWord,
    turns: req.session.turns

  });

})
//tells the program where to POST the information inputted into the form. In this instance
//each time we guess a letter, we want it to POST to the /guesses endpoint. However, i will
//later tell it to redirect to the root/homepage since i would like all information displayed
//on that one endpoint
app.post('/guesses', (req, res) => {
  //declare variable and assign to it what is typed into the input field and submitted.
  //think of req.body as the input box and .guesses because that's the name of the input
  //input field on the handlebars file.
  let guessedLetter = req.body.guess;

  //  req.checkBody('guessedLetter', 'You must enter a guess!').notEmpty();
  //  req.checkBody('guessedLetter', 'You may only enter one letter per guess...').len(1, 1);
  //
  //  req.getValidationResult().then((result) => {
  //      if (!result.isEmpty()) {
  //      throw new Error(result.array().map((item) => item.msg).join(' | '));
  //      } else if (req.session.notInWord.includes(guessedLetter) || req.session.blanks.includes(guessedLetter)) {
  //        throw new Error('You have already guessed that letter...Enter a different letter');
  //      } else {
  //        console.log('No errors')
  //      }
  //    })
  //
  //   .then(() => {
       //do i need a for loop here to iterate over the req.session.blanks array?
      //so i can access the index number?  or do i need to add a param?
      for (let i = 0; i < req.session.wordLength; i++) {
        if (guessedLetter === req.session.wordArray[i]) {
          // add the letter to the __
          console.log("blanks array", req.session.blanks)

          req.session.blanks.splice(i, 1, guessedLetter)

        }
      }

      if (!req.session.wordArray.includes(guessedLetter)) {
        req.session.notInWord.push(guessedLetter)
        req.session.turns--
          console.log("There are no " + guessedLetter + "'s... Guess again!")
        console.log(req.session.notInWord);
      }

      if (req.session.blanks === req.session.wordArray) {
        res.render('index', {
          word: req.session.blanks,
          guesses: req.session.notInWord,
          turns: req.session.turns,
          message: "You Win!"
        })
      } else if (req.session.turns === 0) {
        res.render('index', {
          word: req.session.blanks,
          guesses: req.session.notInWord,
          turns: req.session.turns,
          message: "You've used all your turns! Please try again..."
      })
    }
      res.redirect('/');
    });

  // .catch((error) => {
  //
  //   res.render('home', {
  //     errors: errors,
  //     word: req.session.blanks,
  //     guesses: req.session.notInWord,
  //     turns: req.session.turns
  //   })
  // });



app.listen(3000, () => {

  console.log("app is running")
});
