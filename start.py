#!/usr/bin/python3

import sys
import subprocess

def cmd(cmds):
  print('RUNNING:', ' '.join(cmds))
  return subprocess.run(cmds).returncode

# NETWORK
def nstart():
  print('+--------+')
  print('| NSTART |')
  print('+--------+')
  # docker network create {network-name}
  return cmd(['docker', 'network', 'create', env['NETWORK_NAME']])

def nclean():
  print('+--------+')
  print('| NCLEAN |')
  print('+--------+')
  # docker network rm {network-name}
  return cmd(['docker', 'network', 'rm', env['NETWORK_NAME']])

# DATABASE
def dstart():
  print('+--------+')
  print('| DSTART |')
  print('+--------+')
  # docker run --name={db-container} --network={network} --network-alias={db-nw-alias} -v {db-volume}:/var/lib/postgresql/data -e POSTGRES_DB={db-name} -e POSTGRES_USER={db-user} -e POSTGRES_PASSWORD={db-pw} -d postgres:{db-version}
  return cmd(['docker', 'run',
    '--name=' + env['DB_CONTAINER_NAME'],
    '--network=' + env['NETWORK_NAME'],
    '--network-alias=' + env['DB_NETWORK_ALIAS'],
    '-v', env['DB_VOLUME_LOCATION'] + ':/var/lib/postgresql/data',
    '-e', 'POSTGRES_DB=' + env['DB_NAME'],
    '-e', 'POSTGRES_USER=' + env['DB_USER'],
    '-e', 'POSTGRES_PASSWORD=' + env['DB_PASSWORD'],
    '-d', 'postgres:' + env['DB_IMAGE_VERSION'],
  ])

def dclean():
  print('+--------+')
  print('| DCLEAN |')
  print('+--------+')
  # docker stop {db-container}
  code = cmd(['docker', 'stop', env['DB_CONTAINER_NAME']])
  if code != 0:
    return code

  # docker container rm {db-container}
  return cmd(['docker', 'container', 'rm', env['DB_CONTAINER_NAME']])

def dlogs():
  print('+-------+')
  print('| DLOGS |')
  print('+-------+')
  # docker logs {db-container}
  return cmd(['docker', 'logs', env['DB_CONTAINER_NAME']])

# ST
def stbuild():
  print('+---------+')
  print('| STBUILD |')
  print('+---------+')
  # docker build -t {image}:{version} -f ST-Dockerfile .
  return cmd(['docker', 'build', '-t', env['IMAGE_NAME'] + ':' + env['IMAGE_VERSION'], '-f', 'ST-Dockerfile', '.'])

def ststart():
  print('+---------+')
  print('| STSTART |')
  print('+---------+')
  # docker run --name={container} --network={network} --network-alias={nw-alias} -p{port}:8000 -d {image}:{version}
  return cmd(['docker', 'run',
    '--name=' + env['CONTAINER_NAME'],
    '--network=' + env['NETWORK_NAME'],
    '--network-alias=' + env['NETWORK_ALIAS'],
    '-p' + env['PORT'] + ':8000',
    '-d', env['IMAGE_NAME'] + ':' + env['IMAGE_VERSION'],
  ])

def stclean():
  print('+---------+')
  print('| STCLEAN |')
  print('+---------+')
  # docker stop {container}
  code = cmd(['docker', 'stop', env['CONTAINER_NAME']])
  if code != 0:
    return code

  # docker container rm {container}
  return cmd(['docker', 'container', 'rm', env['CONTAINER_NAME']])

def stlogs():
  print('+--------+')
  print('| STLOGS |')
  print('+--------+')
  # docker logs {container}
  return cmd(['docker', 'logs', env['CONTAINER_NAME']])

def streup():
  code = stbuild()
  if code != 0:
    return code

  code = stclean()
  if code != 0:
    return code

  return ststart()

# GENERAL
def start():
  code = nstart()
  if code != 0:
    return code

  code = dstart()
  if code != 0:
    return code

  code = stbuild()
  if code != 0:
    return code

  return ststart()

def clean():
  code = stclean()
  if code != 0:
    return code

  code = dclean()
  if code != 0:
    return code

  return nclean()

def help():
  print("""
Executes a certain number of commands. Sort of like make, but I didn't want to do string handling in GNUMake/bash syntax.

Usage:
  ./start.py <commands>

Available commands:
  start - Should only be run when everything is stopped (for example, if this is the first time you're starting ST). Equal to 'nstart dstart stbuild ststart'
  clean - Equal to 'stclean dclean nclean'

  nstart - Start network
  nclean - Stop and remove network

  dstart - Start database
  dclean - Stop and remove database container (volume is left alone)
  dlogs  - Show logs from the database container

  stbuild - Build the ST image
  ststart - Start ST
  stclean - Stop and remove the ST container
  stlogs  - Show logs from the ST container
  streup  - Rebuilds and restarts ST. Equivalent to 'stbuild stclean ststart'

  help - Display this message
"""[1:-1])
  exit(0)

commands = {
  'start': start,
  'clean': clean,

  'nstart': nstart,
  'nclean': nclean,

  'dstart': dstart,
  'dclean': dclean,
  'dlogs':  dlogs,

  'stbuild': stbuild,
  'ststart': ststart,
  'stclean': stclean,
  'stlogs':  stlogs,
  'streup':  streup,
}

env = {}

def main():
  if len(sys.argv) < 2:
    print('No commands given')
    exit(1)

  with open('./.env', 'r') as f:
    lines = f.readlines()

  global env
  for line in lines:
    line = line.strip()
    if len(line) == 0 or line.startswith('#'): continue

    [key, val] = line.split('=', 1)
    env[key] = val

  cmds = sys.argv[1:]
  if 'help' in cmds or '-h' in cmds or '--help' in cmds:
    help()

  for i in range(len(cmds)):
    cmd = cmds[i]
    if cmd not in commands:
      print('Command "' + cmd + '" not recognized')
      exit(1)

    retval = commands[cmd]()
    if retval != 0:
      exit(retval)

    if i + 1 < len(cmds):
      print()

main()
