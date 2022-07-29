const BookInstance = require("../models/bookinstance.model");
const { body, validationResult } = require("express-validator");
const Book = require("../models/book.model");
const async = require("async");
exports.bookinstance_list = (req, res) => {
  BookInstance.find({})
    .populate("book")
    .exec((err, list_bookinstance) => {
      if (err) return next(err);
      res.render("book_instance_list", {
        title: "Book Instance List",
        bookinstance_list: list_bookinstance,
      });
    });
};
exports.bookinstance_detail = (req, res) => {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec((err, bookinstance) => {
      if (err) return next(err);
      if (bookinstance == null) {
        var err = new Error("Book copy not found");
        err.status = 404;
        return next(err);
      }
      res.render("bookinstance_detail", {
        title: "Copy: " + bookinstance.book.title,
        bookinstance: bookinstance,
      });
    });
};

exports.bookinstance_create_get = (req, res, next) => {
  Book.find({}, "title").exec((err, result) => {
    if (err) return next(err);
    res.render("bookinstance_form", {
      title: "Create BookInstance",
      book_list: result,
    });
  });
};

exports.bookinstance_create_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });
    if (!errors.isEmpty()) {
      Book.find({}, "title").exec((err, books) => {
        res.render("bookinstance_form", {
          title: "Create Bookinstance",
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance,
        });
      });
      //   return;
    } else {
      bookinstance.save((err) => {
        if (err) return next(err);
        res.redirect(bookinstance.url);
      });
    }
  },
];

exports.bookinstance_delete_get = (req, res, next) => {
  const id = req.params.id.trim().toString();
  BookInstance.find({ _id: id }, "book")
    .populate("book")
    .exec((err, result) => {
      if (err) return next(err);
      if (result == null) res.redirect("/catalog/bookinstances");
      res.render("bookinstance_delete", {
        title: "Delete Bookinstance",
        book_name: result[0].book.title,
        bookinst_id: result[0]._id,
      });
    });
};

exports.bookinstance_delete_post = (req, res, next) => {
  const id = req.body.bookinstanceid.trim().toString();

  BookInstance.findByIdAndRemove(id, (err) => {
    if (err) return next(err);
    res.redirect("/catalog/bookinstances");
  });
};

exports.bookinstance_update_get = (req, res, next) => {
  const id = req.params.id.trim().toString();
  async.parallel(
    {
      bookinstance(callback) {
        BookInstance.findById(id).exec(callback);
      },
      books(callback) {
        Book.find({}, "title").exec(callback);
      },
    },
    (err, result) => {
      if (err) return next(err);
      if (result.bookinstance == null) {
        err = new Error("book instance not found");
        err.status = 404;
        return next(err);
      }
      res.render("bookinstance_form", {
        title: "Create Bookinstance",
        book_list: result.books,
        selected_book: result.bookinstance.book._id,
        bookinstance: result.bookinstance,
      });
    }
  );
};

exports.bookinstance_udpate_post = [
  body("book").trim().isLength({ min: 1 }).escape(),
  body("imprint").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),
  body("due_back").optional({ checkFalsy: true }).isISO8601().toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id:req.params.id
    });
    if (!errors.isEmpty()) {
      Book.find({}, "title").exec((err, books) => {
        res.render("bookinstance_form", {
          title: "Create Bookinstance",
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance,
        });
      });
       return;
    } else {
      BookInstance.findByIdAndUpdate(req.params.id,bookinstance, {}, (err,thebookinstance) =>{
        if (err) { return next(err); }
           res.redirect(thebookinstance.url);
        });
    }
  },
];
