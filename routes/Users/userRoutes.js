const express = require('express');
const router = express.Router();
const userController = require('../../controllers/Users/userControllers');
const {verifyToken} = require('../../middlewares/Token/authJwt');
const {checkRole}= require('../../middlewares/Role/role');

// Middleware de diagnóstico para todas las rutas
router.use((req, res, next) => {
    console.log('\n=== DIAGNÓSTICO DE RUTA ===');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Headers:', {
        'authorization': req.headers.authorization ? '***' + req.headers.authorization.slice(-8) : null,
        'x-access-token': req.headers['x-access-token'] ? '***' + req.headers['x-access-token'].slice(-8) : null,
        'user-agent': req.headers['user-agent']
    });
    next();
});

// GET /api/Users
router.get('/',
        verifyToken,
    checkRole('admin','funcionario'),
    userController.getAllUsers
);

//POST /API/Users
router.post('/',
    verifyToken,
    checkRole('admin','funcionario'),
    userController.createUser
)

// GET /api/Users/:id 
router.get('/:id',
     verifyToken,
    checkRole('admin','funcionario','contratista'),
    userController.getUserById

);

//PUT /api/Users/:id
router.put('/:id',
    verifyToken,
    checkRole('admin','funcionario'),
    userController.updateUser
);

//DELETE /api/users/:id 
router.delete('/:id',
    verifyToken,
    checkRole('admin'),
    userController.deleteUser
);


module.exports = router;
