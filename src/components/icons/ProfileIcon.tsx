import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface ProfileIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

export const ProfileIcon: React.FC<ProfileIconProps> = ({
  size = 24,
  color = '#FFFFFF',
  focused = false,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity={focused ? 1 : 0.9} />
          <Stop offset="100%" stopColor={color} stopOpacity={focused ? 0.8 : 0.6} />
        </LinearGradient>
      </Defs>

      {/* Unique abstract profile shape - geometric modern design */}
      <G>
        {/* Head - diamond/crystal shape */}
        <Path
          d="M12 2L15.5 6L12 10L8.5 6L12 2Z"
          fill={focused ? color : 'none'}
          stroke={color}
          strokeWidth={focused ? 0 : 1.5}
          strokeLinejoin="round"
        />

        {/* Shoulders/Body - angular geometric shape */}
        <Path
          d="M4 22V19C4 16.5 6 14 9 13L12 15L15 13C18 14 20 16.5 20 19V22"
          fill={focused ? color : 'none'}
          stroke={color}
          strokeWidth={focused ? 0 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Connection line from head to body */}
        <Path
          d="M12 10V13"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />

        {/* Decorative accent lines */}
        {focused && (
          <>
            <Circle cx="12" cy="6" r="1" fill={color} opacity={0.5} />
            <Path
              d="M7 18H17"
              stroke={color}
              strokeWidth={1}
              strokeLinecap="round"
              opacity={0.3}
            />
          </>
        )}
      </G>
    </Svg>
  );
};

export default ProfileIcon;
