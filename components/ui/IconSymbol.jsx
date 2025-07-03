// Fallback for using MaterialIcons on Android and web.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const iconMapping = {
  'house.fill': 'home',
  'pawprint.fill': 'pets',
  'leaf.fill': 'eco',
  'chart.bar.fill': 'bar-chart',
  'person.fill': 'person',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}) {
  const iconName = iconMapping[name] || 'help';
  
  return (
    <MaterialIcons
      name={iconName}
      size={size}
      color={color}
      style={style}
    />
  );
} 