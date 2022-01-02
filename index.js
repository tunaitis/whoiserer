const whoiser = require("whoiser");
module.exports = async function whoiserer(query, options) {

    const whoiser = require("whoiser")
    const pd = require("parse-domain")

    const domainInfo = pd.parseDomain(query)

    if (
        typeof domainInfo.domain === "undefined" ||
        domainInfo.type !== "LISTED" ||
        domainInfo.topLevelDomains.length === 0
    ) {
        return new Error("Invalid domain name")
    }

    const name = `${domainInfo.domain}.${domainInfo.topLevelDomains[0]}`

    let whoisData = {}
    try {
        const whoiserResponse = await whoiser.domain(name, options)
        whoisData = whoiserResponse[Object.keys(whoiserResponse)[0]]
    } catch (e) {
        return e;
    }

    const isAvailable = (() => {
        if (Object.keys(whoisData).length === 0) {
            return true
        }

        const text = whoisData["text"]
        if (!/\S/.test(text) || /not found|no match/i.test(text)) {
            return true
        }

        const status = whoisData["Domain Status"]
        if (
            Array.isArray(status) &&
            (status.length === 0 ||
                status.includes("available") ||
                status.includes("free"))
        ) {
            return true
        }

        return false
    })()

    return {
        name,
        isAvailable,
        expiry: whoisData["Expiry Date"],
        created: whoisData["Created Date"],
        updated: whoisData["Updated Date"],
        status: whoisData["Domain Status"],
        nameServer: whoisData["Name Server"],
    }
};