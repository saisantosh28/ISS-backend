// internModel.js
const mongoose = require('mongoose');
const Leave = require('./leaveSchema');

const internSchema = new mongoose.Schema({
  username: String,
  phonenumber: String,
  contact: String,
  email: String,
  password: String,
  domain: { type: String, default: '' },
  leaveRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Leave' }],
  InternID: { type: Number, required: true },
  FirstName: String,
  LastName: String,
  Gender: String,
  DateOfBirth: Date,
  Age: Number,
  PhoneNo: Number,
  Address: String,
  country: String,
  state: String,
  admission_date: Date,
});

const Intern = mongoose.model('Intern', internSchema);

module.exports = Intern;
