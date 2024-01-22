// Copyright 2022 Woodpecker Authors
// Copyright 2019 Laszlo Fogas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"os"

	"github.com/urfave/cli/v2"
)

var flags = []cli.Flag{
	&cli.StringFlag{
		EnvVars: []string{"ECHOES_SERVER"},
		Name:    "server",
		Usage:   "server address",
		Value:   "localhost:8080",
	},
	&cli.StringFlag{
		EnvVars:  []string{"ECHOES_AGENT_SECRET"},
		Name:     "grpc-token",
		Usage:    "server-agent shared token",
		FilePath: os.Getenv("ECHOES_AGENT_SECRET_FILE"),
	},
	&cli.StringFlag{
		EnvVars: []string{"ECHOES_HOSTNAME"},
		Name:    "hostname",
		Usage:   "agent hostname",
	},
	&cli.BoolFlag{
		EnvVars: []string{"ECHOES_HEALTHCHECK"},
		Name:    "healthcheck",
		Usage:   "enable healthcheck endpoint",
		Value:   true,
	},
	&cli.StringFlag{
		EnvVars: []string{"ECHOES_HEALTHCHECK_ADDR"},
		Name:    "healthcheck-addr",
		Usage:   "healthcheck endpoint address",
		Value:   ":5000",
	},
}
