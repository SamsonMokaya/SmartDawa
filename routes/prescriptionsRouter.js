const express = require('express');
const app = express();

const router = express.Router();
const { 
    getMedicines, 
    createPrescription, 
    getAllPrescriptions, 
    addMedicine, 
    updateMedicine, 
    updatePrescriptionStatus,
    getPrescriptionById,
    getMedicineById,

    } = require('../controllers/prescriptionsController');

// Route to get all medicines
router.get('/medicine', getMedicines);

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
router.get('/prescription/:prescriptionId', getPrescriptionById);

// Route to update prescription status
router.put('/prescription/:prescriptionId', updatePrescriptionStatus);


module.exports = router;
