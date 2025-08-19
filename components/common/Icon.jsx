import React from 'react';
import { 
  Ionicons, 
  MaterialIcons, 
  MaterialCommunityIcons, 
  FontAwesome, 
  FontAwesome5,
  Feather,
  AntDesign,
  Entypo,
  Foundation,
  SimpleLineIcons,
  Octicons,
  Zocial,
  EvilIcons
} from '@expo/vector-icons';

const iconSets = {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
  FontAwesome5,
  Feather,
  AntDesign,
  Entypo,
  Foundation,
  SimpleLineIcons,
  Octicons,
  Zocial,
  EvilIcons
};

export function Icon({ 
  library = 'Feather', 
  name, 
  size = 24, 
  color = '#000', 
  style,
  ...props 
}) {
  const IconComponent = iconSets[library];
  
  if (!IconComponent) {
    console.warn(`Icon library "${library}" not found. Using Feather as fallback.`);
    const FallbackIcon = iconSets.Feather;
    return <FallbackIcon name={name || 'alert-circle'} size={size} color={color} style={style} {...props} />;
  }
  
  if (!name) {
    console.warn('Icon name is required');
    return <IconComponent name="help" size={size} color={color} style={style} {...props} />;
  }
  
  return <IconComponent name={name} size={size} color={color} style={style} {...props} />;
}

// Pre-configured icon components for common use cases
export const TabBarIcon = ({ focused, name, library = 'Feather', color, size = 26 }) => (
  <Icon 
    library={library}
    name={name} 
    size={size} 
    color={color}
    style={{ marginBottom: -3 }}
  />
);

export const HeaderIcon = ({ name, library = 'Feather', color, size = 24, ...props }) => (
  <Icon 
    library={library}
    name={name} 
    size={size} 
    color={color}
    {...props}
  />
);

export const ListIcon = ({ name, library = 'Feather', color, size = 20, ...props }) => (
  <Icon 
    library={library}
    name={name} 
    size={size} 
    color={color}
    {...props}
  />
);

export const CardIcon = ({ name, library = 'Feather', color, size = 32, ...props }) => (
  <Icon 
    library={library}
    name={name} 
    size={size} 
    color={color}
    {...props}
  />
);