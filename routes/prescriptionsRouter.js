const express = require('express');
const app = express();

const router = express.Router();
const { 
    doctorLogin,
    pharmacistLogin,
    getMedicines, 
    createPrescription, 
    getAllPrescriptions, 
    addMedicine, 
    updateMedicine, 
    updatePrescriptionStatus,
    getPrescriptionById,
    getMedicineById,
    checkSession,
    destroysession,
    getMedicineCount,
  getPrescriptionCount,
  deleteMedicine,

    } = require('../controllers/prescriptionsController');

// Route to get prescription count
router.get('/prescription/count',  getPrescriptionCount )

// Route to get medicine count
router.get('/medicine/count', getMedicineCount)

// Route to check if session exists
router.get('/', checkSession);

// Route to destroy session
router.post('/logout', destroysession);

// Login route for doctor
router.post('/dlogin', doctorLogin);

// Login route for pharmacist
router.post('/plogin', pharmacistLogin);

// Route to get all medicines
router.get('/medicine', getMedicines);

// Route for deleting a medicine by ID
router.delete('/medicine/:id', deleteMedicine);

// Route to get a specific medicine by ID
router.get('/medicine/:medicineId', getMedicineById);

// Route to add a new medicine
router.post('/medicine', addMedicine);

// Route to update a medicine
router.put('/medicine/:id', updateMedicine);

// Route to create a prescription
router.post('/prescription', createPrescription)

// Route to get all prescriptions
router.get('/prescription', getAllPrescriptions);

// Route to get a specific prescription by ID
router.get('/prescription/:id', getPrescriptionById);

// Route to update prescription status
router.put('/prescription/:prescriptionId', updatePrescriptionStatus);


module.exports = router;
