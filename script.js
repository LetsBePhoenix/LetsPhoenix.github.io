document.addEventListener('DOMContentLoaded', () => {
    const link = document.getElementById('stylesheet');
    const select = document.getElementById('style-select');

    // Gespeicherten Stil laden, Standard = Phoenix
    const savedStyle = localStorage.getItem('selectedStyle') || 'style_Phoenix.css';
    link.href = savedStyle;
    select.value = savedStyle;

    // Stil wechseln
    select.addEventListener('change', () => {
        const style = select.value;

        // Auf das Laden des Styles warten, bevor wir es anzeigen
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = style;
        newLink.onload = () => {
            // Alten Link entfernen
            link.remove();
            newLink.id = 'stylesheet';
            localStorage.setItem('selectedStyle', style);
        };
        document.head.appendChild(newLink);
    });
});