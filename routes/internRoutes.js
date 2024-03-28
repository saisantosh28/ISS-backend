const express = require('express');
const internRoutes = express.Router();
const {
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
} = require('../controllers/internController.js');
const { verifyToken } = require('../middleware/middleware.js');


internRoutes.post('/register',registerIntern);
internRoutes.post('/login',loginIntern);
internRoutes.get('/intern-details', verifyToken, getInternDetails);
internRoutes.get('/interns', getAllInterns);
internRoutes.put('/interns/update', updateInternDomain);
internRoutes.post('/intern/leave-request', verifyToken, submitLeaveRequest);
internRoutes.get('/intern/leave-requests', verifyToken, getLeaveRequestsForIntern);
internRoutes.get('/user/leaves', verifyToken, getLeavesForUser);
internRoutes.put('/leave-requests/:id/approve', approveLeaveRequest);
internRoutes.put('/leave-requests/:id/reject', rejectLeaveRequest);
internRoutes.get('/user/schedules', verifyToken, getUserSchedules);



module.exports = internRoutes;