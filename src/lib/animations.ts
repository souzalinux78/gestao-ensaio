/**
 * Helpers para animações e transições
 */

/**
 * Classes de animação para elementos comuns
 */
export const animationClasses = {
  fadeIn: 'animate-fade-in',
  scaleIn: 'animate-scale-in',
  slideInRight: 'animate-slide-in-right',
  slideInLeft: 'animate-slide-in-left',
  slideInUp: 'animate-slide-in-up',
  slideInDown: 'animate-slide-in-down',
  stagger: 'stagger-item',
};

/**
 * Classes de hover para elementos interativos
 */
export const hoverClasses = {
  lift: 'hover-lift',
  scale: 'hover-scale',
  glow: 'hover-glow',
  link: 'link-hover',
};

/**
 * Classes de transição
 */
export const transitionClasses = {
  default: 'transition-default',
  smooth: 'transition-all duration-300 ease-in-out',
  fast: 'transition-all duration-150 ease-out',
  slow: 'transition-all duration-500 ease-in-out',
};

/**
 * Gera delay de animação para stagger effect
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
  return index * baseDelay;
}

/**
 * Gera style para stagger animation
 */
export function getStaggerStyle(index: number, baseDelay: number = 50): React.CSSProperties {
  return {
    animationDelay: `${getStaggerDelay(index, baseDelay)}ms`,
  };
}
