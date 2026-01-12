const extractContacts = require("../utils/contactExtractor");

exports.emailSocialExtractor = async (req, res) => {
    try {
        const payload = req.body;

        if (!Array.isArray(payload)) {
            return res.status(400).json({
                success: false,
                message: "Request body must be an array"
            });
        }

        if (payload.length > 150) {
            return res.status(400).json({
                success: false,
                message: "Maximum 150 records allowed"
            });
        }

        const results = [];

        for (const item of payload) {
            if (!item.website || typeof item.website !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Each object must contain a valid website field"
                });
            }

            const contacts = await extractContacts(item.website);

            results.push({
                ...item,
                emails: contacts.emails,
                socials: contacts.socials
            });
        }

        return res.json({
            success: true,
            count: results.length,
            results
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Email & social extraction failed"
        });
    }
};
