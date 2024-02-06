require('dotenv').config();

// connect to MongoDB database
require('../src/config/config.database');

const express = require('express');
const { logger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const createError = require("http-errors");

const PORT = process.env.PORT || 8100;
const app = express();


//place the logger at the top
app.use(logger);

// handle cors
app.use(cors());

app.use(express.static('uploads')); 
app.use('/uploads', express.static('uploads'));

// set up route here
const userRoutes = require('../src/routes/user.route');
const clientRoutes = require('../src/routes/client.route');
const categoryRoutes = require('../src/routes/category.route');
const reportRoutes = require('../src/routes/report.route');
const surveyRoutes = require('../src/routes/survey.route');
const ticketRoutes = require('../src/routes/ticket.route');
const grievanceRoutes = require('../src/routes/grievance.route');
const constituencyRoutes = require('../src/routes/constituency.route');
const planRoutes = require('../src/routes/plan.route');
const cadreRoutes = require('../src/routes/cadre.route');
const constituencyDataRoutes = require('../src/routes/constituencyData.route');
const taskRoutes = require('../src/routes/task.route');
const userDetailsRoutes = require('../src/routes/userDetails.route');
const form20Routes = require('../src/routes/form20.route')

const widgetRoutes = require('../src/modules/widget/widget.controller')
app.get("/", (req, res) => res.status(200).json({
    status: true,
    message: "Welcome to polstrat. This is the staging server"
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json())

// routers
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/survey", surveyRoutes);
app.use("/api/tickets",ticketRoutes);
app.use("/api/grievances",grievanceRoutes);
app.use("/api/constituency",constituencyRoutes)
app.use("/api/plan",planRoutes);
app.use("/api/task",taskRoutes);
app.use("/api/userDetails",userDetailsRoutes);
app.use("/api/form20",form20Routes);
// ticket
app.use("/api/cadres",cadreRoutes);
app.use("/api/constituencyData",constituencyDataRoutes);

// Widget

app.use("/api/widget",widgetRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

//place errorhandler at the end just before when we call our listner
app.use(errorHandler);

app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Server is live at localhost:${PORT}`)
    }
});

module.exports = app;
