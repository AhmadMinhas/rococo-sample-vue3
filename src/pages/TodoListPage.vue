<template>
    <q-page padding class="q-pa-md q-mt-md bg-grey-1">
        <div class="row justify-center">
            <div class="col-10 col-md-9 col-lg-7 q-pa-md">
                    <h5 class="text-h1 text-primary text-center text-bold q-mb-md q-mt-md q-ml-sm">Todos</h5>
                    <q-section class="q-pb-md">

                        <!-- Input for adding new tasks and "Select All" checkbox -->
                        <div class="row items-center q-mb-md">
                            <CustomCheckbox v-if="todos?.length > 0" v-model="bulkActiveOrInactive" size="lg"
                                val="primary" rounded customClass="q-ml-sm"
                                @update:model-value="bulkActiveOrInactive"
                                :disable="todoStore.loading" />
                            <CustomInput v-model="newTodo" placeholder="What needs to be done?" color="primary text-h6"
                                customClass="col-grow custom-input" @enter="addTodo" :disable="todoStore.loading" />
                        </div>
                        <!-- Todo List -->
                        <div>
                            <div style="max-height: 400px; overflow-y: auto;">
                                <q-list v-if="todos?.length > 0" class="rounded q-mb-md">
                                    <q-item v-for="todo in todos" :key="todo.entity_id" clickable
                                        class="q-pa-xs task-item">
                                        <q-item-section side class="q-pr-xs"
                                            style="display: flex; align-items: center;">
                                            <CustomCheckbox :model-value="todo.is_completed" size="lg"
                                                @update:model-value="(newStatus) => updateTodoStatus(todo, newStatus)"
                                                :disable="todoStore.loading" />
                                        </q-item-section>
                                        <q-item-section style="flex: 1; word-break: break-word; white-space: pre-wrap;">
                                            <span v-if="editingTodoId !== todo.entity_id"
                                                :class="{ 'text-strike': todo.is_completed, 'text-h6 text-grey-7 text-left': true }"
                                                @dblclick="startEditing(todo.entity_id)">
                                                {{ todo.title }}
                                            </span>
                                            <q-input v-else v-model="editingTodoText" dense autofocus
                                                @blur="editItem(todo)" @keyup.enter="editItem(todo)"
                                                @keyup.esc="cancelEditing" :disable="todoStore.loading" />
                                        </q-item-section>
                                        <q-item-section side class="delete-btn">
                                            <q-btn flat round icon="close" color="negative" @click="removeItem(todo)"
                                                :disable="todoStore.loading" />
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </div>

                            <!-- Filter Buttons -->
                            <div class="row justify-between q-mb-md">
                                <CustomButton label="All" color="primary" customClass="q-mr-sm"
                                    @click="fetchTodos('all')" :disable="todoStore.loading" />
                                <CustomButton label="Active" color="primary" customClass="q-mr-sm"
                                    @click="fetchTodos('pending')" :disable="todoStore.loading" />
                                <CustomButton label="Completed" color="primary" @click="fetchTodos('completed')"
                                    :disable="todoStore.loading" />
                            </div>
                            <hr>

                            <!-- Footer with active items count and clear completed button -->
                            <div class="row justify-between items-center q-mb-md">
                                <div class="text-grey-7 text-p text-center">{{ todos.length }} {{ todos.length === 1 ?
                                    'Todo' : 'Todos' }} Left</div>
                                <CustomButton label="Clear Completed" class="q-pa-md" color="negative"
                                    customClass="q-mr-sm" @click="bulkRemoveTodo" :disable="todoStore.loading" />
                            </div>
                        </div>
                    </q-section>
            </div>
        </div>

        <!-- Helper text -->
        <div class="text-grey-6 text-center q-mb-sm">
            Double-click a task to edit it.
        </div>
    </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import CustomInput from '@/components/CustomInput.vue'
import CustomButton from '@/components/CustomButton.vue'
import CustomCheckbox from '@/components/CustomCheckbox.vue'
import { useTodoStore } from '@/stores/todo'
import { notifyFailure } from 'src/utils/notify'

const todoStore = useTodoStore()
const newTodo = ref('')
const editingTodoId = ref(null)
const editingTodoText = ref('')

const todos = computed(() => {
    return todoStore.todos?.todos.slice().reverse() || []
})


const bulkActiveOrInactive = computed({
  get() {
    return todos.value.length > 0 && todos.value.every(todo => todo.is_completed);
  },
  set(value) {
    if (value) {
      bulkMarkAsCompleted();
    } else {
      bulkMarkAsPending();
    }
  },
});

const cancelEditing = () => {
    editingTodoId.value = null
    editingTodoText.value = ''
}

// Start editing a task
const startEditing = (taskId) => {
    const task = todos.value.find((t) => t.entity_id === taskId)
    if (task) {
        editingTodoId.value = taskId
        editingTodoText.value = task.title
    }
}

// Fetch todos from the API based on the status filter
const fetchTodos = async (status) => {
    try {
        await todoStore.fetchTodos(status)
    } catch (error) {
        console.error('Failed to fetch todos:', error)
    }
}

// Add a new task to the list using the API
const addTodo = async () => {
    if (newTodo.value.trim()) {
        const tempTodo = { entity_id: Date.now(), title: newTodo.value.trim(), is_completed: false };
        todos.value.unshift(tempTodo); // Optimistically add to the list
        newTodo.value = ''; // Clear input field

        try {
            await todoStore.addTodo({ title: tempTodo.title });
            await fetchTodos('all'); // Refresh the todo list
        } catch (error) {
            todos.value.shift(); // Revert optimistic update
            notifyFailure(error.message);
        }
    }
};

const bulkMarkAsPending = async () => {
    todos.value.forEach((todo) => (todo.is_completed = true)); // Optimistically update all to completed
    try {
        await todoStore.markAllAsPending();
    } catch (error) {
        notifyFailure(error.message);
        await fetchTodos('all'); // Revert changes if API fails
    }
};

const bulkMarkAsCompleted = async () => {
    todos.value.forEach((todo) => (todo.is_completed = false)); // Optimistically update all to not completed
    try {
        await todoStore.markAllAsCompleted();
    } catch (error) {
        notifyFailure(error.message);
        await fetchTodos('all'); // Revert changes if API fails
    }
};

// Update the completion status of a task
const updateTodoStatus = async (task, newStatus) => {
    const originalStatus = task.is_completed;
    task.is_completed = newStatus; // Optimistically update the status

    try {
        await todoStore.updateTodo(task.entity_id, { is_completed: task.is_completed });
    } catch (error) {
        task.is_completed = originalStatus; // Revert optimistic update
        notifyFailure(error.message);
    }
};

// Delete a task by its ID
const bulkRemoveTodo = async (taskId) => {
    try {
        await todoStore.bulkDeleteTodo(taskId)
        await fetchTodos('all')
    } catch (error) {
        notifyFailure(error.message)
    }
}

// Finish editing a task
const editItem = async (todo) => {
    try {
        await todoStore.updateTodo(todo.entity_id, { title: editingTodoText.value })
        cancelEditing()
    } catch (error) {
        notifyFailure(error.message)
    }
}

const removeItem = async (todo) => {
    const index = todos.value.findIndex((t) => t.entity_id === todo.entity_id);
    const removedTodo = todos.value.splice(index, 1)[0]; // Optimistically remove the task

    try {
        await todoStore.updateTodo(todo.entity_id, { is_deleted: true })
        await fetchTodos('all')
        cancelEditing
    } catch (error) {
        todos.value.splice(index, 0, removedTodo); // Revert optimistic update
        notifyFailure(error.message)
    }
}

// Initial fetch of todos
onMounted(() => fetchTodos('all'))
</script>

<style scoped>
.task-item .delete-btn {
    opacity: 0;
    transition: opacity 0.3s ease;
}

.task-item:hover .delete-btn {
    opacity: 1;
}
</style>
