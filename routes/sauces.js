const express = require('express');
const router = express.Router();
const sauces = require('../controllers/sauces');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get('/', auth, sauces.getAllSauces);
router.get('/:id', auth, sauces.getSauce);
router.put('/:id', auth, multer, sauces.updateSauce);
router.delete('/:id', auth, sauces.removeSauce);
router.post('/', auth, multer, sauces.addSauce);
router.post('/:id/like', auth, sauces.rateSauces);

module.exports = router;