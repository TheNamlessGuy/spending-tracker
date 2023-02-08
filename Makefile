.PHONY: start clean nstart nclean dstart dclean dlogs stbuild ststart stclean stlogs

# General
start:
	@./start.py start

clean:
	@./start.py clean

help:
	@./start.py --help

# Network
nstart:
	@./start.py nstart

nclean:
	@./start.py nclean

# Database
dstart:
	@./start.py dstart

dclean:
	@./start.py dclean

dlogs:
	@./start.py dlogs

# ST
stbuild:
	@./start.py stbuild

ststart:
	@./start.py ststart

stclean:
	@./start.py stclean

stlogs:
	@./start.py stlogs

streup:
	@./start.py streup
