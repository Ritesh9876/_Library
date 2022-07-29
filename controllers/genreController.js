const Genre = require("../models/genre.model");
var mongoose = require("mongoose");
const async = require("async");
const Book = require("../models/book.model");
const { body, validationResult } = require("express-validator");
exports.genre_list = (req, res) => {
  Genre.find({})
    .sort({ name: 1 })
    .exec((err, list_genre) => {
      res.render("genre_list", { title: "Genre List", genre_list: list_genre });
    });
};
exports.genre_detail = (req, res, next) => {
  var id = mongoose.Types.ObjectId(req.params.id);
  async.parallel(
    {
      genre(callback) {
        Genre.findById(id).exec(callback);
      },
      genre_books(callback) {
        Book.find({ genre: id }).exec(callback);
      },
    },
    (err, result) => {
      if (err) {
        console.log("first block");
        return next(err);
      }
      if (result.genre == null) {
        var err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      res.render("genre_detail", {
        title: "Genre Detail",
        genre: result.genre,
        genre_books: result.genre_books,
      });
    }
  );
};

exports.genre_create_get = (req, res) => {
  res.render("genre_form", { title: "Create Genre" });
};

exports.genre_create_post = [
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name });
    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create Genre",
        genre,
        errors: errors.array(),
      });
      return;
    } else {
      Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
        if (err) return next(err);
        if (found_genre) {
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) return next(err);
          });
          res.redirect(genre.url);
        }
      });
    }
  },
];

exports.genre_delete_get = (req, res, next) => {
  const id = req.params.id.trim().toString();

  Genre.findById(id).exec((err, result) => {
    if (err) return next(err);
    if (result == null) res.redirect("/catalog/genres");
    res.render("genre_delete", { title: "Delete Genre", genre: result });
  });
};

exports.genre_delete_post = (req, res,next) => {
  const id= req.body.genreid.trim().toString()
  Genre.findByIdAndRemove(id,err =>{
    if(err) return next(err)
    res.redirect('/catalog/genres')
  })
};

exports.genre_update_get = (req, res) => {
  res.send("genre update form");
};

exports.genre_udpate_post = (req, res) => {
  res.send("genre updated");
};
