const Joi = require('joi');

const validateSessionInput = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().min(3).required(),
        description: Joi.string().optional(),
        startTime: Joi.date().iso().required(),
        platform: Joi.string().valid('jitsi', 'zoom').required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            success: false, 
            message: `Validation Error: ${error.details[0].message}`
        });
    }
    next();
};

module.exports = { validateSessionInput };