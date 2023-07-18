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
        const value = core.getInput('value')
        const pattern = core.getInput('pattern')

        console.log(`Input value: ${value}`)
        console.log(`Input pattern: ${pattern}`)

        if (semver.valid(value) === null) {
            throw new Error(`The input value ${value} is not a valid SemVer`)
        }

        const extracted = semver.parse(semver.clean(value))

        if (pattern === '{version}') {
            setOutput('version', value)
            return
        }

        const version = pattern.split('.').map((element) => {
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

        setOutput('version', version.join('.'))
    } catch (error) {
        core.error(error)
    }
}

run()
