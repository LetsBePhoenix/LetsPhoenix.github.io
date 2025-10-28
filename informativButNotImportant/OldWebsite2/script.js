// Funktion, um den gespeicherten Stil zu laden
function loadStyle() {
    const savedStyle = localStorage.getItem('selectedStyle');
    const defaultStyle = 'style_Phoenix.css'; // Standardstil festlegen

    if (savedStyle) {
        document.getElementById('stylesheet').href = savedStyle;
        document.getElementById('style-select').value = savedStyle;
    } else {
        // Standardstil anwenden, wenn kein Stil gespeichert ist
        document.getElementById('stylesheet').href = defaultStyle;
        document.getElementById('style-select').value = defaultStyle;
    }
}

// Event-Listener, um den Stil zu ändern und zu speichern
document.getElementById('style-select').addEventListener('change', function() {
    const selectedStyle = this.value;
    document.getElementById('stylesheet').href = selectedStyle;
    localStorage.setItem('selectedStyle', selectedStyle);
});

// Beim Laden der Seite den gespeicherten Stil anwenden
window.onload = loadStyle;
