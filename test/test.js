import path from "path"

import coffee from "coffee"
import jaidLogger from "jaid-logger"

const main = path.resolve(process.env.MAIN)

const loggerId = `${_PKG_NAME}-test`
const logger = jaidLogger(loggerId)

logger.info("Hi")

it("should run", () => coffee.fork(main, [loggerId])
  .expect("code", 0)
  .expect("stdout", /^tail -f .+jaid-logger-tail-test[/\\]log[/\\]jaidLoggerTailTest/)
  .debug(true)
  .end())