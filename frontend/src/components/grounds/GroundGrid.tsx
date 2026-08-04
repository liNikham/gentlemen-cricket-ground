import React from 'react';
import { Building, Plus } from 'lucide-react';
import { Ground } from '../../types/ground.types';
import { GroundCard } from './GroundCard';

interface GroundGridProps {
  grounds: Ground[];
  isAdmin: boolean;
  onBook: (ground: Ground) => void;
  onEdit: (ground: Ground) => void;
  onAddGround: () => void;
}

export const GroundGrid: React.FC<GroundGridProps> = ({
  grounds,
  isAdmin,
  onBook,
  onEdit,
  onAddGround,
}) => {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-outfit font-bold text-zinc-100 flex items-center gap-2">
            <Building size={20} className="text-amber-500" />
            Available Cricket Grounds ({grounds.length})
          </h3>
          <p className="text-xs text-zinc-400 font-inter mt-1">
            Browse grounds, check 30-day advance slots, custom morning & evening pricing, facilities, and contact details.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onAddGround}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer text-xs shrink-0 self-start sm:self-auto"
          >
            <Plus size={16} />
            Add New Cricket Ground
          </button>
        )}
      </div>

      {grounds.length === 0 ? (
        <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center font-inter">
          <Building className="text-zinc-600 mb-3" size={40} />
          <p className="text-zinc-300 text-sm font-semibold mb-1">No Cricket Grounds Available Yet</p>
          <p className="text-zinc-500 text-xs mb-4">Ground details added by administrators will appear here.</p>
          {isAdmin && (
            <button
              onClick={onAddGround}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={14} />
              Add First Ground
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {grounds.map((ground) => (
            <GroundCard
              key={ground.id}
              ground={ground}
              isAdmin={isAdmin}
              onBook={onBook}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </section>
  );
};
