var N = 1
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
    console.log("click")

    // offset per il centro del viewport
    const viewportRect = viewport.getBoundingClientRect();
    offsetX = event.clientX - (viewportRect.left + viewportRect.width / 2);
    offsetY = event.clientY - (viewportRect.top + viewportRect.height / 2);
}

function endDrag() {
    console.log("un-click")
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