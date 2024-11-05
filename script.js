// Funktion, um den gespeicherten Stil zu laden
function loadStyle() {
    const savedStyle = localStorage.getItem('selectedStyle');
    if (savedStyle) {
        document.getElementById('stylesheet').href = savedStyle;
        document.getElementById('style-select').value = savedStyle;
    }
    else{
        document.getElementById('stylesheet').href = "style_Phoenix";
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
