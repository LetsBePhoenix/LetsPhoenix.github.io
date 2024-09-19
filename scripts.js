// Darkmode Toggle Functionality
const toggleButton = document.getElementById('darkModeToggle');

// Check for saved theme in localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    toggleButton.textContent = savedTheme === 'dark' ? '☀' : '🌙';
    toggleButton.classList.toggle('darkmode-active', savedTheme === 'dark');
}

toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    // Toggle Button Text and Style
    toggleButton.textContent = isDarkMode ? '☀' : '🌙';
    toggleButton.classList.toggle('darkmode-active', isDarkMode);

    // Save theme preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});
