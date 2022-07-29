const Author = require("../models/author.model");
const Book = require("../models/book.model");
const async = require("async");
const mongoose = require("mongoose");
const {
  body,
  validationResult,
} = require("express-validator");

exports.author_list = (req, res, next) => {
  Author.find({}).exec((err, list_author) => {
    if (err) return next(err);
    res.render("author_list", {
      title: "Author List",
      author_list: list_author,
    });
  });
};
exports.author_detail = (req, res, next) => {
  async.parallel(
    {
      author(callback) {
        Author.findById(req.params.id).exec(callback);
      },
      authors_books(callback) {
        Book.find({ author: req.params.id }, "title summary").exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.author == null) {
        var err = new Error("Author not found");
        err.status = 404;
        return next(err);
      }

      res.render("author_detail", {
        title: "Author Detail",
        author: results.author,
        author_books: results.authors_books,
      });
    }
  );
};

exports.author_create_get = (req, res, next) => {
  res.render("author_form", { title: "Create Author" });
};

exports.author_create_post = [
  body("First_Name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name required")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumberic characters"),
  body("Last_Name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Last name required")
    .isAlphanumeric()
    .withMessage("Last name has non-alphanumberic characters"),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Create Author",
        author: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      var author = new Author({
        First_Name: req.body.First_Name,
        Last_Name: req.body.Last_Name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
      });
      author.save((err) => {
        if (err) return next(err);
      });
      res.redirect(author.url);
    }
  },
];

exports.author_delete_get = (req, res, next) => {
  async.parallel(
    {
      author(callback) {
        Author.findById(req.params.id).exec(callback);
      },
      authors_books(callback) {
        Book.find({ author: req.params.id }).exec(callback);
      },
    },
    (err, result) => {
      if (err) return next(err);
      if (result.author == null) res.redirect("/catalog/authors");
      res.render("author_delete", {
        title: "Delete Author",
        author: result.author,
        author_books: result.authors_books,
      });
    }
  );
};

exports.author_delete_post = (req, res, next) => {
  async.parallel(
    {
      author(callback) {
        Author.findById(req.body.authorid).exec(callback);
      },
      authors_books(callback) {
        Book.find({ author: req.body.authorid }).exec(callback);
      },
    },
    (err, result) => {
      if (err) return next(err);
      if (result.authors_books.length > 0) {
        res.render("author_delete", {
          title: "Delete Author",
          author: result.author,
          author_books: result.authors_books,
        });
      }
      else{
        Author.findByIdAndRemove(req.body.authorid,(err) =>{
          if(err) return next(err)
          res.redirect('/catalog/authors')
        })
      }
    }
  );
};

exports.author_update_get = (req, res,next) => {
  const id= req.params.id.trim().toString()
  Author.findById(id)
        .exec((err,result) =>{
          if(err) return next(err)
          if(result==null) {
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
          }
          console.log(result)
          res.render('author_form',{title:"Update Author",author:result})
        })
};

exports.author_update_post =[
  body("First_Name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name required")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumberic characters"),
  body("Last_Name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Last name required")
    .isAlphanumeric()
    .withMessage("Last name has non-alphanumberic characters"),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Create Author",
        author: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      var author = new Author({
        First_Name: req.body.First_Name,
        Last_Name: req.body.Last_Name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id:req.params.id
      });
      console.log("i am ehre")
      Author.findByIdAndUpdate(req.params.id, author, {},  (err,theauthor) =>{
        if (err) { return next(err); }
           res.redirect(theauthor.url);
        });
    }
  },
];
