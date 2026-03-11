import { useParams, useNavigate } from 'react-router-dom';
import AddRound from './AddRound';

export default function EditRound({ rounds, onEdit }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const round = rounds.find((r) => r.id === id);

  if (!round) {
    return (
      <div className="p-6 text-slate-400 font-mono">Round not found.</div>
    );
  }

  return (
    <AddRound
      initialRound={round}
      onEdit={(data) => {
        onEdit(id, data);
        navigate('/history');
      }}
    />
  );
}
