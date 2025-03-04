/** 
 * MetaScreenshots permette di organizzre e visualizzare 
 * le immagini generate da un'applicaziione 3D
 * { github link }
 *
 * questa libreria necessita l'utilizzo della libreria PanZoom
 * Copyright Timmy Willison and other contributors
 * https://github.com/timmywil/panzoom/blob/main/MIT-License.txt
 *
 *
*/

function init(containerID, minimapID, path, stepMultiRis) {
    /**
     * Inizializza la griglia di immagini e la minimappa.
     * 
     * @param {string} containerID - ID dell'elemento div dentro il quale mettere la griglia.
     * @param {string} minimapID - ID dell'elemento div dentro il quale mettere la minimap.
     * @param {string} path - Percorso degli screenshots.
     * @param {number} stepMultiRis - Numero di livelli multirisoluzione renderizzati.
     */

    console.log('init iniziata')
    const main = document.getElementById(containerID)
    const minimap = document.getElementById(minimapID)

    // creo gli elementi necessari
    var container = document.createElement('div')
    var grid = document.createElement('div')
    var wireframe = document.createElement('div')
    var wireframeToggle = document.createElement("input");
    var viewport = document.createElement('div')

    const maxDim = Math.pow(2, stepMultiRis-1)
    var N = 1   // dimensioni iniziale griglia
    var currentScale = 1
    var visible_images = []
    var wireframeFlag = false

    // set id e classi
    container.id = "container"
    container.className = "image-container"
    grid.id = "grid"
    wireframe.id = "wireframe"
    minimap.id = "minimap"
    viewport.id = "minimap-viewport"
    fillWireframe()

    // funzioni
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
    });

    wireframeToggle.addEventListener("change", function(){
        wireframeFlag = this.checked
        loadImages()
    })

    //funzione che riempie il div wireframe
    function fillWireframe() {
        // Imposta l'ID del div
        wireframe.id = "wireframe";
    
        // Crea lo <span> con classe "label" e testo "wireframe"
        var labelSpan = document.createElement("span");
        labelSpan.className = "label";
        labelSpan.textContent = "wireframe";
    
        // Crea il <label> con classe "switch"
        var switchLabel = document.createElement("label");
        switchLabel.className = "switch";
    
        // Crea l'input checkbox
        wireframeToggle.type = "checkbox";
        wireframeToggle.id = "wireframe-toggle";
    
        // Crea lo <span> con classe "slider round"
        var slider = document.createElement("span");
        slider.className = "slider round";
    
        // Costruisci la struttura
        switchLabel.appendChild(wireframeToggle);
        switchLabel.appendChild(slider);
    
        wireframe.appendChild(labelSpan);
        wireframe.appendChild(switchLabel);
    }
    /////////////////////////////////////////////

    //aggiungo gli elementi alla pagina
    main.appendChild(container)
    container.appendChild(grid)
    main.appendChild(wireframe)
    minimap.appendChild(viewport)

    const panzoom = Panzoom(grid, {
        contain: 'outside',
        minScale: 1, // Zoom minimo
        maxScale: Math.pow(2, stepMultiRis-1),   // Zoom massimo
        startScale: N,  // Zoom iniziale
    })

    // stile CSS
    function injectStyles() {
        const css = `
            .image-container {
                overflow: hidden;
                width: 60%;
                height: 60%;
                margin: 0 auto;
                border: 1px solid rgb(0, 163, 255);
            }
    
            #grid {
                display: grid;
                gap: 0px;
                margin: auto;
                background-color: rgb(164, 243, 255);
                background-image: url("${path}/1-0-0.png");
                background-size: contain;
            }
    
            #grid img, #minimap img {
                position: relative;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
    
            #minimap {
                position: fixed;
                width: 125px;
                height: 125px;
                top: 20px;
                right: 20px;
                background-color: #EEE;
                border: 1px solid rgb(0, 163, 255);
                opacity: 0.9;
                z-index: 1;
                overflow: hidden;
            }
    
            #minimap-viewport {
                position: absolute;
                box-sizing: border-box;
                border: 0.3px solid red;
                background-color: rgba(129, 71, 71, 0.694);
                z-index: 2;
                cursor: move;
            }
    
            #wireframe {
                position: relative;
                top: 15px;
                bottom: 10px;
                width: max-content;
                margin: 0 auto;
                display: flex;
                align-items: center;
                gap: 10px;
            }
    
            .switch {
                position: relative;
                display: inline-block;
                width: 60px;
                height: 34px;
            }
    
            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
    
            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: .4s;
            }
    
            .slider:before {
                position: absolute;
                content: "";
                height: 26px;
                width: 26px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: .4s;
            }
    
            input:checked + .slider {
                background-color: #2196F3;
            }
    
            input:focus + .slider {
                box-shadow: 0 0 1px #2196F3;
            }
    
            input:checked + .slider:before {
                transform: translateX(26px);
            }
    
            .slider.round {
                border-radius: 34px;
            }
    
            .slider.round:before {
                border-radius: 50%;
            }
        `;
    
        const styleElement = document.createElement('style');
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
    }
    
    injectStyles()
    loadImages()

    ///////////////////////////////////////////////////////////////////////////////////
    /// minimap ///

    let isDragging = false
    const minimapRect = minimap.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const gridRect = grid.getBoundingClientRect();
    const img = document.createElement('img');
    img.src = path + `/1-0-0.png`
    minimap.appendChild(img)

    function updateMiniMap() {
        if (isDragging) return;

        const gridRect = grid.getBoundingClientRect();

        const scaleX = minimapRect.width / gridRect.width;
        const scaleY = minimapRect.height / gridRect.height;

        const width = containerRect.width * scaleX;
        const height = containerRect.height * scaleY;

        const x =  Math.abs(gridRect.left - containerRect.left) * scaleX; 
        const y =  Math.abs(gridRect.top - containerRect.top) * scaleY;

        viewport.style.width = `${width}px`;
        viewport.style.height = `${height}px`;
        viewport.style.transform = `translate(${x}px, ${y}px)`; 
    }

    function startDrag(event) {
        isDragging = true;
        event.preventDefault();

        // offset per il centro del viewport
        const viewportRect = viewport.getBoundingClientRect();
        offsetX = event.clientX - (viewportRect.left + viewportRect.width / 2);
        offsetY = event.clientY - (viewportRect.top + viewportRect.height / 2);
    }

    function endDrag() {
        isDragging = false;
    }  

    function drag(event) {
        if (!isDragging) return;

        const viewportRect = viewport.getBoundingClientRect();
        const gridRect = grid.getBoundingClientRect();
        const scale = panzoom.getScale()

        // nuove coordinate dal centro
        let x = event.clientX - minimapRect.left - offsetX - viewport.offsetWidth / 2;
        let y = event.clientY - minimapRect.top - offsetY - viewport.offsetHeight / 2;

        // limite interno minimap
        x = Math.max(0, Math.min(x, minimap.offsetWidth - viewport.offsetWidth));
        y = Math.max(0, Math.min(y, minimap.offsetHeight - viewport.offsetHeight));

        // sposta viewport
        viewport.style.transform = `translate(${x}px, ${y}px)`;
        
        // conversione sistema riferimento
        offsetVecX = viewportRect.width /2 ;
        offsetVecY = viewportRect.height /2 ;
        
        scaleFactor = gridRect.width / scale;
        minimapScaleFactor = minimapRect.width;
        newX = (-(x + offsetVecX) + minimapRect.width / 2);
        newY = (-(y + offsetVecY) + minimapRect.height / 2);

        //sposta grid
        panzoom.pan(newX*(scaleFactor / minimapScaleFactor), newY*(scaleFactor / minimapScaleFactor));

    } 

    grid.addEventListener('panzoompan', updateMiniMap);
    grid.addEventListener('panzoomzoom', updateMiniMap);

    viewport.addEventListener('mousedown', startDrag);
    minimap.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    updateMiniMap()
}
