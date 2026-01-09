const axios = require("axios");

exports.googleSearch = async (keyword) => {
    const { GOOGLE_API_KEY, GOOGLE_CSE_ID } = process.env;

    const r1 = await axios.get(
        "https://www.googleapis.com/customsearch/v1",
        {
            params: {
                key: GOOGLE_API_KEY,
                cx: GOOGLE_CSE_ID,
                q: keyword,
                num: 10,
                start: 1
            }
        }
    );

    const r2 = await axios.get(
        "https://www.googleapis.com/customsearch/v1",
        {
            params: {
                key: GOOGLE_API_KEY,
                cx: GOOGLE_CSE_ID,
                q: keyword,
                num: 10,
                start: 11
            }
        }
    );

    return [
        ...(r1.data.items || []),
        ...(r2.data.items || [])
    ];
};
