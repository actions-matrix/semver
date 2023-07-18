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

        try {
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

            setOutput('version', [...set])
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

function parseVersion(value, pattern) {
    if (semver.valid(value) === null) {
        throw new Error(`The input value ${value} is not a valid SemVer`)
    }

    const extracted = semver.parse(semver.clean(value))

    if (pattern === '{version}') {
        setOutput('version', value)
        return
    }

    const version = pattern
        .split('.')
        .map((element) => {
            switch (element) {
                case '{version}':
                    return value
                case '{major}':
                    return extracted.major
                case '{minor}':
                    return extracted.minor
                case '{patch}':
                    return extracted.patch
                default:
                    return element
            }
        })
        .join('.')

    return version
}

run()
