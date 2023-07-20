#!/usr/bin/env node
const core = require('@actions/core');
const semverValid = require('semver/functions/valid')
const semverParse = require('semver/functions/parse')
const semverClean = require('semver/functions/clean')

const semver = {
    valid: semverValid,
    parse: semverParse,
    clean: semverClean
}

const setOutput = (name, value) => {
    core.setOutput(name, value)
    core.info(`Set output ${name}=${value}`)
}

/**
 * Parse the input value as SemVer and return the major.minor version
 * - value: The input value
 * - pattern: The regex pattern to match the input value e.g. {major}.{minor}.{patch}
 */
async function run() {
    try {
        let value = core.getInput('value')
        const pattern = core.getInput('pattern')

        // If contains comma, split the value to array
        if (value.match(/[, \r\n]/)) value = value.split(/[, \r\n]/).filter(Boolean)

        try {
            // Try to parse the value as JSON
            // If it is an array, it will be parsed as array
            value = JSON.parse(value)
        } catch {}

        if (Array.isArray(value)) {
            console.log(`Input value: ${JSON.stringify(value)}`)
        } else {
            console.log(`Input value: ${value}`)
        }

        console.log(`Input value type: ${typeof value}`)
        console.log(`Input pattern: ${pattern}`)

        if (Array.isArray(value)) {
            const versions = value.map((element) => {
                return parseVersion(element, pattern)
            })

            const set = new Set(versions)

            setOutput('version', JSON.stringify([...set]))
            return
        } else if (typeof value === 'string') {
            const version = parseVersion(value, pattern)

            setOutput('version', version)
            return
        } else {
            throw new Error(`The input value ${value} is not a valid SemVer`)
        }
    } catch (error) {
        core.error(error)
    }
}

const patterns = {
    version: '{version}',
    major: '{major}',
    minor: '{minor}',
    patch: '{patch}'
}

/**
 * Parse version based on the pattern
 * @param {string} value 
 * @param {string} pattern 
 * @returns 
 */
function parseVersion(value, pattern) {
    if (semver.valid(value) === null) {
        throw new Error(`The input value "${value}" is not a valid SemVer`)
    }

    const extracted = semver.parse(semver.clean(value))

    if (pattern === '{version}') {
        return value
    }

    let version = pattern

    Object
        .keys(patterns)
        .forEach((key) => {
            version = version.replace(patterns[key], extracted[key])
        })

    if (semver.valid(version) === null) {
        core.info(`[NOTE]: The output value "${version}" is not a valid SemVer`)
    }

    return version
}

run()
