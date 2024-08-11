const verify = require("../middleware/verify");
const authRoutes = require('./auth');
const projectRoutes = require('./projects');

const router = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/projects', projectRoutes);
    
    app.get('/api', (req, res) => {
        try {
            res.status(200).json({
                status: "success",
                data: [],
                message: 'hello :)'
            });
        } catch(e) {
            res.status(500).json({
                status: 'error',
                message: 'Internal Server Error'
            });
        }
    });

    app.get('/api/check-user', verify, (req, res) => {
        res.status(200).json({
            status: "success",
            message: "You are logged in"
        })
    });
}

module.exports = router;