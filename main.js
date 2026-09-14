// ==========================================================================
// MULTI CAMS - v1.0.0 - CODIGO FINAL
// ==========================================================================

const grid = document.getElementById("grid");
const layoutBtns = document.querySelectorAll(".layout-btn");
const selectors = document.querySelectorAll(".selector");
const urlButtons = document.querySelectorAll(".url-btn");

const modal = document.getElementById("urlModal");
const input = document.getElementById("customUrlInput");
const clearInputBtn = document.getElementById("clearInputBtn");
const acceptModal = document.getElementById("acceptModal");
const cancelModal = document.getElementById("cancelModal");
const closeModalX = document.getElementById("closeModalX");

const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggleSidebar");
const showSidebar = document.getElementById("showSidebar");

const liveClockElement = document.getElementById("liveClock");
const clockZoneElement = document.getElementById("clockZone");


let currentLayout = 1;
let currentSlot = 0;
let streams = ["", "", "", ""];

/* Intercambiar Distribución Dinámica (Sólo cambia visibilidades) */
layoutBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    layoutBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentLayout = parseInt(btn.dataset.layout);
    
    if (window.innerWidth > 900) {
      grid.className = `grid layout-${currentLayout}`;
    }

    syncLayoutVisibility();
  });
});

/* Abre el modal para capturar URL */
urlButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentSlot = parseInt(btn.dataset.slot);
    modal.classList.remove("hidden");
    input.value = streams[currentSlot] || "";
    input.focus();
  });
});

/* Lógica específica para limpiar por completo el input mediante su botón X */
clearInputBtn.addEventListener("click", () => {
  input.value = "";
  input.focus();
});

/* Confirmar y Guardar URL (Actualiza sólo la pantalla afectada) */
acceptModal.addEventListener("click", () => {
  const url = input.value.trim();
  streams[currentSlot] = url;
  
  // 1. Modificar apariencia del botón en la barra lateral
  const targetBtn = document.getElementById(`btn-slot-${currentSlot}`);
  if(url) {
    targetBtn.classList.add("has-url");
    targetBtn.textContent = url;
  } else {
    targetBtn.classList.remove("has-url");
    targetBtn.innerHTML = '<i class="fa-solid fa-link"></i> URL Personalizada';
  }

  // 2. ACTUALIZACIÓN INDIVIDUAL: Cambiar sólo la pantalla correspondiente
  updateSingleStreamContainer(currentSlot, url);

  modal.classList.add("hidden");
});

/* Cancelar Modal */
cancelModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

/* Botón X de cerrar Modal */
closeModalX.addEventListener("click", () => {
  modal.classList.add("hidden");
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") modal.classList.add("hidden");
});

/* Función dedicada a inyectar o limpiar un único reproductor sin tocar el resto */
function updateSingleStreamContainer(slotIndex, url) {
  const streamSlot = document.querySelector(`.stream[data-index="${slotIndex}"]`);
  if (!streamSlot) return;

  const displayIndex = String(slotIndex + 1).padStart(2, '0');

  if (url) {
    streamSlot.innerHTML = `
      <div class="stream-label">Pantalla ${displayIndex}</div>
      <button class="close-stream" data-close="${slotIndex}" title="Eliminar feed">✕</button>
      <iframe src="${url}" allowfullscreen allow="autoplay; encrypted-media"></iframe>
    `;
    
    // Vinculamos el evento de borrado específicamente a este nuevo botón 'X'
    streamSlot.querySelector(".close-stream").addEventListener("click", () => {
      removeSingleStream(slotIndex);
    });
  } else {
    streamSlot.innerHTML = `<div class="placeholder">Pantalla ${displayIndex}</div>`;
  }
}

/* Remueve el stream de un slot específico de forma aislada */
function removeSingleStream(index) {
  streams[index] = "";
  
  // Limpiar botón lateral
  const targetBtn = document.getElementById(`btn-slot-${index}`);
  targetBtn.classList.remove("has-url");
  targetBtn.innerHTML = '<i class="fa-solid fa-link"></i> URL Personalizada';
  
  // Limpiar reproductor de pantalla
  updateSingleStreamContainer(index, "");
}

/* Controla cuáles pantallas se muestran u ocultan según la distribución, sin resetear HTML */
function syncLayoutVisibility() {
  // Sincronizar botones selectores del menú lateral
  selectors.forEach((selector, index) => {
    if (index < currentLayout) {
      selector.classList.remove("hidden");
    } else {
      selector.classList.add("hidden");
    }
  });

  // Sincronizar contenedores físicos en la rejilla de reproducción
  const streamSlots = document.querySelectorAll(".stream");
  streamSlots.forEach((slot, index) => {
    if (index < currentLayout) {
      slot.classList.remove("hidden-slot");
    } else {
      slot.classList.add("hidden-slot");
    }
  });
}

/* Pantalla Completa nativa */
document.getElementById("fullscreenBtn").addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error de ejecución Fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
});

/* Eventos de colapso de Sidebar (Escritorio) */
toggleSidebar.addEventListener("click", () => {
  sidebar.classList.add("hidden-sidebar");
  showSidebar.classList.remove("hidden");
});

showSidebar.addEventListener("click", () => {
  sidebar.classList.remove("hidden-sidebar");
  showSidebar.classList.add("hidden");
});

/* LÓGICA DEL RELOJ EN TIEMPO REAL CON LUXON */
function initLiveClock() {
  if (!liveClockElement) return;

  // Detecta automáticamente la zona horaria del sistema (ej: "America/Lima")
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  if (clockZoneElement) {
    clockZoneElement.textContent = userTimeZone;
  }

  function updateClock() {
    // Obtiene la hora actual respetando la zona horaria del usuario
    const now = luxon.DateTime.now().setZone(userTimeZone);
    // Formato de 24 horas estricto con segundos (HH:mm:ss)
    liveClockElement.textContent = now.toFormat("HH:mm:ss");
  }

  // Ejecuta al instante y luego cada 1000ms (1 segundo)
  updateClock();
  setInterval(updateClock, 1000);
}


// Listener adaptativo para redimensionamiento en vivo
window.addEventListener('resize', () => {
  if (window.innerWidth <= 900) {
    grid.className = "grid"; 
  } else {
    grid.className = `grid layout-${currentLayout}`;
  }
});

// Inicialización de la UI al cargar la web por primera vez
syncLayoutVisibility();
initLiveClock();
