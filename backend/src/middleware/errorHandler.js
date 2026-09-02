/**
 * Router-scoped error handler for the Forum module only.
 * Other modules keep their own behaviour untouched.
 */

// eslint-disable-next-line no-unused-vars
function forumErrorHandler(err, req, res, next) {
    const status = err.status || 500;
    if (status >= 500) {
        console.error(`[forum] ${err.message}`, err.stack);
    }
    res.status(status).json({
        success: false,
        message: err.message || "Internal forum error"
    });
}

module.exports = { forumErrorHandler };
