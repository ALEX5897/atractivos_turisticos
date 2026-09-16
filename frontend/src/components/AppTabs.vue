<template>
  <div class="tabs-container">
    <div class="tabs-header">
      <button
        v-for="(tab, idx) in tabs"
        :key="idx"
        :class="['tab-btn', { 'tab-active': modelValue === idx }]"
        @click="$emit('update:modelValue', idx)"
      >
        <span v-if="typeof tab === 'object' && tab.icon" class="tab-icon" v-html="tab.icon"></span>
        {{ typeof tab === 'string' ? tab : tab.label }}
      </button>
    </div>
    <div class="tabs-body">
      <template v-for="(tab, idx) in tabs" :key="idx">
        <slot v-if="modelValue === idx" :name="`tab-${idx}`" />
      </template>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: Number, default: 0 },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tabs-header {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 8px 8px 0 0;
  padding: 0 1.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
}

.tab-btn:hover {
  color: #374151;
  background: rgba(26, 86, 160, 0.04);
}

.tab-btn.tab-active {
  color: #1a56a0;
  border-bottom-color: #1a56a0;
  background: white;
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.tabs-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex: 1;
}

@media (max-width: 640px) {
  .tabs-header {
    padding: 0 1rem;
  }

  .tab-btn {
    padding: 0.75rem 0.875rem;
    font-size: 0.8125rem;
  }
}
</style>
