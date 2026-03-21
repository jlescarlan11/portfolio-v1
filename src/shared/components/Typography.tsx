import React from 'react';
import type { ElementType, ReactNode } from 'react';

type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'label'
  | 'caption'
  | 'code';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

// Allow time-specific attributes if used as a time element
interface TimeTypographyProps extends TypographyProps {
  dateTime?: string;
}

const variantMap: Record<TypographyVariant, ElementType> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  'body-lg': 'p',
  body: 'p',
  'body-sm': 'p',
  label: 'span',
  caption: 'span',
  code: 'code'
};

export const Typography = ({
  variant = 'body',
  as,
  className = '',
  children,
  ...props
}: TimeTypographyProps): React.JSX.Element => {
  const Component = as ?? variantMap[variant];

  return (
    <Component className={`${variant} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
};
