const Contractor = require("../../models/Users/Contractor");
const express = require("express");

exports.VerifyUserContract = async (req, res, next) => {
  try {
    const userId = req.params.user_contract;
    const verifyContractors = await Contractor.findById(userId);
    if (!verifyContractors) {
      return res.status(404).json({
        success: false,
        message: 'El contratista no existe',
      });
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
