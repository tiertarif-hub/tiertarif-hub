import React from 'react';

// Wählt zufällig eine Text-Option aus.
// Da wir "renderToStaticMarkup" nutzen, wird das Ergebnis fest ins HTML "gebacken".
export const Spin = ({ options }: { options: string[] }) => {
  if (!options || options.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * options.length);
  return <>{options[randomIndex]}</>;
};