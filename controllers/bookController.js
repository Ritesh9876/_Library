const Book = require("../models/book.model");
const Author = require("../models/author.model");
const Genre = require("../models/genre.model");
const BookInstance = require("../models/bookinstance.model");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.index = (req, res) => {
  async.parallel(
    {
      book_count(callback) {
        Book.countDocuments({}, callback);
      },
      book_instance_count(callback) {
        BookInstance.countDocuments({}, callback);
      },
      book_instance_available_count(callback) {
        BookInstance.countDocuments({ status: "Available" }, callback);
      },
      author_count(callback) {
        Author.countDocuments({}, callback);
      },
      genre_count(callback) {
        Genre.countDocuments({}, callback);
      },
    },
    function (err, result) {
      console.log(err);
      res.render("index", { title: "Library Home", error: err, data: result });
    }
  );
};
exports.book_list = (req, res, next) => {
  Book.find({}, "title author")
    .sort({ title: 1 })
    .populate("author")
    .exec(function (err, list_books) {
      if (err) {
        return next(err);
      }

      res.render("book_list", { title: "Book list", book_list: list_books });
    });
};
exports.book_detail = (req, res, next) => {
  async.parallel(
    {
      book(callback) {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      book_instance(callback) {
        BookInstance.find({ book: req.params.id }).exec(callback);
      },
    },
    (err, result) => {
      if (err) return next(err);
      if (result.book == null) {
        var err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }
      res.render("book_detail", {
        title: result.book.title,
        book: result.book,
        book_instances: result.book_instance,
      });
    }
  );
};

exports.book_create_get = (req, res, next) => {
  async.parallel(
    {
      authors(callback) {
        Author.find(callback);
      },
      genres(callback) {
        Genre.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("book_form", {
        title: "Create Book",
        authors: results.authors,
        genres: results.genres,
      });
    }
  );
};

exports.book_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = [req.body.genre];
    }
    next();
  },

  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          authors(callback) {
            Author.find(callback);
          },
          genres(callback) {
            Genre.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = "true";
            }
          }
          res.render("book_form", {
            title: "Create Book",
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      book.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect(book.url);
      });
    }
  },
];

exports.book_delete_get = (req, res, next) => {
  const id = req.params.id.trim().toString();
  console.log(req.params.id);
  async.parallel(
    {
      book(callback) {
        Book.find({ _id: id }, "title").exec(callback);
      },
      bookinstances(callback) {
        BookInstance.find({ book: id }).exec(callback);
      },
    },
    (err, result) => {
      if (err) return next(err);
      console.log(result.book);
      if (result.book == null) res.redirect("/catalog/books");
      res.render("book_delete", {
        title: "Delete Book",
        book: result.book[0],
        bookinstances: result.bookinstances,
      });
    }
  );
};

exports.book_delete_post = (req, res,next) => {
  const id = req.body.bookid.trim().toString();
  async.parallel(
    {
      book(callback) {
        Book.find({ _id: id }, "title").exec(callback);
      },
      bookinstances(callback) {
        BookInstance.find({ book: id }).exec(callback);
      },
    },
    (err, result) => {
      if (err) return next(err);

      if (result.bookinstances.length > 0) {
        res.render("book_delete", {
          title: "Delete Book",
          book: result.book[0],
          bookinstances: result.bookinstances,
        });
      } else {
        
        Book.findByIdAndRemove(id, (err) => {
          if (err) return next(err);
          res.redirect("/catalog/books");
        });
      }
    }
  );
};

exports.book_update_get = function(req, res, next) {

  async.parallel({
      book(callback) {
          Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
      },
      authors(callback) {
          Author.find(callback);
      },
      genres(callback) {
          Genre.find(callback);
      },
      }, function(err, results) {
          if (err) { return next(err); }
          if (results.book==null) { 
              var err = new Error('Book not found');
              err.status = 404;
              return next(err);
          }
      
          for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
              for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                  if (results.genres[all_g_iter]._id.toString()===results.book.genre[book_g_iter]._id.toString()) {
                      results.genres[all_g_iter].checked='true';
                  }
              }
          }
          res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book });
      });

};

exports.book_update_post = [

  (req, res, next) => {
      if(!(Array.isArray(req.body.genre))){
          if(typeof req.body.genre==='undefined')
          req.body.genre=[];
          else
          req.body.genre=[req.body.genre];
      }
      next();
  },

  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),

  (req, res, next) => {

      const errors = validationResult(req);

      var book = new Book(
        { title: req.body.title,
          author: req.body.author,
          summary: req.body.summary,
          isbn: req.body.isbn,
          genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
          _id:req.params.id
         });

      if (!errors.isEmpty()) {

          async.parallel({
              authors(callback) {
                  Author.find({}).exec(callback);
              },
              genres(callback) {
                
                  Genre.find({}).exec(callback);
              },
          }, function(err, results) {
              if (err) { return next(err); }
                 console.log(results.authors)
                 console.log(results.genres)
              for (let i = 0; i < results.genres.length; i++) {
                  if (book.genre.indexOf(results.genres[i]._id) > -1) {
                      results.genres[i].checked='true';
                  }
              }
              res.render('book_form', { title: 'Update Book',authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
          });
          return;
      }
      else {
          Book.findByIdAndUpdate(req.params.id, book, {}, (err,thebook) =>{
              if (err) { return next(err); }
                 res.redirect(thebook.url);
              });
      }
  }
];
//(undefined===author ? '' : author.date_of_birth)
//(undefined===author ? '' : author.date_of_death)
