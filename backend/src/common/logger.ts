import fs from 'node:fs';
import path from 'node:path';

export type LogLevel = 'info' | 'warn' | 'error';

const logFile = path.join(process.cwd(), 'logs.log');

function write(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry = {
    level,
    message,
    context: context ?? {},
    timestamp: new Date().toISOString()
  };
  const line = JSON.stringify(entry);
  fs.appendFileSync(logFile, line + '\n');
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    write('info', message, context);
  },
  warn(message: string, context?: Record<string, unknown>) {
    write('warn', message, context);
  },
  error(message: string, context?: Record<string, unknown>) {
    write('error', message, context);
  }
};

export function clearLogs() {
  if (fs.existsSync(logFile)) {
    fs.unlinkSync(logFile);
  }
}
