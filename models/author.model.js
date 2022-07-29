const { DateTime } = require("luxon");
const mongoose = require("mongoose");

const AuthorSchema =new  mongoose.Schema({
  First_Name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  Last_Name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  date_of_birth: {
    type: Date,
  },
  date_of_death: {
    type: Date,
  },
});

AuthorSchema.virtual("date_of_birth_formatted").get(function(){
  return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED):''
})
AuthorSchema.virtual("date_of_death_formatted").get(function(){
  return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED): ''
})
AuthorSchema.virtual("name").get(function () {
  var fullName = "";
  if (this.First_Name && this.Last_Name) {
    fullName = this.First_Name + ", " + this.Last_Name;
  }
  if (!this.First_Name || !this.Last_Name) {
    fullName = "";
  }
  return fullName;
});

AuthorSchema.virtual("lifespan").get(function () {
  var life_length = "";
  if (this.date_of_birth) {
    life_length = this.date_of_birth_formatted.toString();
  }
  life_length += " - ";
  if (this.date_of_death) {
    life_length += this.date_of_death_formatted.toString();
  }
  return life_length;
});

AuthorSchema.virtual("url").get(function () {
  return "/catalog/author/" + this._id;
});
AuthorSchema.virtual('date_of_birth_yyyy_mm_dd').get(function() {
  return DateTime.fromJSDate(this.date_of_birth).toISODate(); //format 'YYYY-MM-DD'
});

AuthorSchema.virtual('date_of_death_yyyy_mm_dd').get(function() {
  return DateTime.fromJSDate(this.date_of_death).toISODate(); //format 'YYYY-MM-DD'
});
module.exports = new mongoose.model("Author", AuthorSchema);
