import LibConfig from '@/domain/config';

export enum LoggerLevel {
  All = 0,
  Trace = 1,
  Debug = 2,
  Info = 3,
  Warn = 4,
  Error = 5,
  Off = 6,
}

export class Logger {
  static getCurrentLevel(): LoggerLevel {
    return LibConfig.loggerLevel ?? LoggerLevel.Error;
  }

  static debug(...data: any) {
    if (Logger.getCurrentLevel() >= LoggerLevel.Debug) {
      Logger.printLog(LoggerLevel.Debug, data);
    }
  }

  static trace(...data: any) {
    if (Logger.getCurrentLevel() >= LoggerLevel.Trace) {
      Logger.printLog(LoggerLevel.Trace, data);
    }
  }

  static warn(...data: any) {
    if (Logger.getCurrentLevel() >= LoggerLevel.Warn) {
      Logger.printLog(LoggerLevel.Warn, data);
    }
  }

  static info(...data: any) {
    if (Logger.getCurrentLevel() >= LoggerLevel.Info) {
      Logger.printLog(LoggerLevel.Info, data);
    }
  }

  static error(...data: any) {
    if (Logger.getCurrentLevel() >= LoggerLevel.Error) {
      Logger.printLog(LoggerLevel.Error, data);
    }
  }

  private static printLog(level: LoggerLevel, data: any[]) {
    switch (level) {
      case LoggerLevel.Error:
        console.error(...data);
        break;
      case LoggerLevel.Info:
        console.info(...data);
        break;
      case LoggerLevel.All:
      case LoggerLevel.Debug:
        console.log(...data);
        break;
      case LoggerLevel.Trace:
        console.trace(...data);
        break;
      case LoggerLevel.Warn:
        console.warn(...data);
        break;
      default:
        break;
    }
  }
}
