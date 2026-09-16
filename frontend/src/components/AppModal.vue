<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-backdrop" @mousedown.self="handleBackdropClick">
        <div class="modal-dialog" :class="`modal-${size}`">
          <!-- Header -->
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" :disabled="loading" @click="$emit('update:modelValue', false)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Error global -->
          <div v-if="error" class="modal-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ error }}
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="!hideFooter" class="modal-footer">
            <button
              v-if="!confirmOnly"
              class="btn-secondary"
              :disabled="loading"
              @click="$emit('update:modelValue', false)"
            >
              Cancelar
            </button>
            <button
              class="btn-primary"
              :class="{ 'btn-danger': danger }"
              :disabled="loading"
              @click="$emit('save')"
            >
              <span v-if="loading" class="btn-spinner"></span>
              {{ loading ? 'Guardando...' : saveLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg | xl
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  saveLabel: { type: String, default: 'Guardar' },
  danger: { type: Boolean, default: false },
  confirmOnly: { type: Boolean, default: false },
  hideFooter: { type: Boolean, default: false },
  closeOnBackdrop: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'save'])

function handleBackdropClick() {
  if (props.closeOnBackdrop && !props.loading) {
    emit('update:modelValue', false)
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-dialog {
  background: white;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  width: 100%;
}

.modal-sm  { max-width: 420px; }
.modal-md  { max-width: 600px; }
.modal-lg  { max-width: 800px; }
.modal-xl  { max-width: 1024px; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  color: #9ca3af;
  transition: background 0.15s, color 0.15s;
}

.modal-close:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

.modal-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.75rem 1.5rem 0;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #b91c1c;
  font-size: 0.875rem;
}

.modal-error svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.modal-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.btn-secondary {
  padding: 0.5625rem 1.25rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #9ca3af;
  background: #f9fafb;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5625rem 1.25rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #1a56a0, #2d7dd2);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-primary.btn-danger {
  background: linear-gradient(135deg, #dc2626, #ef4444);
}

.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:disabled, .btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Transición */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal-dialog,
.modal-leave-active .modal-dialog {
  transition: transform 0.2s ease;
}
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-dialog { transform: scale(0.95) translateY(-8px); }
.modal-leave-to .modal-dialog { transform: scale(0.95) translateY(-8px); }
</style>
