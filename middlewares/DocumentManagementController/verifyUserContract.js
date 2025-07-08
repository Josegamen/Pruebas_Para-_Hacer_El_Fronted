const User = require('../../models/Users/User')
const express = require("express");

exports.VerifyUserContract = async (req, res, next) => {
  try {
    const userId = req.params.user_contract;
    const verifyContractors = await User.findById(userId);
    if (!verifyContractors) {
      return res.status(404).json({
        success: false,
        message: 'El contratista no existe',
      });
    }

    if(verifyContractors.role !=="contratista"){
      return res.status(400).json({
        success:false,
        message:'No puedes crear un gestion documento con un usuario diferente a un contrastista'
      })
    }

    req.user_contract = userId; // Para seguir usándolo más adelante
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al buscar el contratista',
      error: error.message,
    });
  }
};
