const pool = require('../db');


const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email)
    console.log(password)

    // Check if the email exists in the doctor table
    const [doctorRows] = await pool.query('SELECT * FROM doctor WHERE email = ? and password = ?', [email, password]);

    if (doctorRows.length === 0) {
      // User not found
      return res.status(401).json({ error: 'Invalid emails or password' });
    }

    const doctor = doctorRows[0];


    // Check the user's role
    if (doctor.role === 1) {
      // User is a doctor
      req.session.name = doctor.DoctorName;
      return res.status(200).json({ role: 'doctor', name: doctor.DoctorName });
    }

    // Invalid role
    res.status(401).json({ error: 'Invalid role' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
};

// get session
const checkSession = async (req, res) => {
  if(req.session.name){
    res.status(200).json({valid: true, name: req.session.name });
  }else{
    res.json({valid: false});
  }
}

//logout session
const destroysession = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error while destroying session:", err);
      return res.status(500).json({ error: "An error occurred during logout" });
    }
    res.status(200).json({ message: "Logout successful" });
  });
};


const pharmacistLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email exists in the pharmacist table
    const [pharmacistRows] = await pool.query('SELECT * FROM pharmacist WHERE email = ? and password = ?', [email, password]);

    if (pharmacistRows.length === 0) {
      // Email not found
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const pharmacist = pharmacistRows[0];

    // Check the user's role
    if (pharmacist.role === 2) {
      // User is a pharmacist
      return res.status(200).json({ role: 'pharmacist' });
    }

    // Handle other roles if needed

    // Invalid role
    res.status(401).json({ error: 'Invalid role' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
};




// Fetch all medicines
const getMedicines = async (req, res) => {
  try {
    const query = 'SELECT * FROM medicine';
    const [rows] = await pool.query(query);
    res.status(200).json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching medicines' });
  }
};

// Get specific medicine by ID
const getMedicineById = async (req, res) => {
  try {
    const { medicineId } = req.params;

    // Retrieve the medicine from the database based on medicineId
    const [medicineRows] = await pool.query('SELECT * FROM Medicine WHERE MedicineID = ?', [medicineId]);
    if (medicineRows.length === 0) {
      return res.status(404).json({ error: `Medicine ${medicineId} not found` });
    }

    const medicine = medicineRows[0];
    res.status(200).json({ data: medicine });
  } catch (error) {
    console.error('Error while fetching medicine:', error);
    res.status(500).json({ error: 'An error occurred while fetching the medicine' });
  }
};

// Add a new medicine
const addMedicine = async (req, res) => {
  try {
    const { MedicineName, Quantity } = req.body;

    // Insert the new medicine into the Medicine table
    await pool.query('INSERT INTO Medicine (MedicineName, Quantity) VALUES (?, ?)', [MedicineName, Quantity]);

    res.status(201).json({ message: 'Medicine added successfully' });
  } catch (error) {
    console.error('Error while adding medicine:', error);
    res.status(500).json({ error: 'An error occurred while adding the medicine' });
  }
};

// Update a medicine
const updateMedicine = async (req, res) => {
  try {
    const {MedicineName, Quantity } = req.body;
    const { id } = req.params;

    // Check if the medicine exists
    const [medicineRows] = await pool.query('SELECT * FROM Medicine WHERE MedicineID = ?', [id]);
    if (medicineRows.length === 0) {
      return res.status(404).json({ error: `Medicine ${id} not found` });
    }

    // Update the medicine in the Medicine table
    await pool.query('UPDATE Medicine SET MedicineName = ?, Quantity = ? WHERE MedicineID = ?', [MedicineName, Quantity, id]);

    res.status(200).json({ message: 'Medicine updated successfully' });
  } catch (error) {
    console.error('Error while updating medicine:', error);
    res.status(500).json({ error: 'An error occurred while updating the medicine' });
  }
};



// Create a prescription
const createPrescription = async (req, res) => {
    try {
      const { DoctorID, PatientID, MedicineID, Quantity } = req.body;
  
      // Check if DoctorID exists in the Doctor table
      const [doctorRows] = await pool.query('SELECT * FROM Doctor WHERE DoctorID = ?', [DoctorID]);
      if (doctorRows.length === 0) {
        return res.status(404).json({ error: 'Doctor not found' });
      }
  
      // Check if MedicineID exists in the Medicine table
      const [medicineRows] = await pool.query('SELECT * FROM Medicine WHERE MedicineID = ?', [MedicineID]);
      if (medicineRows.length === 0) {
        return res.status(404).json({ error: 'Medicine not found' });
      }
  
      // Check if Quantity to be prescribed is less than or equal to the available quantity
      const availableQuantity = medicineRows[0].Quantity;
      if (Quantity > availableQuantity) {
        return res.status(400).json({
          error: 'Insufficient quantity available',
          remainingQuantity: availableQuantity,
        });
      }
  
      const MedicineName = medicineRows[0].MedicineName;
  
      // Insert the prescription into the Prescription table
      await pool.query(
        'INSERT INTO Prescription (DoctorID, PatientID, MedicineID, MedicineName, Quantity) VALUES (?, ?, ?, ?, ?)',
        [DoctorID, PatientID, MedicineID, MedicineName, Quantity]
      );
  
      // Update the Medicine table with the new quantity
      const updatedQuantity = availableQuantity - Quantity;
      await pool.query('UPDATE Medicine SET Quantity = ? WHERE MedicineID = ?', [updatedQuantity, MedicineID]);
  
      res.status(201).json({
        message: 'Prescription created successfully',
        remainingQuantity: updatedQuantity,
      });
    } catch (error) {
      console.error('Error while creating prescription:', error);
      res.status(500).json({ error: 'An error occurred while creating the prescription' });
    }
  };



// Get all prescriptions
const getAllPrescriptions = async (req, res) => {
  try {
    // Query all prescriptions from the Prescription table
    const query = 'SELECT * FROM prescription';
    const [rows] = await pool.query(query);

    res.status(200).json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching prescriptions' });
  }
};

// Get specific prescription by ID
const getPrescriptionById = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    // Retrieve the prescription from the database based on prescriptionId
    const [prescriptionRows] = await pool.query('SELECT * FROM Prescription WHERE PrescriptionID = ?', [prescriptionId]);
    if (prescriptionRows.length === 0) {
      return res.status(404).json({ error: `Prescription ${prescriptionId} not found` });
    }

    const prescription = prescriptionRows[0];
    res.status(200).json({ data: prescription });
  } catch (error) {
    console.error('Error while fetching prescription:', error);
    res.status(500).json({ error: 'An error occurred while fetching the prescription' });
  }
};


// Update prescription status
const updatePrescriptionStatus = async (req, res) => {
  try {
    const {prescriptionId}  = req.params;


    // Check if the prescription exists
    const [prescriptionRows] = await pool.query('SELECT * FROM Prescription WHERE PrescriptionID = ?', [prescriptionId]);
    if (prescriptionRows.length === 0) {
      return res.status(404).json({ error: `Prescription ${prescriptionId} not found` });
    }

    // Update the status column to "Taken"
    await pool.query('UPDATE Prescription SET Status = ? WHERE PrescriptionID = ?', ['Taken', prescriptionId]);

    res.status(200).json({ message: 'Prescription status updated successfully' });
  } catch (error) {
    console.error('Error while updating prescription status:', error);
    res.status(500).json({ error: 'An error occurred while updating the prescription status' });
  }
};


module.exports = {
  destroysession,
  checkSession,
  pharmacistLogin,
  doctorLogin,
  getMedicines,
  createPrescription,
  getAllPrescriptions,
  addMedicine,
  updateMedicine,
  updatePrescriptionStatus,
  getPrescriptionById,
  getMedicineById
};
