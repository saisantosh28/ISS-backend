const express = require('express');
const adminRoutes = express.Router();

const {
    getAllLeaves,
    adminLogin,
    approveAdminLeaveRequest,
    rejectAdminLeaveRequest,
    addDepartment,
    getDepartments,
    assignDepartments,
    getAllSchedules,
} = require('../controllers/adminController.js');


adminRoutes.post('/admin-login', adminLogin);
adminRoutes.get('/admin/leaves', verifyToken, getAllLeaves);
adminRoutes.put('/admin/leave-requests/:id/approve', verifyToken, approveAdminLeaveRequest);
adminRoutes.put('/admin/leave-requests/:id/reject', verifyToken, rejectAdminLeaveRequest);
adminRoutes.post('/departments', verifyToken, addDepartment);
adminRoutes.get('/get-departments', verifyToken, getDepartments);
adminRoutes.post('/assign-departments', verifyToken, assignDepartments);
adminRoutes.get('/schedules', verifyToken, getAllSchedules);

module.exports = adminRoutes;