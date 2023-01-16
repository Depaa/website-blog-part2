const logger = {
  debug: (message: any) => {
    process.env.ENV !== 'prod' ? console.debug(JSON.stringify(message)) : null;
  },
  info: (message: any) => {
    console.info(JSON.stringify(message));
  },
  error: (message: any) => {
    console.error(message);
  }
}

export default logger;