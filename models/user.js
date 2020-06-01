const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const Unauthorized = require('../errors/unauthorized');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: async function emailValidate(email) {
      return validator.isEmail(email);
    },
  },
  password: {
    type: String,
    select: false,
    required: true,
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
});

userSchema.statics.findUserByCredentials = function findByEmailAndPasword(email, password) {
  return this.findOne({ email }).select('+password')
    .orFail(new Unauthorized('Неправильная почта или пароль'))
    .then((user) => bcrypt.compare(password, user.password)
      .then((matched) => {
        if (!matched) {
          throw new Unauthorized('Неправильная почта или пароль');
        }
        return user;
      }));
};

module.exports = mongoose.model('user', userSchema);
