const Joi = require('joi');

module.exports = {
    validate: (schema, data) => {
        // return async (req, res) => {
        try {
            const result = schema.validateAsync(data)
            return result
        } catch(err) {
            return err
        }
    },
    
    schemas: {
        idSchema: Joi.object({
            petId: Joi.number().positive().required(),
            file: Joi.string().required()
        }),
        petSchema: Joi.object({
            id: Joi.number().positive().required(),
            category: {
                id: Joi.number().positive(),
                name: Joi.string().regex(/^[a-zA-Z]+$/)
            },
            name: Joi.string().min(0).max(30).regex(/^[a-zA-Z]+$/).required(),
            photoUrl: [ Joi.string().required() ],
            tags: {
                id: Joi.number().positive(),
                name: Joi.string().regex(/^[a-zA-Z]+$/)
            },
            status: Joi.valid('available', 'pending', 'sold')
        }),
        orderSchema: Joi.object({
            id: Joi.number().positive().required(),
            petId: Joi.number().positive().required(),
            quantity: Joi.number().positive().required(),
            shipDate: Joi.date().min('now'),
            status: Joi.valid('placed', 'approved', 'delivered'),
            complete: Joi.boolean()
        })
    }
};
