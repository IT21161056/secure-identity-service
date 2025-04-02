const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const { promises: fsPromises } = require("fs");
const path = require("path");

const logEvents = async (message, logFileName) => {
  const dateTime = `${format(new Date(), "yyyyMMdd\tHH:mm:ss")}`;
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    const logsDir = path.join(__dirname, "..", "logs");
    if (!fs.existsSync(logsDir)) {
      await fsPromises.mkdir(logsDir);
    }
    await fsPromises.appendFile(path.join(logsDir, logFileName), logItem);
  } catch (error) {
    console.log(error);
  }
};

const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.get("origin")}`, "reqLog.log");
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = {
  logEvents,
  logger,
};
