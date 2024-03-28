const Department = require('../models/departmentSchema');
const Schedule = require('../models/scheduleSchema');
const Leave = require("../models/leaveSchema");
const Intern = require("../models/internModel");
const jwt = require('jsonwebtoken');
const Admin = require("../models/adminSchema");
const { generateSchedules } = require('../middleware/middleware');

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    if (password !== admin.password) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    const token = jwt.sign({ adminId: admin._id }, 'your-secret-key', { expiresIn: '1h' });
    res.json({ status: "ok", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find();
    res.json({ leaves });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const approveAdminLeaveRequest = async (req, res) => {
  const leaveRequestId = req.params.id;

  try {
    const leaveRequest = await Leave.findByIdAndUpdate(leaveRequestId, { adminStatus: 'approved' }, { new: true });

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    res.json({ success: true, message: 'Leave request approved successfully', leaveRequest });
  } catch (error) {
    console.error('Error approving leave request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const rejectAdminLeaveRequest = async (req, res) => {
  const leaveRequestId = req.params.id;

  try {
    const leaveRequest = await Leave.findByIdAndUpdate(leaveRequestId, { adminStatus: 'rejected' }, { new: true });

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    res.json({ success: true, message: 'Leave request rejected successfully', leaveRequest });
  } catch (error) {
    console.error('Error rejecting leave request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addDepartment = async (req, res) => {
  const { name, week } = req.body;

  try {
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({ success: false, message: 'Department already exists' });
    }

    const department = new Department({ name, week });
    await department.save();

    res.status(201).json({ success: true, message: 'Department added successfully', department });
  } catch (error) {
    console.error('Error adding department:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json({ success: true, departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const assignDepartments = async (req, res) => {
  try {

    await Schedule.deleteMany();
    const departments = await Department.find();
    const interns = await Intern.find();
    const weeklySchedules = await generateSchedules(departments, interns);

    const flatSchedules = weeklySchedules.reduce((acc, val) => acc.concat(val), []);

    await Schedule.insertMany(flatSchedules);

    res.json({ success: true, message: 'Departments assigned to interns successfully for 52 weeks' });
  } catch (error) {
    console.error('Error assigning departments to interns:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate({
        path: 'departmentId',
        select: 'name'
      })
      .populate({
        path: 'internId',
        select: 'username'
      });

    res.json({ success: true, schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  adminLogin,
  getAllLeaves,
  approveAdminLeaveRequest,
  rejectAdminLeaveRequest,
  addDepartment,
  getDepartments,
  assignDepartments,
  getAllSchedules,
};
