const express = require('express')
const router = express.Router()
const petstore = require('../service/petstore')

// Create a new pet image
router.post('/pet/:id/uploadimage', petstore.createImage);
// Create a new pet
router.post('/pet', petstore.createPet);
// Update existing pet or create a new pet
router.put('/pet', petstore.updatePet);
// Retrieve pets by status
//router.get('/pet/findbystatus', petstore.findPetsByStatus);
// Retrieve a pet
router.get('/pet/:id', petstore.findPet);
// Update a pet status
router.post('/pet/:id', petstore.updatePetStatus);
// Delete a pet
router.delete('/pet/:id', petstore.deletePet);
// Retrieve store inventory
//router.get('/store/inventory', petstore.findStoreInventory);
// Create an order
router.post('/store/order', petstore.createOrder);
// Retrieve store order
router.get('/store/order/:id', petstore.findOrder);
// Delete an order
router.delete('/store/:id', petstore.deleteOrder);

module.exports = router;

