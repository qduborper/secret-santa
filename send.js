import twilio from 'twilio'
import config from './config.json' assert { type: "json" }

if (!config.twilio?.sid || !config.twilio?.token || !config.twilio?.from) {
    console.error('Please provide Twilio SID, token, and phone number in config.json')
    process.exit(1)
}

/**
 * Sends Secret Santa assignments via Twilio SMS.
 * 
 * @param {Object} participants - An object where keys are participant names and values are their phone numbers.
 * @param {Object} relationships - An object where keys are participant names and values are arrays of names they should not be assigned to.
 * @param {string} twilioSid - Twilio Account SID.
 * @param {string} twilioToken - Twilio Auth Token.
 * @param {string} twilioFrom - Twilio phone number to send messages from.
 * @returns {boolean} True if assignments were sent successfully, false otherwise.
 */
function secretSanta(participants, relationships, twilioSid, twilioToken, twilioFrom) {
    const client = new twilio(twilioSid, twilioToken)
    const assignments = {}
    const participantsArray = Object.keys(participants)
    let remaining = [...participantsArray]

    for (let giver of participantsArray) {
        let possibleReceivers = remaining.filter(receiver => receiver !== giver && !(relationships[giver] || []).includes(receiver))
        if (possibleReceivers.length === 0) {
            console.log(`Failed to find a valid assignment for ${giver}.`)
            return false // No valid assignment possible
        }
        let receiver = possibleReceivers[Math.floor(Math.random() * possibleReceivers.length)]
        assignments[giver] = receiver
        remaining = remaining.filter(r => r !== receiver)
    }

    for (let giver in assignments) {
        const receiver = assignments[giver]
        const message = `Ho ho ho, ${giver} ! 🎅 Vous allez faire briller les yeux de ${receiver} en lui offrant un cadeau pour le Secret Santa ! 🎁 Joyeux Noël !`
        try {
            // If dry run is enabled, don't actually send the message
            if (config.dryRun) {
                console.log(`Dry run: ${message}`)
                continue
            }
            client.messages.create({
                body: message,
                from: twilioFrom,
                to: participants[giver]
            })
            console.log(`Message sent to ${giver} at ${participants[giver]}.`)
        } catch (error) {
            console.error(error)
        }
    }

    return true
}

let attempts = 0
let success = false

while (attempts < config.maxAttempts && !success) {
    attempts++
    success = secretSanta(config.participants, config.relationship, config.twilio.sid, config.twilio.token, config.twilio.from)
    console.log(success ? `Secret Santa assignments sent successfully on attempt ${attempts}.` : `Attempt ${attempts} failed. Retrying...`)
}

if (!success) {
    console.log(`Failed to send Secret Santa assignments after ${config.maxAttempts} attempts.`)
}