/**
 * Hand-written validation for the Live Class Studio routes, matching the
 * project's validation convention (array of error strings + 400 response).
 */

const isValidNonEmptyString = (value) =>
    typeof value === "string" && value.trim().length > 0;

const isValidPositiveIntegerString = (value) => {
    if (value === undefined || value === null || value === "") return false;
    const number = Number(value);
    return Number.isInteger(number) && number > 0;
};

function respondInvalid(res, message, errors) {
    return res.status(400).json({ success: false, message, errors });
}

function validateSessionId(req, res, next) {
    if (!isValidNonEmptyString(req.params.id)) {
        return respondInvalid(res, "Live validation failed", ["session id is required"]);
    }
    next();
}

function validateSendMessage(req, res, next) {
    if (!isValidNonEmptyString(req.body && req.body.text)) {
        return respondInvalid(res, "Live validation failed", ["text is required"]);
    }
    next();
}

function validateMessageId(req, res, next) {
    if (!isValidPositiveIntegerString(req.params.messageId)) {
        return respondInvalid(res, "Live validation failed", ["message id must be a positive integer"]);
    }
    next();
}

function validateCreatePoll(req, res, next) {
    const errors = [];
    const question = req.body && req.body.question;
    const options = Array.isArray(req.body && req.body.options) ? req.body.options : [];
    if (!isValidNonEmptyString(question) || question.trim().length < 5) {
        errors.push("question must be at least 5 characters");
    }
    if (options.filter((option) => isValidNonEmptyString(option)).length < 2) {
        errors.push("at least 2 options are required");
    }
    if (errors.length > 0) return respondInvalid(res, "Poll validation failed", errors);
    next();
}

function validateVote(req, res, next) {
    const errors = [];
    if (!isValidPositiveIntegerString(req.params.pollId)) {
        errors.push("poll id must be a positive integer");
    }
    if (!isValidPositiveIntegerString(req.body && req.body.optionId)) {
        errors.push("option id must be a positive integer");
    }
    if (errors.length > 0) return respondInvalid(res, "Vote validation failed", errors);
    next();
}

function validateBreakoutRoomId(req, res, next) {
    if (!isValidPositiveIntegerString(req.params.roomId)) {
        return respondInvalid(res, "Live validation failed", ["room id must be a positive integer"]);
    }
    next();
}

function validateCreateBreakout(req, res, next) {
    if (!isValidNonEmptyString(req.body && req.body.name)) {
        return respondInvalid(res, "Live validation failed", ["name is required"]);
    }
    next();
}

module.exports = {
    validateSessionId,
    validateSendMessage,
    validateMessageId,
    validateCreatePoll,
    validateVote,
    validateBreakoutRoomId,
    validateCreateBreakout
};
