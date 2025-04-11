import { defineStore, acceptHMRUpdate } from 'pinia'
import axios from '@/config/axios'

export const usePersonStore = defineStore('person', {
  state: () => ({
    person: null,
    loading: false
  }),

  actions: {
    async fetchPerson() {
      this.loading = true
      const res = await axios.get('/person/me')
      this.person = res.data
      this.loading = false
      return res.data
    },

    async updatePerson(payload) {
      this.loading = true
      const res = await axios.patch('/person/me', payload)
      this.person = res.data
      this.loading = false
      return res.data
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePersonStore, import.meta.hot))
}
