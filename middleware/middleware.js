const express = require('express');
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - Missing Token' });
    }

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
        }

        req.userId = decoded.userId;
        next();
    });
};

async function generateSchedules(departments, interns) {
    const schedules = [];

    let currentDepartments = [...departments];

    for (const intern of interns) {
        let weekCounter = 1;
        const internSchedule = [];

        // Make a copy to manipulate

        for (const department of currentDepartments) {
            const weeksInDepartment = department.week;

            for (let i = 0; i < weeksInDepartment; i++) {
                internSchedule.push({
                    internId: intern._id,
                    departmentId: department._id,
                    week: weekCounter++
                });
            }

            // Rotate departments for the next intern

            console.log(currentDepartments)
        }
        currentDepartments.push(currentDepartments.shift());
        schedules.push(internSchedule);
    }

    return schedules;
}


module.exports = { verifyToken, generateSchedules };