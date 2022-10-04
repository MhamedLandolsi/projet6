const express = require('express');
const router = express.Router();
const sauces = require('../controllers/sauces');
const auth = require('../middleware/auth');

router.get('/',auth, sauces.getAllSauces);
router.get('/:id',auth, sauces.getSauce);
router.put('/:id',auth, sauces.updateSauce);
router.delete('/:id',auth, sauces.removeSauce);
router.post('/',auth, sauces.addSauce);
router.post('/:id/like',auth, sauces.rateSauces);

module.exports = router;