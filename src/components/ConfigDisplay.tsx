import React from 'react';
import { GameConfig } from '../types';

interface ConfigDisplayProps {
  config: GameConfig;
}

const ConfigDisplay: React.FC<ConfigDisplayProps> = ({ config }) => {
  return (
    <div className="text-sm text-gray-300 mb-2 text-center">
      Configuration: {config.gridSize} | Ghosts: {config.numGhosts}
    </div>
  );
};

export default ConfigDisplay; 