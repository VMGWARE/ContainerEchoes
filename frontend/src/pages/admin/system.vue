<template>
  <v-row
    align="center"
    justify="center"
  >
    <v-col>
      <v-row>
        <!-- Echoes Section -->
        <v-col
          cols="12"
          md="6"
        >
          <v-card
            class="pa-3"
            outlined
            tile
          >
            <v-card-title class="headline">Container Echoes</v-card-title>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title><b>Current Version</b></v-list-item-title>
                  <v-list-item-subtitle>{{ data.echoes.version }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title><b>Latest Version</b></v-list-item-title>
                  <v-list-item-subtitle>{{ data.echoes.latestRelease }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action
                  class="mt-5"
                  v-if="data.echoes.needsUpdate"
                >
                  <v-chip :color="data.echoes.needsUpdate ? 'red' : 'green'">
                    {{ data.echoes.needsUpdate ? 'Update Required' : 'Updated' }}
                  </v-chip>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Node.js and Database Section -->
        <v-col
          cols="12"
          md="6"
        >
          <v-card
            class="pa-3"
            outlined
            tile
          >
            <v-card-title class="headline">Node.js</v-card-title>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title><b>Version:</b>{{ data.echoes.nodeVersion }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-card-title class="headline">Database</v-card-title>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title><b>Version:</b> {{ data.database.version }}</v-list-item-title>
                <v-list-item-content
                  ><b>Type:</b> {{ data.database.type === 'mysql2' ? 'MySQL' : 'PostgreSQL' }}</v-list-item-content
                >
              </v-list-item-content>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <!-- Host Information Section -->
        <v-col cols="12">
          <v-card
            class="pa-3"
            outlined
            tile
          >
            <v-card-title class="headline">Host Information</v-card-title>
            <v-list>
              <v-list-item-group>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Operating System</b></v-list-item-title>
                    <v-list-item-subtitle>{{ data.host.os }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Hostname</b></v-list-item-title>
                    <v-list-item-subtitle>{{ data.host.hostname }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>CPU Cores</b></v-list-item-title>
                    <v-list-item-subtitle>{{ data.host.cpuCores }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Total RAM</b></v-list-item-title>
                    <v-list-item-subtitle>{{ formatBytes(data.host.totalRam) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Working Directory</b></v-list-item-title>
                    <v-list-item-subtitle>{{ data.host.workingDir }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import axios from 'axios'

export default {
  title: 'System - Admin',
  data() {
    return {
      data: {
        echoes: {
          version: '',
          latestRelease: '',
          needsUpdate: false,
          nodeVersion: '',
          latestReleaseBody: '',
        },
        database: {
          version: '',
          type: '',
        },
        host: {
          os: '',
          hostname: '',
          cpuCores: 0,
          totalRam: 0,
          workingDir: '',
        },
      },
      processing: true,
    }
  },
  methods: {
    formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes'

      const k = 1024
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

      const i = Math.floor(Math.log(bytes) / Math.log(k))

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    },
    formatReleaseNotes(notes) {
      return notes.replace(/\n/g, '<br>')
    },
    async getSystemInfo() {
      this.processing = true
      // Add the Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`

      const response = await axios.get('/general/system-information')
      var resp = response.data.data
      this.processing = false
      return resp
    },
  },
  beforeMount() {
    // Fetch data from API
    this.getSystemInfo().then(data => {
      this.data = data
    })
  },
}
</script>

<style scoped>
/* Add any additional styling here */
</style>
