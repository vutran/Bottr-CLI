#!/usr/bin/env node

var program = require('commander')
var childProcess = require('child_process')
var fs = require('fs')
var Listr = require('listr')
var port = process.env.port || 3000

function copyFile(src, dest) {
  return new Promise((resolve, reject) => {
    fs.readFile(src, function(err1, data) {
      if (err1) {
        reject()
        return
      }

      fs.writeFile(dest, data, function(err2) {
        if (err2) {
          reject()
          return
        }

        resolve();
      })
    })
  })
}

function init() {
  var tasks = new Listr([
    {
      title: 'Copy index.js',
      task: () => copyFile(
        __dirname + '/templates/index.js',
        'index.js'
      ),
    },
    {
      title: 'Copy package.json',
      task: () => copyFile(
        __dirname + '/templates/package.json',
        'package.json'
      ),
    },
    {
      title: 'Installing dependencies',
      task: () => new Promise((resolve, reject) => {
        var child = childProcess.exec('npm install')
        child.on('close', () => {
          resolve();
        });
      }),
    },
  ]);

  tasks.run();
}

function startServer() {
  childProcess.exec('node .', (err, stdout, stderr) => {
    process.exit(1)
  })
}

function console_out(rl, msg) {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  console.log(msg)
  rl.prompt(true)
}

program
  .version('0.1.0') // Read from Package.json

program
  .command('init')
  .action(function() {
    init()
  })

program
  .command('start')
  .action(function() {
    startServer()
    console.log('Server is running on http://localhost:' + port)
  })

program
  .action(function(cmd, env) {
    program.outputHelp()
  })

program.parse(process.argv)
