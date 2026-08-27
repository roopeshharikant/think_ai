const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");


// ============================================================
// ROUTES
// ============================================================

const courseRoutes =
    require("./routes/courseRoutes");

const batchRoutes =
    require("./routes/batchRoutes");

const enrollmentRoutes =
    require("./routes/enrollmentRoutes");

const authRoutes =
    require("./routes/authRoutes");

const adminUsers =
    require("./routes/adminUsers");

const roleRoutes =
    require("./routes/roleRoutes");

const demoRoutes =
    require("./routes/demoRoutes");

const moduleRoutes =
    require("./routes/moduleRoutes");

const lessonRoutes =
    require("./routes/lessonRoutes");

const lessonProgressRoutes =
    require("./routes/lessonProgressRoutes");

const certificateRoutes =
    require("./routes/certificateRoutes");

const assessmentRoutes =
    require("./routes/assessmentRoutes");

const codeExecutionRoutes =
    require("./routes/codeExecutionRoutes");

const auditLogRoutes =
    require("./routes/auditLogs");

const analyticsRoutes =
    require("./routes/analytics");


// ============================================================
// ADMIN CODING QUESTION ROUTES
// ============================================================

const adminCodingQuestionRoutes =
    require("./routes/adminCodingQuestionRoutes");


// ============================================================
// SESSION / PASSPORT
// ============================================================

const session =
    require("express-session");

const passport =
    require("passport");

require("./config/passport");


// ============================================================
// APP
// ============================================================

const app = express();


// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================

app.use(cors());

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    morgan("dev")
);


// ============================================================
// SESSION
// ============================================================

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "your_secret_fallback",

        resave: false,

        saveUninitialized: false
    })
);

app.use(
    passport.initialize()
);

app.use(
    passport.session()
);


// ============================================================
// DEMO ROUTES
// ============================================================

app.use(
    "/api/demo",
    demoRoutes
);


// ============================================================
// AUDIT LOGS
// ============================================================

app.use(
    "/api/audit-logs",
    auditLogRoutes
);


// ============================================================
// ANALYTICS
// ============================================================

app.use(
    "/api/analytics",
    analyticsRoutes
);


// ============================================================
// SWAGGER
// ============================================================

const swaggerOptions = {

    definition: {

        openapi: "3.0.0",

        info: {

            title:
                "Thinkz LMS API",

            version:
                "1.0.0",

            description:
                "Course, Batch, Enrollment, Assessment and Code Execution APIs"
        },

        servers: [

            {
                url:
                    "http://localhost:5000"
            }

        ]
    },

    apis: [
        "./routes/*.js"
    ]
};


const swaggerSpec =
    swaggerJsdoc(
        swaggerOptions
    );


app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(
        swaggerSpec
    )
);


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
    "/",
    (req, res) => {

        return res.status(200).json({

            success: true,

            message:
                "Thinkz LMS Backend Running Successfully"
        });
    }
);


app.get(
    "/api/health",
    (req, res) => {

        return res.status(200).json({

            status:
                "healthy",

            service:
                "think-ai-backend",

            timestamp:
                new Date().toISOString()
        });
    }
);


// ============================================================
// CERTIFICATE STATIC FILES
// ============================================================

app.use(
    "/certificates",
    express.static(
        path.join(
            __dirname,
            "generated/certificates"
        )
    )
);


// ============================================================
// COURSE ROUTES
// ============================================================

app.use(
    "/api/courses",
    courseRoutes
);


// ============================================================
// BATCH ROUTES
// ============================================================

app.use(
    "/api/batches",
    batchRoutes
);


// ============================================================
// ENROLLMENT ROUTES
// ============================================================

app.use(
    "/api/enrollments",
    enrollmentRoutes
);


// ============================================================
// AUTH ROUTES
// ============================================================

app.use(
    "/api/auth",
    authRoutes
);


// ============================================================
// ADMIN USER ROUTES
// ============================================================

app.use(
    "/api/admin",
    adminUsers
);


// ============================================================
// ROLE ROUTES
// ============================================================

app.use(
    "/api/roles",
    roleRoutes
);


// ============================================================
// MODULE ROUTES
// ============================================================

app.use(
    "/api/modules",
    moduleRoutes
);


// ============================================================
// LESSON ROUTES
// ============================================================

app.use(
    "/api/lessons",
    lessonRoutes
);


// ============================================================
// LESSON PROGRESS ROUTES
// ============================================================

app.use(
    "/api/lesson-progress",
    lessonProgressRoutes
);


// ============================================================
// CERTIFICATE ROUTES
// ============================================================

app.use(
    "/api/certificates",
    certificateRoutes
);


// ============================================================
// ASSESSMENT ROUTES
// ============================================================

app.use(
    "/api/assessments",
    assessmentRoutes
);


// ============================================================
// ADMIN CODING QUESTION ROUTES
// ============================================================

app.use(
    "/api/admin",
    adminCodingQuestionRoutes
);


// ============================================================
// CODE EXECUTION / JUDGE0
// ============================================================

app.use(
    "/api/code",
    codeExecutionRoutes
);


// ============================================================
// 404 HANDLER
// ============================================================

app.use(
    (req, res) => {

        return res.status(404).json({

            success: false,

            message:
                `Route not found: ${req.method} ${req.originalUrl}`
        });
    }
);


// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "Global error:",
            error
        );

        if (res.headersSent) {
            return next(error);
        }

        return res.status(
            error.status || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Internal server error"
        });
    }
);


// ============================================================
// EXPORT
// ============================================================

module.exports = app;