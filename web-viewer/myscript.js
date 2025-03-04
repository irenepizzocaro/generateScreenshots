const stepMultiRis = 7
const maxDim = Math.pow(2, stepMultiRis-1)
var N = 1   // dimensioni iniziale griglia
var currentScale = 1
var visible_images = []
var wireframeFlag = false

const path = "./00sceenshots/hand2";
const minimap = document.getElementById('minimap');
const viewport = document.getElementById('minimap-viewport');
const container = document.getElementById('container');
const grid = document.getElementById('grid');
const wireframeToggle = document.getElementById('wireframe-toggle');

const panzoom = Panzoom(grid, {
    contain: 'outside',
    minScale: 1, // Zoom minimo
    maxScale: Math.pow(2, stepMultiRis-1),   // Zoom massimo
    startScale: N,  // Zoom iniziale
})

function loadImages() { 
    // imposta layout della griglia
    grid.style.gridTemplateColumns = `repeat(${maxDim}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${maxDim}, 1fr)`;

    let old_elements = [ ... visible_images]; //copia
    //  grid element
    for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
            const img = document.createElement('img');

            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='; // segnaposto
            if (wireframeFlag == true) {
                img.dataset.src = path + "/wireframe" +  `/${N}-${x}-${y}.png`; 
            } else {
                img.dataset.src = path + `/${N}-${x}-${y}.png`; 
            }
            
            var span = maxDim/N;
            var X = x * span +1;
            var Y = maxDim - span *(y+1) + 1

            img.style.gridColumn= `${X} / span ${span}`;
            img.style.gridRow = `${Y} / span ${span}`;
            img.style.zIndex--;

            grid.appendChild(img);
            visible_images.push(img);
            observer.observe(img);   // osserva l'immagine            
        }
    }  
    
    setTimeout(() => {
        visible_images.forEach( element => {
            element.style.zIndex++;
        })
        old_elements.forEach(element => {
            element.remove()
            element.style.zIndex--;
        });
    }, 150);   
}


function decreaseGridSize() {
    // Trova l'esponente attuale di 2
    const exponent = Math.log2(N);
    if (exponent > 0) { // Se non è già al valore minimo
        N = Math.pow(2, exponent - 1);
        loadImages();
    }
}

function increaseGridSize() {
    // Trova l'esponente attuale di 2
    const exponent = Math.log2(N);
    if (exponent < stepMultiRis-1) {
        N = Math.pow(2, exponent + 1);
        loadImages();
    }    
}

container.addEventListener('wheel', (event) => {
    panzoom.zoomWithWheel(event)

    currentScale = panzoom.getScale()
    console.log("Zoom attuale:", currentScale)

    // controllo dimensioni griglia
    const currentexponent = Math.log2(N)
    let newexponent = Math.ceil(Math.log2(currentScale))

    if (newexponent < currentexponent) {
        decreaseGridSize()
    } else if (newexponent > currentexponent) {
        increaseGridSize()
    }
})

// Creazione dell'IntersectionObserver
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;

            img.src = img.dataset.src;        // carica l'immagine
            img.removeAttribute('data-src');  // rimuovi l'attributo una volta caricato
            
            observer.unobserve(img);          // smetti di osservare l'immagine
        }
    });
}, {
    root: container,      // area visibile di riferimento
    rootMargin: '2px',    // margine per iniziare a caricare
    //threshold: 0.0005   // percentuale minima dell'immagine visibile per attivare il caricamento
});

wireframeToggle.addEventListener("change", function(){
    wireframeFlag = this.checked
    loadImages()
})

loadImages()