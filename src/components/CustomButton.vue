<template>
    <q-btn :label="label" :color="color" :flat="flat" :class="customClass" @click="$emit('click')" />
</template>

<script>
export default {
    name: 'CustomButton',
    props: {
        label: String,
        color: String,
        flat: Boolean,
        customClass: String,
    },
    emits: ['click'],
};
</script>