<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo / Header -->
      <div class="login-header">
        <div class="logo-wrapper">
          <img src="/img/logo_sicetQT.png" alt="Quito Turismo" class="logo-image" />
        </div>
        <h1 class="app-title">Sistema de Gestión</h1>
        <p class="app-subtitle">Atractivos Turísticos - Quito</p>
      </div>

      <!-- Formulario de login -->
      <form class="login-form" @submit.prevent="handleLogin" novalidate>
        <div class="form-group">
          <label for="username" class="form-label">Usuario</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              id="username"
              v-model.trim="form.username"
              type="text"
              class="form-input"
              :class="{ 'input-error': fieldErrors.username }"
              placeholder="Ingrese su usuario"
              autocomplete="username"
              @input="clearFieldError('username')"
            />
          </div>
          <span v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'input-error': fieldErrors.password }"
              placeholder="Ingrese su contraseña"
              autocomplete="current-password"
              @input="clearFieldError('password')"
            />
            <button
              type="button"
              class="toggle-password"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <span v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</span>
        </div>

        <!-- Mensaje de error general -->
        <div v-if="authStore.error" class="alert-error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          class="btn-login"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading" class="spinner"></span>
          <span>{{ authStore.loading ? 'Verificando...' : 'Ingresar' }}</span>
        </button>
      </form>

      <p class="login-footer">
        Sistema de Gestión de Atractivos Turísticos &copy; {{ currentYear }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const currentYear = new Date().getFullYear()
const showPassword = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const fieldErrors = reactive({
  username: '',
  password: '',
})

function clearFieldError(field) {
  fieldErrors[field] = ''
}

function validate() {
  let valid = true
  fieldErrors.username = ''
  fieldErrors.password = ''

  if (!form.username) {
    fieldErrors.username = 'El usuario es requerido'
    valid = false
  }

  if (!form.password) {
    fieldErrors.password = 'La contraseña es requerida'
    valid = false
  } else if (form.password.length < 4) {
    fieldErrors.password = 'Contraseña demasiado corta'
    valid = false
  }

  return valid
}

async function handleLogin() {
  if (!validate()) return
  await authStore.login(form.username, form.password)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #003f87 0%, #0052b3 50%, #1e5ba8 100%);
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.login-container {
  background: #ffffff;
  border-radius: 16px;
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.logo-image {
  height: 80px;
  object-fit: contain;
}

.app-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #003f87;
  margin: 0 0 0.5rem;
  letter-spacing: -0.5px;
}

.app-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  width: 18px;
  height: 18px;
  color: #94a3b8;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.75rem 2.75rem 0.75rem 2.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9375rem;
  color: #1e293b;
  background: #f8fafc;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #003f87;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(0, 63, 135, 0.1);
}

.form-input.input-error {
  border-color: #ef4444;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #9ca3af;
  display: flex;
  align-items: center;
}

.toggle-password svg {
  width: 18px;
  height: 18px;
}

.toggle-password:hover {
  color: #6b7280;
}

.field-error {
  font-size: 0.8rem;
  color: #ef4444;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #b91c1c;
  font-size: 0.875rem;
}

.alert-error svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.btn-login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #003f87 0%, #0052b3 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(0, 63, 135, 0.3);
}

.btn-login:hover:not(:disabled) {
  box-shadow: 0 6px 25px rgba(0, 63, 135, 0.4);
  transform: translateY(-2px);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}

@media (max-width: 768px) {
  .login-container {
    padding: 2rem 1.5rem;
    max-width: 100%;
  }

  .app-title {
    font-size: 1.5rem;
  }

  .logo-image {
    height: 70px;
  }

  .login-form,
  .form-group {
    gap: 1rem;
  }

  .btn-login,
  .btn-admin-login {
    padding: 0.75rem 1.25rem;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 0.5rem;
  }

  .login-container {
    padding: 1.5rem 1rem;
    border-radius: 12px;
  }

  .app-title {
    font-size: 1.25rem;
  }

  .app-subtitle {
    font-size: 0.85rem;
  }

  .form-input {
    padding: 0.625rem 2.25rem 0.625rem 2.25rem;
    font-size: 16px;
  }

  .input-icon {
    width: 16px;
    height: 16px;
  }
}
</style>
