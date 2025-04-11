import { defineStore, acceptHMRUpdate } from "pinia";
import axios from "@/config/axios";

export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: {
      todos: []
    },
    loading: false,
  }),

  actions: {
    async fetchTodos(status = "all") {
      try {
        const res = await axios.get(`/todo/`, {
          params: { status },
        });
        this.todos = res.data;
        return res.data;
      } catch (error) {
        console.error("Error fetching todos:", error);
        throw error;
      }
    },

    async addTodo(payload) {
      try {
        const res = await axios.post("/todo/", payload);
        return res.data;
      } catch (error) {
        console.error("Error adding todo:", error);
        throw error;
      }
    },

    async updateTodo(id, payload) {
      this.todos.todos.forEach(todo => {
          if (todo.entity_id === id) {
            todo.title = payload.title; // Update the title if the id matches
          }
      });
      try {
        const res = await axios.patch(`/todo/${id}`, payload);
        return res.data;
      } catch (error) {
        console.error("Error updating todo:", error);
        throw error;
      }
    },

    async bulkDeleteTodo() {
      try {
        const res = await axios.delete(`/todo/clear-completed`);
        return res.data;
      } catch (error) {
        console.error("Error bulk deleting todos:", error);
        throw error;
      }
    },

    async markAllAsPending() {
      this.todos.todos.forEach(todo => {
        todo.is_completed = false;
      });
      try {
        const res = await axios.post(`/todo/mark-all-as-pending`);
        return res.data;
      } catch (error) {
        console.error("Error bulk activating todos:", error);
        throw error;
      }
    },

    async markAllAsCompleted() {
      this.todos.todos.forEach(todo => {
        todo.is_completed = true;
      });
      try {
        const res = await axios.post(`/todo/mark-all-as-completed`);
        return res.data;
      } catch (error) {
        console.error("Error bulk deactivating todos:", error);
        throw error;
      }
    }
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTodoStore, import.meta.hot));
}
