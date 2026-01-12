module.exports = function apiKeyAuth(req, res, next) {
    const clientKey = req.header("x-api-key");
    const serverKey = process.env.API_KEY;

    if (!serverKey) {
        console.error("API_KEY not set in environment");
        return res.status(500).json({
            success: false,
            message: "Server authentication misconfigured"
        });
    }

    if (!clientKey || clientKey !== serverKey) {
        return res.status(401).json({
            success: false,
            message: "Invalid or missing API key"
        });
    }

    next();
};
