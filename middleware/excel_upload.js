const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const bcrypt = require('bcrypt');
const Intern = require('../models/internModel');
const moment = require('moment');

// Connect to MongoDB
mongoose.connect('mongodb+srv://maddisai2811:tEaziPDl120vdlFz@cluster0.lp2xd1o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Function to read Excel file and insert data
async function insertFromExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1); // Assuming data is on the first sheet

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      console.log(`Processing row ${rowNumber}`);

      const row = worksheet.getRow(rowNumber);

      // Check and transform data before saving
      const internData = {
        InternID: row.getCell(1).value.toString(),
        username: row.getCell(4).value.toString(), // Convert to string
        FirstName: row.getCell(2).value.toString(), // Convert to string
        LastName: row.getCell(3).value.toString(), // Convert to string
        email: row.getCell(4).value.toString(),
        // Hash the password
        password: await bcrypt.hash(row.getCell(5).value.toString(), 10),
        Gender: row.getCell(6).value.toString(), // Convert to string
        DateOfBirth: parseDate(row.getCell(7).value), // Parse Date
        Age: calculateAge(parseDate(row.getCell(7).value)), // Calculate Age from Date of Birth
        PhoneNo: getValidPhoneNo(row.getCell(9).value), // Get valid PhoneNo
        Address: row.getCell(10).value.toString() || null, // Convert to string, Use null if undefined
        country: row.getCell(11).value.toString() || null, // Convert to string, Use null if undefined
        state: row.getCell(12).value.toString() || null, // Convert to string, Use null if undefined
        admission_date: parseDate(row.getCell(13).value), // Parse Date
        leaveRequests: [],
      };

      console.log('Intern Data:', internData);

      // Create a new Intern document and save it to MongoDB
      const newIntern = new Intern(internData);
      try {
        const savedIntern = await newIntern.save();
        console.log(`Inserted data for ${internData.FirstName} ${internData.LastName}`);
        console.log('Saved Intern:', savedIntern);
      } catch (error) {
        console.error(`Error inserting data for ${internData.FirstName} ${internData.LastName}: ${error.message}`);
      }
    }

    console.log('Data insertion completed.');
    process.exit(0); // Exit the script after completion
  } catch (error) {
    console.error('Error reading Excel file:', error.message);
    process.exit(1); // Exit with an error code
  }
}

// Function to parse date string
function parseDate(dateString) {
  if (!dateString) return null;

  const formatsToTry = [
    'MM-DD-YYYY',
    'M-D-YYYY',
    'MM/DD/YYYY',
    'M/D/YYYY',
    'YYYY-MM-DD',
    'YYYY/MM/DD',
  ];

  for (const format of formatsToTry) {
    const date = moment(dateString, format, true);
    if (date.isValid()) {
      return date.toDate();
    }
  }

  return null;
}

// Function to calculate age from Date of Birth
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 0;

  const ageDiffMs = Date.now() - dateOfBirth.getTime();
  const ageDate = new Date(ageDiffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// Function to get a valid PhoneNo
function getValidPhoneNo(value) {
  if (typeof value === 'string' && isNaN(value)) {
    return null;
  } else if (typeof value === 'object') {
    const stringValue = value.toString();
    if (stringValue === '[object Object]') {
      return null;
    } else {
      return stringValue;
    }
  } else {
    return value;
  }
}

// Path to your Excel file
const excelFilePath = 'D:/Downloads/internsheet.xlsx';

// Call the function to insert data from Excel
insertFromExcel(excelFilePath);