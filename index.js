module.exports = async function whoiserer(query) {

    const whoiser = require("whoiser")
    const pd = require("parse-domain")

    const domainInfo = pd.parseDomain(query)

    if (
        typeof domainInfo.domain === "undefined" ||
        domainInfo.type !== "LISTED" ||
        domainInfo.topLevelDomains.length === 0
    ) {
        return { success: false }
    }

    const name = `${domainInfo.domain}.${domainInfo.topLevelDomains[0]}`

    const whoiserResponse = await whoiser.domain(name, { follow: 1 })
    const whoisData = whoiserResponse[Object.keys(whoiserResponse)[0]]

    const isAvailable = (() => {
        if (Object.keys(whoisData).length === 0) {
            return true
        }

        const text = whoisData["text"]
        const status = whoisData["Domain Status"]

        if (!/\S/.test(text) || /not found|no match/i.test(text)) {
            return true
        }

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
        success: true,
        name,
        isAvailable,
        expires: whoisData["Expiry Date"],
        created: whoisData["Created Date"],
        updated: whoisData["Updated Date"],
        status: whoisData["Domain Status"],
        nameServer: whoisData["Name Server"],
    }
    return {"success": true, name: name}
};