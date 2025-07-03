import { SymbolView } from 'expo-symbols';
import React, { useMemo } from 'react';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}) {
  const symbolStyle = useMemo(() => [
    {
      width: size,
      height: size,
    },
    style,
  ], [size, style]);

  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={symbolStyle}
    />
  );
} 