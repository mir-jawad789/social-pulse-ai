
import React from 'react';
import type { GroundingChunk } from '../types';

interface SourceLinkProps {
  chunk: GroundingChunk;
}

export const SourceLink: React.FC<SourceLinkProps> = ({ chunk }) => {
  if (!chunk.web || !chunk.web.uri) {
    return null;
  }

  return (
    <a
      href={chunk.web.uri}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-purple-900/50 text-purple-300 text-sm px-4 py-2 rounded-full hover:bg-fuchsia-500 hover:text-white transition-colors duration-300"
    >
      {chunk.web.title || new URL(chunk.web.uri).hostname}
    </a>
  );
};