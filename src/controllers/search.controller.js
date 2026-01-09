const { googleSearch } = require("../services/googleSearch.service");
const extractEmails = require("../utils/emailExtractor");

const WORD_WEIGHTS = {
    dental: 0.5,
    dentist: 0.5,
    centre: 0.3,
    center: 0.3,
    clinic: 0.3
};

function splitWords(text = "") {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}

function extractDomainText(url) {
    try {
        const u = new URL(url);
        return u.hostname
            .toLowerCase()
            .replace(/^www\./, "")
            .replace(/\.com\.au$/, "")
            .replace(/\.com$/, "")
            .replace(/\.net$/, "")
            .replace(/\.org$/, "");
    } catch {
        return "";
    }
}

function normalizeHomepage(url) {
    try {
        const u = new URL(url);
        return `${u.protocol}//${u.hostname}/`;
    } catch {
        return null;
    }
}

async function processKeyword(keyword) {
    const keywordWords = splitWords(keyword);
    const results = await googleSearch(keyword);

    let bestResult = null;
    let bestScore = 0;

    for (const item of results) {
        if (!item.link) continue;

        const homepage = normalizeHomepage(item.link);
        if (!homepage) continue;

        const domainText = extractDomainText(homepage);

        let score = 0;
        for (const word of keywordWords) {
            const weight = WORD_WEIGHTS[word] ?? 1.0;
            if (domainText.includes(word)) {
                score += weight;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestResult = {
                title: item.title,
                url: homepage,
                score: Number(score.toFixed(2))
            };
        }
    }

    if (!bestResult || bestScore === 0) {
        return {
            website: null,
            emails: []
        };
    }

    const emails = await extractEmails(bestResult.url);

    return {
        website: bestResult,
        emails
    };
}

exports.searchWebsite = async (req, res) => {
    try {
        const payload = req.body;

        if (!Array.isArray(payload)) {
            return res.status(400).json({
                success: false,
                message: "Request body must be an array"
            });
        }

        if (payload.length > 10) {
            return res.status(400).json({
                success: false,
                message: "Maximum 10 records allowed"
            });
        }

        const results = [];

        for (const item of payload) {
            if (!item.Name || typeof item.Name !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Each object must contain a valid Name field"
                });
            }

            const processed = await processKeyword(item.Name);

            results.push({
                ID: item.ID ?? null,
                Name: item.Name,
                result: processed.website,
                emails: processed.emails
            });
        }

        return res.json({
            success: true,
            count: results.length,
            results
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Search failed"
        });
    }
};
