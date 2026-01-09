const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async function extractEmails(url) {
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const $ = cheerio.load(response.data);
        const emails = new Set();

        $('a[href^="mailto:"]').each((_, el) => {
            const email = $(el)
                .attr("href")
                .replace(/^mailto:/i, "")
                .split("?")[0]
                .trim()
                .toLowerCase();

            if (email) emails.add(email);
        });

        $('body *').contents().each((_, node) => {
            if (node.type === "text") {
                const matches = node.data.match(
                    /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}\b/g
                );

                if (matches) {
                    matches.forEach(e => emails.add(e.toLowerCase()));
                }
            }
        });

        return [...emails];

    } catch {
        return [];
    }
};
