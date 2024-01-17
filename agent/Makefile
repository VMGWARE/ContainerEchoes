GO_PACKAGES ?= $(shell go list ./... | grep -v /vendor/)

TARGETOS ?= $(shell go env GOOS)
TARGETARCH ?= $(shell go env GOARCH)

BIN_SUFFIX :=
ifeq ($(TARGETOS),windows)
	BIN_SUFFIX := .exe
endif

VERSION ?= next
VERSION_NUMBER ?= 0.0.0
CI_COMMIT_SHA ?= $(shell git rev-parse HEAD)

# it's a tagged release
ifneq ($(CI_COMMIT_TAG),)
	VERSION := $(CI_COMMIT_TAG:v%=%)
	VERSION_NUMBER := ${CI_COMMIT_TAG:v%=%}
else
	# append commit-sha to next version
	ifeq ($(VERSION),next)
		VERSION := $(shell echo "next-$(shell echo ${CI_COMMIT_SHA} | cut -c -10)")
	endif
	# append commit-sha to release branch version
	ifeq ($(shell echo ${CI_COMMIT_BRANCH} | cut -c -9),release/v)
		VERSION := $(shell echo "$(shell echo ${CI_COMMIT_BRANCH} | cut -c 10-)-$(shell echo ${CI_COMMIT_SHA} | cut -c -10)")
	endif
endif

.PHONY: version
version: ## Print the current version
	@echo ${VERSION}