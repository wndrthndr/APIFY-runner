import React from 'react';
import { Actor } from '../types/apify';
import { Bot, ChevronDown } from 'lucide-react';

interface ActorSelectorProps {
  actors: Actor[];
  selectedActor: Actor | null;
  onActorSelect: (actor: Actor) => void;
  isLoading: boolean;
}

const ActorSelector: React.FC<ActorSelectorProps> = ({
  actors,
  selectedActor,
  onActorSelect,
  isLoading
}) => {
  return (
    <div className="mb-8">
      <label htmlFor="actor-select" className="block text-sm font-medium text-gray-700 mb-3">
        Select an Actor
      </label>
      <div className="relative">
        <select
          id="actor-select"
          value={selectedActor?.id || ''}
          onChange={(e) => {
            const actor = actors.find(a => a.id === e.target.value);
            if (actor) onActorSelect(actor);
          }}
          disabled={isLoading}
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">Choose an actor...</option>
          {actors.map((actor) => (
            <option key={actor.id} value={actor.id}>
              {actor.title || actor.name} ({actor.username})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      
      {selectedActor && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Bot className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900">{selectedActor.title || selectedActor.name}</h3>
              {selectedActor.description && (
                <p className="text-sm text-blue-700 mt-1">{selectedActor.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActorSelector;