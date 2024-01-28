<template>
  <VRow
    align="center"
    justify="center"
  >
    <VCol>
      <VRow>
        <!-- Echoes Section -->
        <VCol
          cols="12"
          md="6"
        >
          <VCard
            class="pa-3"
            outlined
            tile
          >
            <VCardTitle class="headline">
              Container Echoes
            </VCardTitle>
            <VList>
              <VListItem>
                <VListItemContent>
                  <VListItemTitle><b>Current Version</b></VListItemTitle>
                  <VListItemSubtitle>{{ data.echoes.version }}</VListItemSubtitle>
                </VListItemContent>
              </VListItem>
              <VListItem>
                <VListItemContent>
                  <VListItemTitle><b>Latest Version</b></VListItemTitle>
                  <VListItemSubtitle>{{ data.echoes.latestRelease }}</VListItemSubtitle>
                </VListItemContent>
                <VListItemAction
                  v-if="data.echoes.needsUpdate"
                  class="mt-5"
                >
                  <VChip :color="data.echoes.needsUpdate ? 'red' : 'green'">
                    {{ data.echoes.needsUpdate ? 'Update Required' : 'Updated' }}
                  </VChip>
                </VListItemAction>
              </VListItem>
            </VList>
          </VCard>
        </VCol>

        <!-- Node.js and Database Section -->
        <VCol
          cols="12"
          md="6"
        >
          <VCard
            class="pa-3"
            outlined
            tile
          >
            <VCardTitle class="headline">
              Node.js
            </VCardTitle>
            <VListItem>
              <VListItemContent>
                <VListItemTitle><b>Version:</b>{{ data.echoes.nodeVersion }}</VListItemTitle>
              </VListItemContent>
            </VListItem>

            <VCardTitle class="headline">
              Database
            </VCardTitle>
            <VListItem>
              <VListItemContent>
                <VListItemTitle><b>Version:</b> {{ data.database.version }}</VListItemTitle>
                <VListItemContent>
                  <b>Type:</b> {{ data.database.type === 'mysql2' ? 'MySQL' : 'PostgreSQL' }}
                </VListItemContent>
              </VListItemContent>
            </VListItem>
          </VCard>
        </VCol>
      </VRow>

      <VRow>
        <!-- Host Information Section -->
        <VCol cols="12">
          <VCard
            class="pa-3"
            outlined
            tile
          >
            <VCardTitle class="headline">
              Host Information
            </VCardTitle>
            <VList>
              <VListItemGroup>
                <VListItem>
                  <VListItemContent>
                    <VListItemTitle><b>Operating System</b></VListItemTitle>
                    <VListItemSubtitle>{{ data.host.os }}</VListItemSubtitle>
                  </VListItemContent>
                </VListItem>
                <VListItem>
                  <VListItemContent>
                    <VListItemTitle><b>Hostname</b></VListItemTitle>
                    <VListItemSubtitle>{{ data.host.hostname }}</VListItemSubtitle>
                  </VListItemContent>
                </VListItem>
                <VListItem>
                  <VListItemContent>
                    <VListItemTitle><b>CPU Cores</b></VListItemTitle>
                    <VListItemSubtitle>{{ data.host.cpuCores }}</VListItemSubtitle>
                  </VListItemContent>
                </VListItem>
                <VListItem>
                  <VListItemContent>
                    <VListItemTitle><b>Total RAM</b></VListItemTitle>
                    <VListItemSubtitle>{{ formatBytes(data.host.totalRam) }}</VListItemSubtitle>
                  </VListItemContent>
                </VListItem>
                <VListItem>
                  <VListItemContent>
                    <VListItemTitle><b>Working Directory</b></VListItemTitle>
                    <VListItemSubtitle>{{ data.host.workingDir }}</VListItemSubtitle>
                  </VListItemContent>
                </VListItem>
              </VListItemGroup>
            </VList>
          </VCard>
        </VCol>
      </VRow>
    </VCol>
  </VRow>
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
  beforeMount() {
    // Fetch data from API
    this.getSystemInfo().then(data => {
      this.data = data
    })
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
}
</script>

<style scoped>
/* Add any additional styling here */
</style>
