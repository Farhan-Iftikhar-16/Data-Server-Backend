// const errorHandler = require('errorHandler');
const app = require('./app');

/**
 * Error Handler. Provides full stack - remove for production
 */
// app.use(errorHandler());

/**
 * Start Express server.
 */
const PORT =  process.env.PORT || 5000;
const server = app.listen(5000, () => {
    
    console.log(
        "  App is running at http://localhost:%d in %s mode",
        5000,
    );
    console.log("  Press CTRL-C to stop\n");
});

