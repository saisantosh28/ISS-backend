const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Intern = require('../models/internModel');
const Schedule = require('../models/scheduleSchema');
const Leave = require("../models/leaveSchema");
const { generateSchedules } = require('../middleware/middleware.js');

const registerIntern = async (req, res) => {
    try {
        const existingUser = await Intern.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists.' });
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newIntern = new Intern({
            email: req.body.email,
            username: req.body.username,
            phonenumber: req.body.phonenumber,
            contact: req.body.contact,
            password: hashedPassword,
            domain: ""
        });
        await newIntern.save();
        res.json({ message: 'Intern registration successful.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const loginIntern = async (req, res) => {
    try {
        const intern = await Intern.findOne({ email: req.body.username });
  
        if (!intern || !(await bcrypt.compare(req.body.password, intern.password))) {
          return res.status(401).json({ message: 'Invalid username or password.' });
        }
  
        const token = jwt.sign({ userId: intern._id}, 'your-secret-key', { expiresIn: '1h' });
        res.json({ status:"ok",token });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
};

const getInternDetails = async (req, res) => {
    const userId = req.userId;
    const User = await Intern.findOne({ _id: userId });
    console.log(User)
  
    res.json({ User });
};

const getAllInterns = async (req, res) => {
    try {
        const interns = await Intern.find();
        res.json(interns);
      } catch (error) {
        console.error('Error fetching interns:', error);
        res.status(500).send('Internal Server Error');
      }
};

const updateInternDomain = async (req, res) => {
    try {
        const { name, newDomain } = req.body;
    
        // Update the intern's domain using findByIdAndUpdate
        const updatedIntern = await Intern.findOneAndUpdate(
          { username: name },
          { $set: { domain: newDomain } },
          { new: true } // Returns the updated document
        );
    
        if (!updatedIntern) {
          return res.status(404).json({ message: 'Intern not found for the given name.' });
        }
    
        res.json({ message: 'Intern domain updated successfully.', updatedIntern });
      } catch (error) {
        console.error('Error updating intern domain:', error);
        res.status(500).send('Internal Server Error');
      }
};

const submitLeaveRequest = async (req, res) => {
    const userId = req.userId;

    const { reason, startDate, endDate, nominatedIntern } = req.body;
    if (!userId || !startDate || !endDate || !reason || !nominatedIntern) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    try {
      const intern = await Intern.findById(userId);
      if (!intern) {
        return res.status(404).json({ success: false, message: 'Intern not found' });
      }
      const newLeave = new Leave({
        internName: intern.username,
        reason,
        startDate,
        endDate,
        nominatedIntern
      });
      await newLeave.save();

      intern.leaveRequests.push(newLeave);

      await intern.save();
      res.json({ success: true, message: 'Leave request submitted successfully' });
    } catch (error) {
      console.error('Error submitting leave request:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getLeaveRequestsForIntern = async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing user ID' });
    }

    try {
      const intern = await Intern.findById(userId);
      if (!intern) {
        return res.status(404).json({ success: false, message: 'Intern not found' });
      }

      const leaveRequests = await Leave.find({ nominatedIntern: intern.username });
      res.json({ success: true, leaveRequests });
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getLeavesForUser = async (req, res) => {
    const userId = req.userId;
    try {
      const intern = await Intern.findById(userId);
      if (!intern) {
        return res.status(404).json({ success: false, message: 'Intern not found' });
      }
  
      const username = intern.username;
      const leaves = await Leave.find({ internName: username });
  
      res.json({ success: true, leaves });
    } catch (error) {
      console.error('Error fetching leaves:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const approveLeaveRequest = async (req, res) => {
    const leaveRequestId = req.params.id;

  try {
    const leaveRequest = await Leave.findByIdAndUpdate(leaveRequestId, { internStatus: 'approved' }, { new: true });

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    res.json({ success: true, message: 'Leave request approved successfully', leaveRequest });
  } catch (error) {
    console.error('Error approving leave request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const rejectLeaveRequest = async (req, res) => {
    const leaveRequestId = req.params.id;

  try {
    const leaveRequest = await Leave.findByIdAndUpdate(leaveRequestId, { internStatus: 'rejected' }, { new: true });

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    res.json({ success: true, message: 'Leave request rejected successfully', leaveRequest });
  } catch (error) {
    console.error('Error rejecting leave request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getUserSchedules = async (req, res) => {
    try {
        const userId = req.userId;
        const schedules = await Schedule.find({ internId: userId }).populate(
          {path: 'departmentId',
            select: 'name'
          });
        res.json({ success: true, schedules });
      } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
};

module.exports = {
    registerIntern,
    loginIntern,
    getInternDetails,
    getAllInterns,
    updateInternDomain,
    submitLeaveRequest,
    getLeaveRequestsForIntern,
    getLeavesForUser,
    approveLeaveRequest,
    rejectLeaveRequest,
    getUserSchedules,
};
