# /*
# * This file is part of Container Echoes, under the Apache License 2.0.
# * See the LICENSE file in the root directory of this source tree for license information.
# *
# * Portions of this file were derived from Woodpecker CI
# * https://github.com/woodpecker-ci/woodpecker/blob/main/Makefile
# * 
# * Woodpecker CI's licensed under the Apache License 2.0.
# * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
# *
# * Changes made to the original work:
# * - Changed the project name
# * - Modified the build process slightly
# */

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

HAS_GO = $(shell hash go > /dev/null 2>&1 && echo "GO" || echo "NOGO" )
ifeq ($(HAS_GO),GO)
	XGO_VERSION ?= go-1.20.x
	CGO_CFLAGS ?= $(shell go env CGO_CFLAGS)
endif
CGO_CFLAGS ?=

##@ General

.PHONY: all
all: help

.PHONY: version
version: ## Print the current version
	@echo ${VERSION}

# The help target prints out all targets with their descriptions organized
# beneath their categories. The categories are represented by '##@' and the
# target descriptions by '##'. The awk commands is responsible for reading the
# entire set of makefiles included in this invocation, looking for lines of the
# file as xyz: ## something, and then pretty-format the target and help. Then,
# if there's a line with ##@ something, that gets pretty-printed as a category.
# More info on the usage of ANSI control characters for terminal formatting:
# https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_parameters
# More info on the awk command:
# http://linuxcommand.org/lc3_adv_awk.php

.PHONY: help
help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

.PHONY: vendor
vendor: ## Update the vendor directory
	go mod tidy
	go mod vendor

.PHONY: clean
clean: ## Clean build artifacts
	go clean -i ./...
	rm -rf build

.PHONY: clean-all
clean-all: clean ## Clean all artifacts
	rm -rf dist

.PHONY: version
version: ## Print the current version
	@echo ${VERSION}

install-tools: ## Install development tools
	@hash golangci-lint > /dev/null 2>&1; if [ $$? -ne 0 ]; then \
		go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; \
	fi ; \
	hash gofumpt > /dev/null 2>&1; if [ $$? -ne 0 ]; then \
		go install mvdan.cc/gofumpt@latest; \
	fi ;

frontend-dependencies: ## Install frontend dependencies
	(cd frontend/; npm install --frozen-lockfile)

##@ Test

.PHONY: lint
lint: install-tools ## Lint code
	@echo "Running golangci-lint"
	golangci-lint run

test-frontend: frontend-dependencies ## Test frontend code
	(cd frontend/; npm run lint)
	(cd frontend/; npm run format:check)
	(cd frontend/; npm run test:unit)

.PHONY: test
test: test-frontend ## Run all tests

##@ Build

build-agent: ## Build agent
	CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o dist/echoes-agent${BIN_SUFFIX} ./agent

.PHONY: build
build: build-agent ## Build agent binary

##@ Release

release-agent: ## Create agent binaries for release
	# compile
	GOOS=linux   GOARCH=amd64 CGO_ENABLED=0 go build -ldflags '${LDFLAGS}' -o dist/agent/linux_amd64/echoes-agent       ./agent
	GOOS=linux   GOARCH=arm64 CGO_ENABLED=0 go build -ldflags '${LDFLAGS}' -o dist/agent/linux_arm64/echoes-agent       ./agent
	GOOS=linux   GOARCH=arm   CGO_ENABLED=0 go build -ldflags '${LDFLAGS}' -o dist/agent/linux_arm/echoes-agent         ./agent
	GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -ldflags '${LDFLAGS}' -o dist/agent/windows_amd64/echoes-agent.exe ./agent
	GOOS=darwin  GOARCH=amd64 CGO_ENABLED=0 go build -ldflags '${LDFLAGS}' -o dist/agent/darwin_amd64/echoes-agent      ./agent
	GOOS=darwin  GOARCH=arm64 CGO_ENABLED=0 go build -ldflags '${LDFLAGS}' -o dist/agent/darwin_arm64/echoes-agent      ./agent
	# tar binary files
	tar -cvzf dist/echoes-agent_linux_amd64.tar.gz   -C dist/agent/linux_amd64   echoes-agent
	tar -cvzf dist/echoes-agent_linux_arm64.tar.gz   -C dist/agent/linux_arm64   echoes-agent
	tar -cvzf dist/echoes-agent_linux_arm.tar.gz     -C dist/agent/linux_arm     echoes-agent
	tar -cvzf dist/echoes-agent_windows_amd64.tar.gz -C dist/agent/windows_amd64 echoes-agent.exe
	tar -cvzf dist/echoes-agent_darwin_amd64.tar.gz  -C dist/agent/darwin_amd64  echoes-agent
	tar -cvzf dist/echoes-agent_darwin_arm64.tar.gz  -C dist/agent/darwin_arm64  echoes-agent

release-checksums: ## Create checksums for all release files
	# generate shas for tar files
	(cd dist/; sha256sum *.* > checksums.txt)

.PHONY: release
release: release-agent ## Release all binaries

##@ Bundle

bundle-prepare: ## Prepare the bundles
	go install github.com/goreleaser/nfpm/v2/cmd/nfpm@v2.6.0

bundle-agent: bundle-prepare ## Create bundles for agent
	VERSION_NUMBER=$(VERSION_NUMBER) nfpm package --config ./nfpm/agent.yaml --target ./dist --packager deb
	VERSION_NUMBER=$(VERSION_NUMBER) nfpm package --config ./nfpm/agent.yaml --target ./dist --packager rpm

.PHONY: bundle
bundle: bundle-agent ## Create all bundles