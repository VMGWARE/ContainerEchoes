<template>
  <h1>Agents</h1>

  <VTable fixed-header>
    <thead>
      <tr>
        <th class="text-uppercase">Id</th>
        <th class="text-uppercase">Name</th>
        <th class="text-uppercase">Host Name</th>
        <th class="text-uppercase">Updated At</th>
        <th class="text-uppercase">Created At</th>
        <th class="text-uppercase">Actions</th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="agent in agents"
        :key="agent.agentId"
        :data-id="agent.agentId"
      >
        <td>
          {{ agent.agentId }}
        </td>
        <td>
          {{ agent.agentName ? agent.agentName : 'N/A' }}
        </td>
        <td>
          {{ agent.hostname }}
        </td>
        <td>
          {{ agent.updatedAt }}
        </td>
        <td>
          {{ agent.createdAt }}
        </td>

        <td>
          <VBtn
            variant="outline-primary"
            size="sm"
          >
            Edit
          </VBtn>
          <VBtn
            variant="outline-danger"
            size="sm"
          >
            Delete
          </VBtn>
        </td>
      </tr>
    </tbody>
  </VTable>
</template>

<script>
import axios from 'axios'
// import { useToast } from 'vue-toastification'

// const toast = useToast()

export default {
  title: 'Agents',
  data() {
    return {
      agents: [],
    }
  },
  mounted() {
    this.getAgents()
  },
  methods: {
    async getAgents() {
      this.processing = true

      // Add the Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`

      try {
        const response = await axios.get('/agents')
        this.agents = response.data.data

        this.processing = false
      } catch (error) {
        console.error('Failed to get agents:', error)
        this.processing = false
      }
    },
  },
}
</script>
