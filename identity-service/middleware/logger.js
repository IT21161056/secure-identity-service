const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const { format } = require("date-fns");
const { promises: fsPromises } = require("fs");

const logEvents = async (message, logFileName) => {
  const dateTime = `${format(new Date(), "yyyy-MM-dd\tHH:mm:ss")}`;
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
  const clientOrigin =
    req.headers.origin || req.get("referer") || "direct-access";
  const clientIP = req.ip || req.connection.remoteAddress;

  logEvents(
    `${req.method}\t${req.url}\t${clientOrigin}\t${clientIP}`,
    "reqLog.log"
  );

  next();
};

module.exports = {
  logger,
  logEvents,
};
