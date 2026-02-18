// exportarpdf.js
// VERSIÓN PREMIUM: Soporte para URLs externas y carga manual de datos.

async function generarPDF(data,nombreArchivo = "Comprension_Lectora") {
    if (!data || !data.stories) {
        alert("No hay datos para exportar.");
        return;
    }

    // --- 1. CONFIGURACIÓN VISUAL (CSS INYECTADO) ---
    const estilosPDF = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');
            
            * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
            body, html { margin: 0; padding: 0; width: 100%; }
            .pdf-container { 
                font-family: 'Fredoka', sans-serif; 
                color: #334155; 
                background: #fff;
                width: 1122px; 
                margin: 0; padding: 0;
            }
            .page {
                position: relative; width: 1122px; height: 790px; padding: 35px;   
                background-color: #ffffff;
                background-image: radial-gradient(#e0f2fe 15%, transparent 16%);
                background-size: 25px 25px;
                page-break-after: always; overflow: hidden; display: flex;
                flex-direction: column; border: 12px solid #7dd3fc; 
            }
            .page:last-child { page-break-after: avoid; margin-bottom: 0; }
            .header {
                display: flex; justify-content: space-between; align-items: center;
                background: #fff; padding: 10px 25px; border-radius: 20px;
                border: 3px dashed #7dd3fc; margin-bottom: 20px;
                box-shadow: 0 5px 0 #bae6fd; height: 60px;
            }
            .header-title { font-size: 22px; font-weight: 700; color: #0284c7; }
            .header-pag { font-size: 14px; color: #0284c7; font-weight: 700; background: #e0f2fe; padding: 5px 15px; border-radius: 50px;}
            .content-grid { display: flex; gap: 20px; flex: 1; height: calc(100% - 80px); }
            .col-story {
                flex: 1.1; background-color: #fffef3; border: 4px solid #fde047;
                border-radius: 25px; padding: 20px; display: flex;
                flex-direction: column; align-items: center; position: relative;
                box-shadow: 6px 6px 0 rgba(253, 224, 71, 0.3);
            }
            .story-img-container {
                width: 70%; height: 250px; margin-bottom: 20px;
                border-radius: 25px; overflow: hidden; border: 6px solid white;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1); background-color: #f1f5f9; flex-shrink: 0;
            }
            .story-img { width: 100%; height: 100%; object-fit: cover; }
            .story-text {
                font-size: 20px; line-height: 1.8; text-align: justify;
                color: #444; width: 100%; font-weight: 400; letter-spacing: 0.2px;
            }
            .story-text p { margin-bottom: 8px; text-indent: 10px; }
            .highlight-word {
                display: inline-block; background: #fef08a; color: #a16207;
                padding: 0 6px; margin: 0 1px; border-radius: 8px;
                font-weight: 600; border-bottom: 2px dashed #eab308;
            }
            .col-quiz {
                flex: 0.9; background-color: #f0f9ff; border: 4px dashed #93c5fd;
                border-radius: 25px; padding: 20px; display: flex;
                flex-direction: column; box-shadow: 6px 6px 0 rgba(147, 197, 253, 0.3);
            }
            .quiz-title { color: #1d4ed8; font-size: 20px; font-weight: 800; text-align: center; margin-bottom: 15px; }
            .question-box {
                background: white; border-radius: 15px; padding: 12px 15px;
                margin-bottom: 12px; border: 2px solid #dbeafe; position: relative;
            }
            .question-num {
                position: absolute; top: -10px; left: -10px; background: #f472b6;
                color: white; width: 24px; height: 24px; border-radius: 8px;
                text-align: center; line-height: 24px; font-weight: bold;
                font-size: 14px; transform: rotate(-10deg); box-shadow: 2px 2px 0 #db2777;
            }
            .question-text { font-weight: 600; color: #1e3a8a; margin-bottom: 8px; font-size: 14px; padding-left: 10px; }
            .option-item { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 5px; color: #475569; }
            .circle { width: 14px; height: 14px; border: 2px solid #93c5fd; border-radius: 50%; display: inline-block; }
        </style>
    `;

    const contenedor = document.createElement('div');
    contenedor.id = 'print-container';
    contenedor.style.position = 'fixed';
    contenedor.style.top = '0';
    contenedor.style.left = '0';
    contenedor.style.width = '1122px';
    contenedor.style.zIndex = '99999';
    contenedor.style.opacity = '0'; // Oculto visualmente pero renderizable

    contenedor.innerHTML = `<div id="pdf-render-area" class="pdf-container">${estilosPDF}</div>`;
    document.body.appendChild(contenedor);
    const pdfContent = document.getElementById('pdf-render-area');
    let paginasHTML = '';

    // --- PORTADA ---
    paginasHTML += `
        <div class="page" style="justify-content:center; align-items:center; text-align:center;">
            <div style="border: 6px solid #3b82f6; padding: 40px; border-radius: 40px; background:white; width: 85%; box-shadow: 12px 12px 0 #dbeafe;">
                <div style="font-size:80px; margin-bottom:10px;">🦖 ✨ 📖</div>
                <h1 style="font-size:55px; color:#1d4ed8; margin:0; font-weight:800; letter-spacing:-1px;">LECTURA CON MI PERSONAJE FAVORITO</h1>
                <h2 style="font-size:24px; color:#f59e0b; margin-top:5px; font-weight:600;">MI LIBRO MÁGICO DE CUENTOS</h2>
                <div style="margin-top:40px; border-bottom: 4px dashed #94a3b8; width: 60%; margin-left:20%; height:40px;"></div>
                <p style="color:#94a3b8; font-size:14px; font-weight:bold; margin-top:10px;">NOMBRE DEL EXPLORADOR</p>
            </div>
        </div>
    `;

    // --- CUENTOS ---
    data.stories.forEach((story, idx) => {
        const backupImg = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${story.title}&radius=10&backgroundColor=b6e3f4`;
        
        // MODIFICACIÓN: Detectar si es URL completa (http) o archivo local
        let imgPath = story.image || backupImg;
        if (story.image && !story.image.startsWith('http') && !story.image.startsWith('data:')) {
            imgPath = `${story.image}.png`;
        }

        // Lógica de resaltado (keywords)
        const allKeywords = new Set();
        if (story.activities) {
            story.activities.forEach(act => {
                if (act.keywords) act.keywords.forEach(k => allKeywords.add(k.toLowerCase()));
            });
        }

        const paragraphsHTML = story.text.map(paragraph => {
            let processedPara = paragraph;
            allKeywords.forEach(key => {
                const regex = new RegExp(`\\b(${key})\\b`, 'gi');
                processedPara = processedPara.replace(regex, `<span class="highlight-word">$1</span>`);
            });
            return `<p>${processedPara}</p>`;
        }).join('');

        paginasHTML += `
            <div class="page">
                <div class="header">
                    <div class="header-title">🌟 Cuento #${idx + 1}: ${story.title}</div>
                    <div class="header-pag">Página ${idx + 1}</div>
                </div>

                <div class="content-grid">
                    <div class="col-story">
                        <div class="story-img-container">
                            <img src="${imgPath}" class="story-img" crossorigin="anonymous" onerror="this.src='${backupImg}';">
                        </div>
                        <div class="story-text">
                            ${paragraphsHTML}
                        </div>
                    </div>

                    <div class="col-quiz">
                        <h3 class="quiz-title">🧩 ¡Reto Divertido!</h3>
                        <div class="quiz-content">
                            ${story.activities.map((act, i) => `
                                <div class="question-box">
                                    <div class="question-num">${i + 1}</div>
                                    <div class="question-text">${act.question}</div>
                                    ${act.options.map(opt => `
                                        <div class="option-item"><span class="circle"></span> ${opt}</div>
                                    `).join('')}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    // --- SOLUCIONARIO ---
    paginasHTML += `
        <div class="page" style="background-image: radial-gradient(#fce7f3 15%, transparent 16%); border-color: #f472b6;">
            <div class="header" style="border-color:#f472b6; box-shadow: 0 5px 0 #fbcfe8;">
                <div class="header-title" style="color:#db2777;">🔑 Respuestas Mágicas</div>
                <div class="header-pag" style="background:#fce7f3; color:#db2777;">Fin</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                ${data.stories.map((story, idx) => `
                    <div style="background:white; padding:15px; border-radius:20px; border: 2px solid #fbcfe8;">
                        <div style="font-weight:bold; color:#db2777; margin-bottom:8px; font-size:14px;">${idx+1}. ${story.title}</div>
                        ${story.activities.map((act, i) => `
                            <div style="font-size:11px; margin-bottom:2px;">
                                <b>P${i+1}:</b> ${act.options[act.answer]}
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    pdfContent.innerHTML += paginasHTML;

    // Esperar imágenes y renderizar
    await Promise.all(Array.from(pdfContent.querySelectorAll('img')).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(r => { img.onload = r; img.onerror = r; });
    }));
    await new Promise(r => setTimeout(r, 600));

    const opciones = {
        margin: 0, 
        filename: `${nombreArchivo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, x: 0, y: 0, width: 1122, windowWidth: 1122 },
        jsPDF: { unit: 'px', format: [1122, 794], orientation: 'landscape', hotfixes: ['px_scaling'] }
    };

    try {
        await html2pdf()
            .set(opciones)
            .from(pdfContent)
            .toPdf()
            .get('pdf')
            .then(function (pdf) {
                const totalPages = pdf.internal.getNumberOfPages();
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    const watermarkText = "FB: SUPER CURSOS TELGAM";
                    pdf.setFontSize(14);
                    pdf.setTextColor(210, 210, 210);
                    const textWidth = pdf.getTextWidth(watermarkText);
                    const visualHeight = textWidth;
                    const margin = 30;
                    const minY = margin + visualHeight;
                    const maxY = pageHeight - margin;
                    const randomY = Math.random() * (maxY - minY) + minY;
                    pdf.text(watermarkText, 15, randomY, { angle: 90 });

                    const footerText = "FB: SUPER CURSOS TELGAM   www.narrion.site";
                    pdf.setFontSize(9);
                    pdf.setTextColor(140, 140, 140);
                    const footerWidth = pdf.getTextWidth(footerText);
                    const minX = margin;
                    const maxX = pageWidth - footerWidth - margin;
                    const randomX = Math.random() * (maxX - minX) + minX;
                    pdf.text(footerText, randomX, pageHeight - 15);
                }
            
                   // 👇 AQUÍ ESTÁ LA MAGIA
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
            
            })
    

    } finally {
        document.body.removeChild(contenedor);
        const btn = document.querySelector('button[onclick="botonExportarClick()"]');
        if(btn) { btn.innerHTML = "🖨️ Imprimir Todo en PDF"; btn.disabled = false; }
    }
}