/**
 * exportar_pdf.js
 * VERSIÓN COMPLETA CON MARCA DE AGUA ALEATORIA
 */

async function generarCuadernilloPDF(datosHojas, nombreArchivoUsuario, mapaImagenes) {

  if (!datosHojas || datosHojas.length === 0) {
    alert("No hay datos cargados.");
    return;
  }

  const nombreFinal = nombreArchivoUsuario
    ? `${nombreArchivoUsuario}.pdf`
    : 'Cuadernillo_Fonologico.pdf';

  const overlay = document.createElement('div');

  overlay.style.cssText = `
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:rgba(56, 189, 248, 0.95);
    z-index:999999;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    color:white;
    font-family:sans-serif;
    backdrop-filter:blur(5px);
  `;

  overlay.innerHTML = `
    <h2 style="font-size:24px; font-weight:bold;">
      GENERANDO PDF...
    </h2>
    <p>Aplicando marcas de agua y seguridad...</p>
  `;

  document.body.appendChild(overlay);

  try {

    const pdf = new jspdf.jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const obtenerImagen = (nombre) => {
      return new Promise((resolve) => {

        if (!mapaImagenes || !mapaImagenes[nombre])
          return resolve(null);

        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);

        img.src = mapaImagenes[nombre];
      });
    };

    let esPrimeraPagina = true;
    let contadorGlobal = 1;

    // ==============================
    // GENERACIÓN DE CONTENIDO
    // ==============================

    for (let h = 0; h < datosHojas.length; h++) {

      const nivel = datosHojas[h];
      const ejercicios = nivel.ejercicios || [];

      for (let i = 0; i < ejercicios.length; i += 2) {

        if (!esPrimeraPagina) {
          pdf.addPage();
        }

        esPrimeraPagina = false;

        // ---- Título Nivel ----

        pdf.setFontSize(18);
        pdf.setTextColor(30, 41, 59);
        pdf.text((nivel.nombre || "NIVEL").toUpperCase(), 40, 50);

        pdf.setDrawColor(56, 189, 248);
        pdf.setLineWidth(2);
        pdf.line(40, 60, pageWidth - 40, 60);

        const par = ejercicios.slice(i, i + 2);
        let currentY = 80; // posición vertical dinámica real

        for (let j = 0; j < par.length; j++) {
            const yOffset = currentY;

          const ej = par[j];

          const panelX = 40;
          const panelWidth = pageWidth - 80;
         const panelHeight = 280;
          const panelY = yOffset - 10;

          // ---- Fondo blanco limpio ----

          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(panelX, panelY, panelWidth, panelHeight, 25, 25, 'F');

          // ---- Borde alternado ----

          if (j % 2 === 0) {
            pdf.setDrawColor(59, 130, 246);
          } else {
            pdf.setDrawColor(236, 72, 153);
          }

          pdf.setLineWidth(3);
          pdf.roundedRect(panelX, panelY, panelWidth, panelHeight, 25, 25);

          // ---- Línea decorativa superior ----

          pdf.setDrawColor(250, 204, 21);
          pdf.setLineWidth(5);
          pdf.line(panelX + 25, panelY + 25, panelX + panelWidth - 25, panelY + 25);

          // ---- Imagen PNG sincronizada ----

          const nombreImg = `img${contadorGlobal.toString().padStart(3, '0')}.png`;
          const imgElement = await obtenerImagen(nombreImg);

          if (imgElement) {
            pdf.addImage(
              imgElement,
              'PNG',
              (pageWidth / 2) - 95,
              yOffset + 30,
              190,
              190
            );
          }

          // ---- Palabra y Huecos ----

          const letras = ej.palabra.toUpperCase().split('');
          let startX = (pageWidth / 2) - (letras.length * 22);

          pdf.setFontSize(30);

          letras.forEach((letra, idx) => {

            if (ej.huecos.includes(idx)) {

              pdf.setDrawColor(250, 204, 21);
              pdf.setLineWidth(2);
             pdf.line(startX, yOffset + 250, startX + 30, yOffset + 250);

            } else {

              pdf.setTextColor(30, 41, 59);
              pdf.text(letra, startX + 5, yOffset + 245);
            }

            startX += 45;
          });

          // ---- Opciones de recorte ----

          // Opciones de recorte (FUERA DEL PANEL)
let opcionesY = panelY + panelHeight + 35;// siempre debajo del panel



let optX = (pageWidth / 2) - (ej.opciones.length * 30);

ej.opciones.forEach(opt => {
  pdf.setDrawColor(150);
  pdf.setLineDashPattern([2, 2], 0);
  pdf.circle(optX + 20, opcionesY, 20, 'S');
  pdf.setLineDashPattern([], 0);

  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(18);
  pdf.text(opt, optX + 13, opcionesY + 7);

  optX += 60;
});

    currentY = opcionesY + 80;

          contadorGlobal++;
        }
      }
    }

    // ==============================
    // MARCA DE AGUA Y FOOTER
    // ==============================

    const totalPages = pdf.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {

      pdf.setPage(i);

      // ---- Marca vertical ----

      const watermarkText = "FB: SUPER CURSOS TELGAM";

      pdf.setFontSize(14);
      pdf.setTextColor(210, 210, 210);

      const textWidth = pdf.getTextWidth(watermarkText);
      const margin = 30;
      const minY = margin + textWidth;
      const maxY = pageHeight - margin;
      const randomY = Math.random() * (maxY - minY) + minY;

      pdf.text(watermarkText, 15, randomY, { angle: 90 });

      // ---- Footer horizontal ----

      const footerText = "FB: SUPER CURSOS TELGAM www.narrion.site";

      pdf.setFontSize(9);
      pdf.setTextColor(140, 140, 140);

      const footerWidth = pdf.getTextWidth(footerText);
      const minX = margin;
      const maxX = pageWidth - footerWidth - margin;
      const randomX = Math.random() * (maxX - minX) + minX;

      pdf.text(footerText, randomX, pageHeight - 15);
    }

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);

    // Vista previa
    window.open(url, '_blank');

  } catch (e) {

    console.error(e);
    alert("Error al generar PDF.");

  } finally {

    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }
}
