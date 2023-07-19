const pool = require('../db');


const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, "emsi")

    // Check if the email exists in the doctor table
    const [doctorRows] = await pool.query('SELECT * FROM doctor WHERE email = ? and password = ?', [email, password]);

    if(doctorRows[0].email == email){
      
      if(doctorRows[0].password == password){
        req.session.name = doctorRows[0].DoctorName;
        req.session.email = doctorRows[0].email;
        return res.json({Login: true, status: 200, message: 'Log In succesful', role: 'doctor', name: doctorRows[0].DoctorName, email:  doctorRows[0].email});
      }else{
        return res.json({status: 401, error: 'Invalid password' });
      }
    }else{
      return res.status(401).json({ error: 'Invalid email' });
    }
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
      return res.status(500).json({ error: "An error occurred during logout" });
    }
    res.status(200).json({ message: "Logout successful" });
  });
};


const pharmacistLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email)


    // Check if the email exists in the pharmacist table
    const [pharmacistRows] = await pool.query('SELECT * FROM pharmacist WHERE email = ? and password = ?', [email, password]);

 

    if(pharmacistRows[0].email == email){
      
      if(pharmacistRows[0].password == password){
        req.session.name = pharmacistRows[0].PharmacistName;
        req.session.email = pharmacistRows[0].email;
        return res.json({Login: true, status: 200, message: 'Log In succesful', role: 'pharmacist', name: pharmacistRows[0].PharmacistName, email:  pharmacistRows[0].email});
      }else{
        return res.json({status: 401, error: 'Invalid password' });
      }
    }else{
      return res.status(401).json({ error: 'Invalid email' });
    }
  } catch (error) {
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


// Delete a medicine
const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the medicine exists
    const [medicineRows] = await pool.query('SELECT * FROM Medicine WHERE MedicineID = ?', [id]);
    if (medicineRows.length === 0) {
      return res.status(404).json({ error: `Medicine ${id} not found` });
    }

    // Delete the medicine from the Medicine table
    await pool.query('DELETE FROM Medicine WHERE MedicineID = ?', [id]);

    res.status(200).json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Error while deleting medicine:', error);
    res.status(500).json({ error: 'An error occurred while deleting the medicine' });
  }
};




// Create a prescription
const createPrescription = async (req, res) => {
  try {
    const { DoctorName, PatientID, MedicineID, Quantity } = req.body;

    console.log(DoctorName, PatientID, MedicineID, Quantity )

    // Check if MedicineID exists in the Medicine table
    const [medicineRows] = await pool.query('SELECT * FROM medicine WHERE MedicineID = ?', [MedicineID]);
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
      'INSERT INTO prescription (DoctorName, PatientID, MedicineID, MedicineName, Quantity) VALUES (?, ?, ?, ?, ?)',
      [DoctorName, PatientID, MedicineID, MedicineName, Quantity]
    );

    // Update the Medicine table with the new quantity
    const updatedQuantity = availableQuantity - Quantity;
    await pool.query('UPDATE medicine SET Quantity = ? WHERE MedicineID = ?', [updatedQuantity, MedicineID]);

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


    console.log(prescriptionId)

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


// In your database.js file, add the following functions

// Get the number of rows in the Prescription table
const getPrescriptionCount = async (req, res) => {
  try {
    // Retrieve all prescriptions from the Prescription table
    const [prescriptionRows] = await pool.query('SELECT * FROM prescription');

    // Count the number of entries (rows) in the Prescription table
    const totalEntries = prescriptionRows.length;

    res.status(200).json({ total: totalEntries });
  } catch (error) {
    console.error('Error while fetching prescription count:', error);
    res.status(500).json({ error: 'An error occurred while fetching prescription count' });
  }
};


// Get the number of rows in the Medicine table
const getMedicineCount = async (req, res) => {
  try {
    // Retrieve all medicines from the Medicine table
    const [medicineRows] = await pool.query('SELECT * FROM medicine');

    // Count the number of entries (rows) in the Medicine table
    const totalEntries = medicineRows.length;

    res.status(200).json({ total: totalEntries });
  } catch (error) {
    console.error('Error while fetching medicine count:', error);
    res.status(500).json({ error: 'An error occurred while fetching medicine count' });
  }
};




module.exports = {
  getMedicineCount,
  getPrescriptionCount,
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
  getMedicineById,
  deleteMedicine
};
