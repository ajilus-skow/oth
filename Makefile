SHELL := /usr/bin/env bash
IOS_REMOTE_HOST ?= ajilus-air.local
IOS_REMOTE_USER ?= skow
IOS_REMOTE_SSH_KEY ?= $(HOME)/.ssh/id_ed25519_mac_air
# Do not inherit Audestra's mirror path from a shared shell: this project must
# never rsync into the neighboring app's remote checkout. A command-line value
# (for example `make ios-remote-build IOS_REMOTE_DIR=...`) may still override it.
IOS_REMOTE_DIR = on-the-hook-ios-build
RUNNER_REPOSITORY ?=

.PHONY: setup lint test typecheck format format-check run-ios build-ios help help-ios \
	ios-remote-doctor ios-remote-sync ios-remote-build ios-remote-run ios-remote-verify ios-remote-logs \
	runners-register runners-status

help:
	@printf '%s\n' 'make setup          Install JavaScript dependencies' \
		'make run-ios        Start the iOS app through React Native' \
		'make build-ios      Build the iOS app (requires macOS, Xcode, and CocoaPods)' \
		'make help-ios       Show Linux-to-Mac iOS build commands' \
		'make lint           Run workspace type checks' \
		'make test           Run workspace tests'

setup:
	npm install

lint:
	npm run lint
	npm run typecheck

test:
	npm run test

typecheck:
	npm run typecheck

format:
	npm run format

format-check:
	npm run format:check

run-ios:
	npm --workspace apps/mobile run ios

build-ios:
	npm --workspace apps/mobile run build:ios

help-ios:
	@printf '%s\n' \
		'Remote iOS targets (edit locally; the Mac is an rsync mirror):' \
		'  make ios-remote-doctor  Check SSH, Xcode, Node, and CocoaPods' \
		'  make ios-remote-sync    Push sources and install iOS dependencies' \
		'  make ios-remote-build   Build the simulator app and download it' \
		'  make ios-remote-run     Build and launch the iOS Simulator' \
		'  make ios-remote-verify  Verify the downloaded simulator artifact' \
		'  make ios-remote-logs    Download Metro and Simulator logs'

ios-remote-doctor:
	IOS_REMOTE_HOST="$(IOS_REMOTE_HOST)" IOS_REMOTE_USER="$(IOS_REMOTE_USER)" IOS_REMOTE_SSH_KEY="$(IOS_REMOTE_SSH_KEY)" IOS_REMOTE_DIR="$(IOS_REMOTE_DIR)" ./tools/scripts/ios-remote-build.sh doctor

ios-remote-sync:
	IOS_REMOTE_HOST="$(IOS_REMOTE_HOST)" IOS_REMOTE_USER="$(IOS_REMOTE_USER)" IOS_REMOTE_SSH_KEY="$(IOS_REMOTE_SSH_KEY)" IOS_REMOTE_DIR="$(IOS_REMOTE_DIR)" ./tools/scripts/ios-remote-build.sh sync

ios-remote-build:
	IOS_REMOTE_HOST="$(IOS_REMOTE_HOST)" IOS_REMOTE_USER="$(IOS_REMOTE_USER)" IOS_REMOTE_SSH_KEY="$(IOS_REMOTE_SSH_KEY)" IOS_REMOTE_DIR="$(IOS_REMOTE_DIR)" ./tools/scripts/ios-remote-build.sh build

ios-remote-run:
	IOS_REMOTE_HOST="$(IOS_REMOTE_HOST)" IOS_REMOTE_USER="$(IOS_REMOTE_USER)" IOS_REMOTE_SSH_KEY="$(IOS_REMOTE_SSH_KEY)" IOS_REMOTE_DIR="$(IOS_REMOTE_DIR)" ./tools/scripts/ios-remote-build.sh run

ios-remote-verify:
	IOS_REMOTE_HOST="$(IOS_REMOTE_HOST)" IOS_REMOTE_USER="$(IOS_REMOTE_USER)" IOS_REMOTE_SSH_KEY="$(IOS_REMOTE_SSH_KEY)" IOS_REMOTE_DIR="$(IOS_REMOTE_DIR)" ./tools/scripts/ios-remote-build.sh verify

ios-remote-logs:
	IOS_REMOTE_HOST="$(IOS_REMOTE_HOST)" IOS_REMOTE_USER="$(IOS_REMOTE_USER)" IOS_REMOTE_SSH_KEY="$(IOS_REMOTE_SSH_KEY)" IOS_REMOTE_DIR="$(IOS_REMOTE_DIR)" ./tools/scripts/ios-remote-build.sh logs

runners-register:
	@test -n "$(RUNNER_REPOSITORY)" || { echo 'RUNNER_REPOSITORY=owner/repository is required.' >&2; exit 64; }
	RUNNER_REPOSITORY="$(RUNNER_REPOSITORY)" IOS_REMOTE_HOST="$(IOS_REMOTE_HOST)" IOS_REMOTE_USER="$(IOS_REMOTE_USER)" IOS_REMOTE_SSH_KEY="$(IOS_REMOTE_SSH_KEY)" ./tools/ci/register-runners.sh

runners-status:
	@test -n "$(RUNNER_REPOSITORY)" || { echo 'RUNNER_REPOSITORY=owner/repository is required.' >&2; exit 64; }
	RUNNER_REPOSITORY="$(RUNNER_REPOSITORY)" ./tools/ci/check-runners.sh
