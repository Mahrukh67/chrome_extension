document.getElementById('pick-color').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: pickColor,
    });
});

chrome.runtime.onMessage.addListener((request) => {
    if (request.color) {
        const colorDisplay = document.getElementById('color-display');
        const colorCode = document.getElementById('color-code');
        const colorImage = document.getElementById('color-image');

        colorCode.textContent = request.color;
        colorImage.src = request.image;

        // Copy color to clipboard
        document.getElementById('copy-color').addEventListener('click', () => {
            navigator.clipboard.writeText(request.color).then(() => {
                alert('Color copied to clipboard!');
            });
        });
    }
});

function pickColor() {
    const pickerImage = chrome.runtime.getURL("icons/picker.png");

    const image = new Image();
    image.src = pickerImage;

    image.onload = function() {
        document.body.appendChild(image);
        image.style.position = 'absolute';
        image.style.pointerEvents = 'none';

        document.addEventListener('mousemove', (event) => {
            image.style.top = `${event.pageY}px`;
            image.style.left = `${event.pageX}px`;
        });

        document.addEventListener('click', (event) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            context.drawImage(document.body, 0, 0, window.innerWidth, window.innerHeight);

            const imageData = context.getImageData(event.pageX, event.pageY, 1, 1).data;
            const [r, g, b] = imageData;
            const hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

            chrome.runtime.sendMessage({ color: hexColor, image: pickerImage });
            image.remove();
        }, { once: true });
    };

    image.onerror = function() {
        console.error("Failed to load image.");
    };
}

