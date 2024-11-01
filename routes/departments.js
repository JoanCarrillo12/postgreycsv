const { Router } = require('express');
const router = Router();

var { exportPostgreaCsv, importCsvaPostgre } = require('../controllers/departments');

//rutas de endpoint para la tabla departments
router.get('/export-csv', exportPostgreaCsv);
router.post('/import-csv', importCsvaPostgre);

module.exports = router;