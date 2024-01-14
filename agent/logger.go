package main

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"
)

// Logger struct
type Logger struct{}

// Console color constants
const (
	Reset        = "\033[0m"
	FgRed        = "\033[31m"
	FgGreen      = "\033[32m"
	FgYellow     = "\033[33m"
	FgBlue       = "\033[34m"
	FgMagenta    = "\033[35m"
	FgCyan       = "\033[36m"
	FgGray       = "\033[90m"
	FgOrange     = "\033[38;5;208m"
	FgLightGreen = "\033[38;5;119m"
	FgLightBlue  = "\033[38;5;117m"
	FgViolet     = "\033[38;5;141m"
	FgBrown      = "\033[38;5;130m"
	FgPink       = "\033[38;5;219m"
)

var consoleModuleColors = []string{
	FgCyan,
	FgGreen,
	FgLightGreen,
	FgBlue,
	FgLightBlue,
	FgMagenta,
	FgOrange,
	FgViolet,
	FgBrown,
	FgPink,
}

var consoleLevelColors = map[string]string{
	"INFO":  FgCyan,
	"WARN":  FgYellow,
	"ERROR": FgRed,
	"DEBUG": FgGray,
}

// Log method for Logger struct
func (l Logger) Log(module, msg, level string) {
	if level == "DEBUG" && os.Getenv("NODE_ENV") != "development" {
		return
	}

	now := time.Now().Format(time.RFC3339)
	module = strings.ToUpper(module)
	level = strings.ToUpper(level)

	levelColor, ok := consoleLevelColors[level]
	if !ok {
		levelColor = ""
	}
	moduleColor := consoleModuleColors[intHash(module)%len(consoleModuleColors)]

	logEntry := fmt.Sprintf("%s [%s%s%s] %s%s%s: %s",
		now, moduleColor, module, Reset, levelColor, level, Reset, msg)

	switch level {
	case "ERROR":
		log.Println(logEntry)
	case "WARN":
		log.Println(logEntry)
	case "INFO":
		log.Println(logEntry)
	case "DEBUG":
		log.Println(logEntry)
	default:
		log.Println(logEntry)
	}
}

// intHash generates a hash for string coloring
func intHash(str string) int {
	hash := 0
	for _, char := range str {
		hash += int(char)
	}
	return hash
}

// Info logs an info level message
func (l Logger) Info(module, msg string) {
	l.Log(module, msg, "info")
}

// Warn logs a warning level message
func (l Logger) Warn(module, msg string) {
	l.Log(module, msg, "warn")
}

// Error logs an error level message
func (l Logger) Error(module, msg string) {
	l.Log(module, msg, "error")
}

// Debug logs a debug level message
func (l Logger) Debug(module, msg string) {
	l.Log(module, msg, "debug")
}
