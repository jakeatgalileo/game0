'use client';

import { cn } from '@/lib/utils';
import { type ComponentProps, memo } from 'react';
import { Streamdown } from 'streamdown';

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_li>ul]:pl-6 [&_li>ol]:pl-6',
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = 'Response';
