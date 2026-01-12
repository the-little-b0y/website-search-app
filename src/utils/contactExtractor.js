const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async function extractContacts(url) {
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const $ = cheerio.load(response.data);

        const emails = new Set();
        const socials = {
            facebook: new Set(),
            instagram: new Set(),
            linkedin: new Set()
        };

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

        $('a[href]').each((_, el) => {
            const href = $(el).attr("href");
            if (!href) return;

            const link = href.toLowerCase();

            if (link.includes("facebook.com")) {
                socials.facebook.add(href);
            }

            if (link.includes("instagram.com")) {
                socials.instagram.add(href);
            }

            if (link.includes("linkedin.com")) {
                socials.linkedin.add(href);
            }
        });

        return {
            emails: [...emails],
            socials: {
                facebook: [...socials.facebook],
                instagram: [...socials.instagram],
                linkedin: [...socials.linkedin]
            }
        };

    } catch {
        return {
            emails: [],
            socials: {
                facebook: [],
                instagram: [],
                linkedin: []
            }
        };
    }
};
