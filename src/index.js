import path from "path"

import yargs from "yargs"
import getAppFolder from "app-folder"
import moment from "moment"
import globby from "globby"

const job = async ({name}) => {
  const appFolder = getAppFolder(name)
  const logFolder = path.join(appFolder, "log")
  const dateSuffix = moment().format("YYYY-MM-DD")
  const logFiles = await globby(`*_${dateSuffix}.txt`, {
    cwd: logFolder,
    onlyFiles: true,
    absolute: true,
  })
  process.stdout.write(`tail -f ${logFiles.map(file => `"${file}"`).join(" ")}`)
}

const builder = {
}

yargs
  .scriptName(_PKG_NAME)
  .version(_PKG_VERSION)
  .command("$0 <name>", "Generates a tail command to read log files created by jaid-logger.", builder, job).argv