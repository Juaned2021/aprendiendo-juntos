import { toast } from './toast';

export const exportarPDF = async (horariosPorDia, userRole) => {
  try {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Horarios', 105, 15, { align: 'center' });

    let yPos = 25;

    horariosPorDia.forEach(({ dia, horarios }) => {
      if (horarios.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(41, 128, 185);
        doc.text(dia, 14, yPos);
        yPos += 5;

        const datos = horarios.map(h => [
          `${h.horaInicio} - ${h.horaFin}`,
          h.materia,
          h.profesor || `${h.grado}° ${h.grupo}`,
          userRole === 'admin' ? `${h.clase.grado} ${h.clase.grupo}` : `Aula ${h.aula}`,
          userRole === 'admin' ? `Aula ${h.aula}` : h.tipo
        ]);

        const head = userRole === 'admin'
          ? [['Hora', 'Materia', 'Profesor', 'Clase', 'Aula']]
          : [['Hora', 'Materia', 'Clase', 'Aula', 'Tipo']];

        autoTable(doc, {
          head: head,
          body: datos,
          startY: yPos,
          margin: { left: 14 },
          styles: { fontSize: 9 },
          headStyles: { fillColor: [41, 128, 185] }
        });

        yPos = doc.lastAutoTable.finalY + 10;

        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      }
    });

    doc.save('horarios.pdf');
    toast.success('PDF exportado correctamente');
  } catch (error) {
    toast.error('Error al exportar PDF: ' + error.message);
  }
};

export const exportarExcel = async (horariosPorDia) => {
  try {
    const XLSX = await import('xlsx');

    const datos = horariosPorDia.map(({ dia, horarios }) => ({
        'Día': dia,
        'Hora Inicio': horarios.map(h => h.horaInicio).join(', '),
        'Hora Fin': horarios.map(h => h.horaFin).join(', '),
        'Materias': horarios.map(h => h.materia).join(', '),
        'Profesores': horarios.map(h => h.profesor).join(', '),
        'Clases': horarios.map(h => `${h.clase?.grado || 'N/A'}° ${h.clase?.grupo || 'N/A'}`).join(', '),
        'Aulas': horarios.map(h => h.aula || 'N/A').join(', '),
        'Tipos': horarios.map(h => h.tipo).join(', ')
      }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Horarios');
    XLSX.writeFile(wb, 'horarios.xlsx');
    toast.success('Excel exportado correctamente');
  } catch (error) {
    toast.error('Error al exportar Excel: ' + error.message);
  }
};
