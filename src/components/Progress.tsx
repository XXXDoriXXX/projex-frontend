import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import {cn} from "../shared/utils/utils.ts";


const DEFAULT_VALUE = 0;

function Progress({
                      className,
                      value = DEFAULT_VALUE,
                      ...props
                  }: React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>) {


        const clampedValue = Math.max(0, Math.min(100, value!));


    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            className={cn(
                "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
                className,
            )}
            value={clampedValue}
            max={100}
            {...props}
        >
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className="bg-primary h-full w-full flex-1 transition-all"
                style={{ transform: `translateX(-${100 - clampedValue}%)` }}
            />
        </ProgressPrimitive.Root>
    );
}

export { Progress };