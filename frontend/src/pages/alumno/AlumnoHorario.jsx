import { obtenerMiHorario } from '../../services/horarioService';
import Horarios from '../../components/Horarios'; 

export default function AlumnoHorario() {
  return (
    <Horarios 
      userRole="alumno"
      fetchHorarios={obtenerMiHorario}
      title="Mi Horario"
    />
  );
}
