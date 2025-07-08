const multer = require('multer');
const memory = multer({ storage: multer.memoryStorage() });

module.exports = memory.fields([{ name: 'user_contract', maxCount: 1 }]);
