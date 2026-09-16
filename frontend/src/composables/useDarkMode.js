import { ref, watch } from 'vue'

const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

export function useDarkMode() {
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
  }

  watch(isDarkMode, (newVal) => {
    localStorage.setItem('theme', newVal ? 'dark' : 'light')
    if (newVal) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, { immediate: true })

  return {
    isDarkMode,
    toggleDarkMode
  }
}
