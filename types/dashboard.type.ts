export type IconName =
  | 'grid'
  | 'bag'
  | 'users'
  | 'chart'
  | 'settings'
  | 'help'
  | 'search'
  | 'bell'
  | 'menu'
  | 'close'
  | 'download'
  | 'filter'
  | 'chevronDown'
  | 'chevronLeft'
  | 'chevronRight'
  | 'arrowUp'
  | 'arrowDown'
  | 'dots'
  | 'calendar'
  | 'package'
  | 'clock'
  | 'refresh'
  | 'check'
  | 'warning'
  | 'sparkles'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'toggleLeft'
  | 'toggleRight';

export type IconProps = {
  name: IconName;
  className?: string;
};
