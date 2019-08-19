import path from "path"

import yargs from "yargs"
import getAppFolder from "app-folder"
import moment from "moment"
import globby from "globby"
import chalk from "chalk"
import Tail from "tail-file"
import fss from "@absolunet/fss"
import filesize from "filesize"

const job = async ({name, generate, excludeLevels}) => {
  const appFolder = getAppFolder(name)
  const logFolder = path.join(appFolder, "log")
  const dateSuffix = moment().format("YYYY-MM-DD")
  const logFiles = await globby(`*_${dateSuffix}.txt`, {
    cwd: logFolder,
    onlyFiles: true,
    absolute: true,
  })
  if (generate) {
    process.stdout.write(chalk.yellow(`tail -f ${logFiles.map(file => `"${file}"`).join(" ")}\n`))
    return
  }
  const getColor = level => {
    if (level === "debug") {
      return chalk.green
    }
    if (level === "info") {
      return chalk.cyan
    }
    if (level === "warn") {
      return chalk.yellow
    }
    if (level === "error") {
      return chalk.red
    }
    return null
  }
  const processLine = line => {
    const regex = /\[(?<time>.+?) +(?<level>\w+)] +(?<text>.*)/
    const parsed = regex.exec(line)
    if (!parsed) {
      return null
    }
    const {time, level, text} = parsed.groups
    if (excludeLevels.some(excludeLevel => excludeLevel.toLowerCase() === level.toLowerCase())) {
      return null
    }
    const color = getColor(level.toLowerCase())
    if (color) {
      return color(`${time} ${text}`)
    } else {
      return `${time} ${text}`
    }
  }
  // eslint-disable-next-line no-unused-vars
  const tails = logFiles.map(logFile => {
    process.stdout.write(`${chalk.cyan("tail -f")} ${chalk.yellow(`"${logFile}"`)}\n`)
    const {size} = fss.stat(logFile)
    if (size) {
      process.stdout.write(`${chalk.green(filesize(size))}\n`)
    }
    const tail = new Tail(logFile)
    tail.on("line", line => {
      const processedLine = processLine(line)
      if (processedLine) {
        process.stdout.write(`${processedLine}\n`)
      }
    })
    tail.start()
    return tail
  })
}

/**
 * @type {import("yargs").CommandBuilder}
 */
const builder = {
  generate: {
    type: "boolean",
    default: "false",
    description: "Output `tail -f` shell command",
  },
  excludeLevels: {
    type: "array",
    default: [],
    description: "List of log levels to exclude in live mode",
  },
}

yargs
  .scriptName(_PKG_NAME)
  .version(_PKG_VERSION)
  .command("$0 <name>", "Generates a tail command to read log files created by jaid-logger.", builder, job).argv