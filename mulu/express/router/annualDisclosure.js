const express = require('express');
const router = express.Router();
const annualDisclosureController = require('../controller/annualDisclosure');
// 实施机构路由
router.get('/imp/list', annualDisclosureController.getImpList);
router.post('/imp/add', annualDisclosureController.addImp);
router.delete('/imp/delete/:id', annualDisclosureController.deleteImp);
// 操作机构路由
router.get('/opt/list', annualDisclosureController.getOptList);
router.post('/opt/add', annualDisclosureController.addOpt);
router.delete('/opt/delete/:id', annualDisclosureController.deleteOpt);
module.exports = router;