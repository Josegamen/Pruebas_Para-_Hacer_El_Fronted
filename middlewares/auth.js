const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { json } = require('express/lib/response');

exports.authenticate = async(req,res,next)=>{
    try{
        const token = req.header('Authorization')?.replace('Bearer', '');

        if (!token){
            return res.status(401).json({
                success: false,
                message:'Toke de autentiacion requerido'
            });
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const  user = await User.findById(decoded.id);
        if (!user){
            return res.status(401).json({
                success:false,
                message:'Usuario no encontrado'
            });
        }

        req.user= user;
        next();
    }catch(error){
        res.status(500).json({
            success:false,
            message:'Token invalido o expirado'
        });
    }
};


// Middleware de autorizacion

exports.authorize = (roles)=>{
    return(req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                success:false,
                message:'No tiene permiso para esta accion',
                requiredRoles:roles,
                currentRole : req.user.role
            });
        }
        next();
    }
};