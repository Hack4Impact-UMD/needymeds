import { Colors } from '@/constants/theme';

export function useThemeColor(props: { default?: string }, colorName: keyof typeof Colors.default) {
  const theme = 'default';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
